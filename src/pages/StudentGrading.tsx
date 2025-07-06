import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, Award, Eye, Edit } from 'lucide-react';
import Layout from '../components/Layout';
import { ExamAttempt, Exam } from '../types';
import { ExamStorage } from '../utils/examStorage';
import { DatabaseService } from '../lib/database';

const StudentGrading: React.FC = () => {
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [writingScores, setWritingScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamAttempts();
  }, []);

  const loadExamAttempts = async () => {
    try {
      setLoading(true);
      const attempts = await DatabaseService.getAllExamAttempts();
      setExamAttempts(attempts);
    } catch (error) {
      console.error('Error loading exam attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempt = async (attempt: ExamAttempt) => {
    try {
      setSelectedAttempt(attempt);
      const examData = await ExamStorage.getExamById(attempt.exam_id);
      setExam(examData);
      
      // Load existing writing scores and feedback from attempt data
      const existingFeedback = typeof attempt.writing_feedback === 'string' 
        ? JSON.parse(attempt.writing_feedback) 
        : attempt.writing_feedback || {};
      
      const existingScores = typeof attempt.scores === 'string'
        ? JSON.parse(attempt.scores)
        : attempt.scores || {};
      
      setWritingScores(existingScores.writing ? { writing: existingScores.writing } : {});
      setFeedback(existingFeedback);
    } catch (error) {
      console.error('Error loading attempt details:', error);
    }
  };

  const handleScoreChange = (questionId: string, score: number) => {
    setWritingScores(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleFeedbackChange = (questionId: string, feedbackText: string) => {
    setFeedback(prev => ({
      ...prev,
      [questionId]: feedbackText
    }));
  };

  const saveGrading = async () => {
    if (!selectedAttempt) return;

    try {
      // Calculate writing band score
      const writingBand = Object.values(writingScores).length > 0 
        ? Object.values(writingScores).reduce((a, b) => a + b, 0) / Object.values(writingScores).length 
        : 0;
      
      // Get existing scores and add writing score
      const existingScores = typeof selectedAttempt.scores === 'string'
        ? JSON.parse(selectedAttempt.scores)
        : selectedAttempt.scores || {};
      
      const updatedScores = {
        ...existingScores,
        writing: writingBand
      };

      // Update the attempt with writing scores and feedback
      await DatabaseService.updateExamAttempt(selectedAttempt.id, {
        scores: JSON.stringify(updatedScores),
        writing_feedback: JSON.stringify(feedback),
        status: 'graded'
      });

      // Reload attempts to reflect changes
      await loadExamAttempts();
      
      alert('Grading saved successfully!');
      setSelectedAttempt(null);
      setExam(null);
    } catch (error) {
      console.error('Error saving grading:', error);
      alert('Error saving grading. Please try again.');
    }
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'text-green-600 bg-green-50';
    if (band >= 6.5) return 'text-blue-600 bg-blue-50';
    if (band >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <Layout userRole="teacher">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedAttempt && exam) {
    const writingSection = exam.sections.find(s => s.type === 'writing');
    const attemptScores = typeof selectedAttempt.scores === 'string' 
      ? JSON.parse(selectedAttempt.scores) 
      : selectedAttempt.scores || {};
    const attemptAnswers = typeof selectedAttempt.answers === 'string'
      ? JSON.parse(selectedAttempt.answers)
      : selectedAttempt.answers || {};
    
    return (
      <Layout userRole="teacher">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => {
                  setSelectedAttempt(null);
                  setExam(null);
                }}
                className="text-blue-600 hover:text-blue-700 mb-2"
              >
                ← Back to Grading Queue
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Grade Student Submission</h1>
              <p className="text-gray-600 mt-2">
                Student ID: {selectedAttempt.student_id} • Exam: {exam.title}
              </p>
            </div>
            <button
              onClick={saveGrading}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              Save Grading
            </button>
          </div>

          {/* Student Performance Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(attemptScores).map(([section, score]) => (
                <div key={section} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 capitalize">{section}</h3>
                  <div className={`text-2xl font-bold ${getBandColor(score as number)}`}>
                    {score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Tasks Grading */}
          {writingSection && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Writing Tasks</h2>
              
              <div className="space-y-8">
                {writingSection.questions.map((question, index) => {
                  const answer = attemptAnswers[question.id];
                  const wordCount = answer ? answer.split(' ').filter((word: string) => word.length > 0).length : 0;
                  
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Task {index + 1}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Word count: {wordCount} words
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Band Score
                            </label>
                            <select
                              value={writingScores[question.id] || ''}
                              onChange={(e) => handleScoreChange(question.id, parseFloat(e.target.value))}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Band</option>
                              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(band => (
                                <option key={band} value={band}>{band}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded">{question.question}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Student Answer:</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                            {answer || 'No answer provided'}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback & Comments
                        </label>
                        <textarea
                          value={feedback[question.id] || ''}
                          onChange={(e) => handleFeedbackChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Provide detailed feedback on grammar, vocabulary, coherence, task achievement..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Grading</h1>
          <p className="text-gray-600 mt-2">Review and grade student exam submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{examAttempts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-bold text-gray-900">
                  {examAttempts.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {examAttempts.filter(a => a.status === 'graded').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Band Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {examAttempts.length > 0 
                    ? (examAttempts.reduce((sum, a) => sum + a.overall_band, 0) / examAttempts.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Exam Submissions</h2>
          </div>
          
          {examAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Band
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examAttempts.map((attempt) => (
                    <ExamAttemptRow 
                      key={attempt.id} 
                      attempt={attempt} 
                      onViewAttempt={handleViewAttempt}
                      getBandColor={getBandColor}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600">Student exam submissions will appear here for grading.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Component for individual exam attempt row with async exam title loading
const ExamAttemptRow: React.FC<{
  attempt: ExamAttempt;
  onViewAttempt: (attempt: ExamAttempt) => void;
  getBandColor: (band: number) => string;
}> = ({ attempt, onViewAttempt, getBandColor }) => {
  const [examTitle, setExamTitle] = useState('Loading...');

  useEffect(() => {
    const loadExamTitle = async () => {
      try {
        const exam = await ExamStorage.getExamById(attempt.exam_id);
        setExamTitle(exam?.title || 'Unknown Exam');
      } catch {
        setExamTitle('Unknown Exam');
      }
    };
    loadExamTitle();
  }, [attempt.exam_id]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {attempt.student_id}
            </div>
            <div className="text-sm text-gray-500">Student</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{examTitle}</div>
        <div className="text-sm text-gray-500">ID: {attempt.exam_id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : 'In Progress'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getBandColor(attempt.overall_band)}`}>
          {attempt.overall_band}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          attempt.status === 'graded' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {attempt.status === 'graded' ? 'Graded' : 'Pending Review'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onViewAttempt(attempt)}
          className="text-blue-600 hover:text-blue-900 flex items-center"
        >
          {attempt.status === 'graded' ? (
            <>
              <Eye className="h-4 w-4 mr-1" />
              View
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-1" />
              Grade
            </>
          )}
        </button>
      </td>
    </tr>
  );
};

export default StudentGrading;