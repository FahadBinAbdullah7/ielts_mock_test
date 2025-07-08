import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Headphones, PenTool, ArrowLeft, Eye, Calendar, User } from 'lucide-react';
import { ExamAttempt, Exam } from '../types';
import { ExamStorage } from '../utils/examStorage';
import { DatabaseService } from '../lib/database';
import { ScoringSystem } from '../utils/scoring';
import { useAuth } from '../contexts/AuthContext';

const StudentResults: React.FC = () => {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadExamAttempts();
    }
  }, [student]);

  const loadExamAttempts = async () => {
    try {
      setLoading(true);
      const attempts = await DatabaseService.getExamAttemptsByStudent(student!.id);
      setExamAttempts(attempts);
    } catch (error) {
      console.error('Error loading exam attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (attempt: ExamAttempt) => {
    try {
      // Load exam data
      const exam = await ExamStorage.getExamById(attempt.exam_id);
      if (!exam) {
        alert('Exam not found');
        return;
      }

      // Parse attempt data
      const answers = typeof attempt.answers === 'string' 
        ? JSON.parse(attempt.answers) 
        : attempt.answers || {};
      
      const scores = typeof attempt.scores === 'string'
        ? JSON.parse(attempt.scores)
        : attempt.scores || {};

      // Navigate to results page with data
      navigate('/student/exam-results', {
        state: {
          examId: exam.id,
          examTitle: exam.title,
          answers,
          scores,
          overallBand: attempt.overall_band,
          attemptId: attempt.id
        }
      });
    } catch (error) {
      console.error('Error viewing results:', error);
      alert('Error loading exam results');
    }
  };

  const getBandColor = (band: number) => {
    return ScoringSystem.getBandColor(band);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackToDashboard = () => {
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
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
              <button
                onClick={handleBackToDashboard}
                className="text-blue-600 hover:text-blue-700 mr-4 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">My Results</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Exam Results</h1>
            <p className="text-gray-600 mt-2">View your IELTS mock test performance history</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{examAttempts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
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
                <Headphones className="h-8 w-8 text-purple-600" />
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

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <PenTool className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {examAttempts.filter(a => a.status !== 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Exam History</h2>
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
                        onViewResults={handleViewResults}
                        getBandColor={getBandColor}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exam results yet</h3>
                <p className="text-gray-600 mb-4">Take your first IELTS practice test to see results here.</p>
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Take a Practice Test
                </button>
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
  onViewResults: (attempt: ExamAttempt) => void;
  getBandColor: (band: number) => string;
  getStatusColor: (status: string) => string;
}> = ({ attempt, onViewResults, getBandColor, getStatusColor }) => {
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
        <div>
          <div className="text-sm font-medium text-gray-900">{examTitle}</div>
          <div className="text-sm text-gray-500">ID: {attempt.exam_id}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attempt.completed_at 
          ? new Date(attempt.completed_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : new Date(attempt.started_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getBandColor(attempt.overall_band)}`}>
          {attempt.overall_band.toFixed(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(attempt.status)}`}>
          {attempt.status === 'graded' ? 'Graded' : 
           attempt.status === 'completed' ? 'Pending Review' : 
           'In Progress'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {attempt.status !== 'in-progress' && (
          <button
            onClick={() => onViewResults(attempt)}
            className="text-blue-600 hover:text-blue-900 flex items-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Results
          </button>
        )}
      </td>
    </tr>
  );
};

export default StudentResults;