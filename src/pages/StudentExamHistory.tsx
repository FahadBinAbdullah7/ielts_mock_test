import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Clock, Award, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../lib/database';
import { ExamStorage } from '../utils/examStorage';
import { ExamAttempt, Exam } from '../types';

const StudentExamHistory: React.FC = () => {
  const { student } = useAuth();
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadExamHistory();
    }
  }, [student]);

  const loadExamHistory = async () => {
    try {
      setLoading(true);
      const attempts = await DatabaseService.getExamAttemptsByStudent(student!.id);
      setExamAttempts(attempts);
    } catch (error) {
      console.error('Error loading exam history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAttempt = async (attempt: ExamAttempt) => {
    try {
      const examData = await ExamStorage.getExamById(attempt.exam_id);
      setExam(examData);
      setSelectedAttempt(attempt);
    } catch (error) {
      console.error('Error loading exam details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'text-green-600 bg-green-50';
    if (band >= 6.5) return 'text-blue-600 bg-blue-50';
    if (band >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const isCorrectAnswer = (question: any, userAnswer: any) => {
    if (!userAnswer) return false;
    
    if (question.type === 'mcq' || question.type === 'true-false') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'fill-blank') {
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer];
      
      if (Array.isArray(userAnswer)) {
        return userAnswer.every((answer, index) => 
          correctAnswers[index]?.toLowerCase().trim() === answer?.toLowerCase().trim()
        );
      } else {
        return correctAnswers.some(ans => 
          ans?.toLowerCase().trim() === userAnswer?.toLowerCase().trim()
        );
      }
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam history...</p>
        </div>
      </div>
    );
  }

  if (selectedAttempt && exam) {
    const attemptAnswers = typeof selectedAttempt.answers === 'string'
      ? JSON.parse(selectedAttempt.answers)
      : selectedAttempt.answers || {};
    
    const attemptScores = typeof selectedAttempt.scores === 'string'
      ? JSON.parse(selectedAttempt.scores)
      : selectedAttempt.scores || {};

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setSelectedAttempt(null);
                    setExam(null);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to History
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Exam Review: {exam.title}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBandColor(selectedAttempt.overall_band)}`}>
                  Overall Band: {selectedAttempt.overall_band}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Section Scores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Section Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(attemptScores).map(([section, score]) => (
                <div key={section} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 capitalize">{section}</h3>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-full ${getBandColor(score as number)}`}>
                    {score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions and Answers */}
          {exam.sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 capitalize">
                {section.name} Section
              </h2>
              
              <div className="space-y-6">
                {section.questions.map((question, questionIndex) => {
                  const userAnswer = attemptAnswers[question.id];
                  const isCorrect = question.type !== 'essay' ? isCorrectAnswer(question, userAnswer) : null;
                  
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Question {questionIndex + 1}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {question.points} {question.points === 1 ? 'point' : 'points'}
                          </span>
                          {isCorrect !== null && (
                            <span className={`flex items-center px-2 py-1 rounded text-sm font-medium ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Correct
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Incorrect
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <p className="text-gray-800 font-medium mb-2">{question.question}</p>
                      </div>

                      {/* Passage (for reading questions) */}
                      {question.passage && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Passage:</h4>
                          <div className="text-gray-700 text-sm whitespace-pre-line">
                            {question.passage}
                          </div>
                        </div>
                      )}

                      {/* Options (for MCQ and True/False) */}
                      {(question.type === 'mcq' || question.type === 'true-false') && question.options && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Options:</h4>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isUserChoice = userAnswer === option;
                              const isCorrectOption = question.correctAnswer === option;
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded border ${
                                    isCorrectOption
                                      ? 'bg-green-50 border-green-200'
                                      : isUserChoice && !isCorrectOption
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-700">{option}</span>
                                    <div className="flex items-center space-x-2">
                                      {isUserChoice && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          Your Answer
                                        </span>
                                      )}
                                      {isCorrectOption && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                          Correct Answer
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Fill in the blank answers */}
                      {question.type === 'fill-blank' && (
                        <div className="mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'No answer provided'}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Correct Answer:</h4>
                              <div className="p-3 bg-green-50 border border-green-200 rounded">
                                {Array.isArray(question.correctAnswer) 
                                  ? question.correctAnswer.join(', ') 
                                  : question.correctAnswer
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Essay answers */}
                      {question.type === 'essay' && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Your Essay:</h4>
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded max-h-64 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm">
                              {userAnswer || 'No essay submitted'}
                            </pre>
                          </div>
                          {userAnswer && (
                            <div className="mt-2 text-sm text-gray-600">
                              Word count: {userAnswer.split(' ').filter((word: string) => word.length > 0).length}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to="/student/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Exam History</h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/student/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
              <Link to="/student/exams" className="text-blue-600 font-medium">Exam History</Link>
              <Link to="/student/results" className="text-gray-700 hover:text-blue-600 font-medium">Results</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Exam History</h1>
            <p className="text-gray-600 mt-2">Review your past exam attempts and performance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{examAttempts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Band</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {examAttempts.length > 0 
                      ? (examAttempts.reduce((sum, attempt) => sum + attempt.overall_band, 0) / examAttempts.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {examAttempts.filter(a => a.status === 'completed' || a.status === 'graded').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {examAttempts.length > 0 
                      ? Math.max(...examAttempts.map(a => a.overall_band)).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Attempts Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Exam Attempts</h2>
            </div>
            
            {examAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Taken
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
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exam attempts yet</h3>
                <p className="text-gray-600 mb-4">Start your IELTS preparation by taking a practice test.</p>
                <Link
                  to="/student/dashboard"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Take Your First Exam
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for individual exam attempt row with async exam title loading
const ExamAttemptRow: React.FC<{
  attempt: ExamAttempt;
  onViewAttempt: (attempt: ExamAttempt) => void;
  getBandColor: (band: number) => string;
  getStatusColor: (status: string) => string;
}> = ({ attempt, onViewAttempt, getBandColor, getStatusColor }) => {
  const [examTitle, setExamTitle] = useState('Loading...');

  useEffect(() => {
    const loadExamTitle = async () => {
      try {
        const exam = await ExamStorage.getExamById(attempt.exam_id);
        setExamTitle(exam?.title || 'Unknown Exam');
      } catch (error) {
        setExamTitle('Unknown Exam');
      }
    };
    loadExamTitle();
  }, [attempt.exam_id]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{examTitle}</div>
        <div className="text-sm text-gray-500">ID: {attempt.exam_id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'In Progress'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getBandColor(attempt.overall_band)}`}>
          {attempt.overall_band}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attempt.status)}`}>
          {attempt.status === 'graded' ? 'Graded' : attempt.status === 'completed' ? 'Pending Review' : 'In Progress'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onViewAttempt(attempt)}
          className="text-blue-600 hover:text-blue-900 flex items-center"
          disabled={attempt.status === 'in-progress'}
        >
          <Eye className="h-4 w-4 mr-1" />
          {attempt.status === 'in-progress' ? 'In Progress' : 'Review Answers'}
        </button>
      </td>
    </tr>
  );
};

export default StudentExamHistory;