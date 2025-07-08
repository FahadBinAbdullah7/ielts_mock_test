import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, Award, Eye, Edit, ArrowLeft } from 'lucide-react';
import { ExamAttempt, Exam } from '../types';
import { ExamStorage } from '../utils/examStorage';
import { DatabaseService } from '../lib/database';
import { ScoringSystem } from '../utils/scoring';

const StudentGrading: React.FC = () => {
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [student, setStudent] = useState<any>(null);
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
      
      // Load exam data
      const examData = await ExamStorage.getExamById(attempt.exam_id);
      setExam(examData);
      
      // Load student data
      const studentData = await DatabaseService.getStudentById(attempt.student_id);
      setStudent(studentData);
      
      // Load existing writing scores and feedback from attempt data
      const existingFeedback = typeof attempt.writing_feedback === 'string' 
        ? JSON.parse(attempt.writing_feedback) 
        : attempt.writing_feedback || {};
      
      const existingScores = typeof attempt.scores === 'string'
        ? JSON.parse(attempt.scores)
        : attempt.scores || {};
      
      // Extract writing scores from the scores object
      const writingTaskScores: Record<string, number> = {};
      if (examData?.sections) {
        const writingSection = examData.sections.find(s => s.type === 'writing');
        if (writingSection && existingScores.writing) {
          // If we have a single writing score, distribute it to tasks
          writingSection.questions.forEach((question, index) => {
            writingTaskScores[question.id] = existingScores.writing || 0;
          });
        }
      }
      
      setWritingScores(writingTaskScores);
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
    if (!selectedAttempt || !exam) return;

    try {
      // Calculate writing band score from individual task scores
      const taskScores = Object.values(writingScores);
      const writingBand = taskScores.length > 0 
        ? taskScores.reduce((a, b) => a + b, 0) / taskScores.length 
        : 0;
      
      // Get existing scores and add/update writing score
      const existingScores = typeof selectedAttempt.scores === 'string'
        ? JSON.parse(selectedAttempt.scores)
        : selectedAttempt.scores || {};
      
      const updatedScores = {
        ...existingScores,
        writing: Math.round(writingBand * 10) / 10
      };

      // Calculate new overall band score
      const overallBand = ScoringSystem.calculateOverallBandScore(updatedScores);

      // Update the attempt with writing scores and feedback
      await DatabaseService.updateExamAttempt(selectedAttempt.id, {
        scores: JSON.stringify(updatedScores),
        writing_feedback: JSON.stringify(feedback),
        overall_band: overallBand,
        status: 'graded'
      });

      // Reload attempts to reflect changes
      await loadExamAttempts();
      
      alert('Grading saved successfully!');
      setSelectedAttempt(null);
      setExam(null);
      setStudent(null);
    } catch (error) {
      console.error('Error saving grading:', error);
      alert('Error saving grading. Please try again.');
    }
  };

  const getBandColor = (band: number) => {
    return ScoringSystem.getBandColor(band);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAttempt && exam && student) {
    const writingSection = exam.sections.find(s => s.type === 'writing');
    const attemptScores = typeof selectedAttempt.scores === 'string' 
      ? JSON.parse(selectedAttempt.scores) 
      : selectedAttempt.scores || {};
    const attemptAnswers = typeof selectedAttempt.answers === 'string'
      ? JSON.parse(selectedAttempt.answers)
      : selectedAttempt.answers || {};
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedAttempt(null);
                    setExam(null);
                    setStudent(null);
                  }}
                  className="text-blue-600 hover:text-blue-700 mr-4 flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Grading Queue
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Grade Student Submission</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={saveGrading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Grading
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Student Name</p>
                  <p className="text-lg text-gray-900">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Exam</p>
                  <p className="text-lg text-gray-900">{exam.title}</p>
                </div>
              </div>
            </div>

            {/* Student Performance Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(attemptScores).map(([section, score]) => (
                  <div key={section} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 capitalize">{section}</h3>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-full ${getBandColor(score as number)}`}>
                      {score}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {ScoringSystem.getPerformanceLevel(score as number)}
                    </p>
                  </div>
                ))}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Overall Band</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedAttempt.overall_band}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {ScoringSystem.getPerformanceLevel(selectedAttempt.overall_band)}
                  </p>
                </div>
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
                    const minWords = index === 0 ? 150 : 250;
                    
                    return (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Task {index + 1} {index === 0 ? '(150+ words)' : '(250+ words)'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Word count: <span className={wordCount >= minWords ? 'text-green-600' : 'text-red-600'}>
                                {wordCount} words
                              </span>
                              {wordCount < minWords && (
                                <span className="text-red-600 ml-2">
                                  (Minimum: {minWords} words)
                                </span>
                              )}
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
                          <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm">
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
                            placeholder="Provide detailed feedback on task achievement, coherence and cohesion, lexical resource, and grammatical range and accuracy..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 mr-4">
                ← Back to Dashboard
              </a>
              <h1 className="text-xl font-semibold text-gray-900">Student Grading</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </div>
  );
};

// Component for individual exam attempt row with async exam title and student name loading
const ExamAttemptRow: React.FC<{
  attempt: ExamAttempt;
  onViewAttempt: (attempt: ExamAttempt) => void;
  getBandColor: (band: number) => string;
}> = ({ attempt, onViewAttempt, getBandColor }) => {
  const [examTitle, setExamTitle] = useState('Loading...');
  const [studentName, setStudentName] = useState('Loading...');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [exam, student] = await Promise.all([
          ExamStorage.getExamById(attempt.exam_id),
          DatabaseService.getStudentById(attempt.student_id)
        ]);
        
        setExamTitle(exam?.title || 'Unknown Exam');
        setStudentName(student?.name || 'Unknown Student');
      } catch (error) {
        setExamTitle('Unknown Exam');
        setStudentName('Unknown Student');
      }
    };
    loadData();
  }, [attempt.exam_id, attempt.student_id]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {studentName}
            </div>
            <div className="text-sm text-gray-500">ID: {attempt.student_id}</div>
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