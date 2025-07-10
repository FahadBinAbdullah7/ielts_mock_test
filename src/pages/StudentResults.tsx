import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, BookOpen, Headphones, PenTool, Home, LogOut, TrendingUp, Calendar, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../lib/database';
import { ExamStorage } from '../utils/examStorage';
import { ScoringSystem } from '../utils/scoring';
import { ExamAttempt } from '../types';

const StudentResults: React.FC = () => {
  const { student, signOut } = useAuth();
  const navigate = useNavigate();
  const [latestAttempt, setLatestAttempt] = useState<ExamAttempt | null>(null);
  const [examTitle, setExamTitle] = useState<string>('');
  const [allAttempts, setAllAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadStudentResults();
    }
  }, [student]);

  const loadStudentResults = async () => {
    try {
      setLoading(true);
      
      // Get all exam attempts for this student
      const attempts = await DatabaseService.getExamAttemptsByStudent(student!.id);
      setAllAttempts(attempts);
      
      // Get the latest completed attempt
      const completedAttempts = attempts.filter(attempt => 
        attempt.status === 'completed' || attempt.status === 'graded'
      );
      
      if (completedAttempts.length > 0) {
        // Sort by completion date and get the latest
        const latest = completedAttempts.sort((a, b) => 
          new Date(b.completed_at || b.started_at).getTime() - 
          new Date(a.completed_at || a.started_at).getTime()
        )[0];
        
        setLatestAttempt(latest);
        
        // Get exam title
        const exam = await ExamStorage.getExamById(latest.exam_id);
        setExamTitle(exam?.title || 'Unknown Exam');
      }
    } catch (error) {
      console.error('Error loading student results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'reading': return BookOpen;
      case 'listening': return Headphones;
      case 'writing': return PenTool;
      default: return Award;
    }
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'text-green-600 bg-green-50';
    if (band >= 6.5) return 'text-blue-600 bg-blue-50';
    if (band >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const viewDetailedResults = () => {
    if (!latestAttempt) return;
    
    const scores = typeof latestAttempt.scores === 'string' 
      ? JSON.parse(latestAttempt.scores) 
      : latestAttempt.scores || {};
    
    const answers = typeof latestAttempt.answers === 'string'
      ? JSON.parse(latestAttempt.answers)
      : latestAttempt.answers || {};
    
    const writingFeedback = typeof latestAttempt.writing_feedback === 'string'
      ? JSON.parse(latestAttempt.writing_feedback)
      : latestAttempt.writing_feedback || {};

    navigate('/student/results/detailed', {
      state: {
        examId: latestAttempt.exam_id,
        examTitle: examTitle,
        answers: answers,
        scores: scores,
        overallBand: latestAttempt.overall_band,
        attemptId: latestAttempt.id,
        writingFeedback: writingFeedback
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
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
              <Home className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">IELTS Student Portal</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/student/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
              <Link to="/student/exams" className="text-gray-700 hover:text-blue-600 font-medium">Exam History</Link>
              <Link to="/student/results" className="text-blue-600 font-medium">Results</Link>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {student?.name}</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-1">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Results</h1>
            <p className="text-gray-600 mt-2">Track your IELTS performance and progress</p>
          </div>

          {/* Latest Result */}
          {latestAttempt ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Latest Exam Result</h2>
                  <p className="text-gray-600">{examTitle}</p>
                  <p className="text-sm text-gray-500">
                    Completed on {new Date(latestAttempt.completed_at || latestAttempt.started_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Overall Band Score</div>
                  <div className={`text-5xl font-bold px-4 py-2 rounded-full ${getBandColor(latestAttempt.overall_band)}`}>
                    {latestAttempt.overall_band}
                  </div>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(latestAttempt.status)}`}>
                      {latestAttempt.status === 'graded' ? 'Graded' : 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {Object.entries(
                  typeof latestAttempt.scores === 'string' 
                    ? JSON.parse(latestAttempt.scores) 
                    : latestAttempt.scores || {}
                ).map(([section, score]) => {
                  const Icon = getSectionIcon(section);
                  return (
                    <div key={section} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900 capitalize mb-2">{section}</h3>
                      <div className={`text-3xl font-bold px-3 py-1 rounded-full ${getBandColor(score as number)}`}>
                        {typeof score === 'number' ? score.toFixed(1) : score}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {ScoringSystem.getPerformanceLevel(score as number)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={viewDetailedResults}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View Detailed Results
                </button>
                <Link
                  to="/student/exams"
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                >
                  View All Attempts
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't completed any exams yet. Take your first IELTS practice test to see your results here.
              </p>
              <Link
                to="/student/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Take Your First Exam
              </Link>
            </div>
          )}

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
                  <p className="text-2xl font-bold text-gray-900">{allAttempts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Band</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allAttempts.length > 0 
                      ? (allAttempts.reduce((sum, attempt) => sum + attempt.overall_band, 0) / allAttempts.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allAttempts.length > 0 
                      ? Math.max(...allAttempts.map(a => a.overall_band)).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Attempts */}
          {allAttempts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Attempts</h2>
                  <Link
                    to="/student/exams"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {allAttempts.slice(0, 5).map((attempt) => (
                    <RecentAttemptCard key={attempt.id} attempt={attempt} getBandColor={getBandColor} getStatusColor={getStatusColor} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for individual recent attempt
const RecentAttemptCard: React.FC<{
  attempt: ExamAttempt;
  getBandColor: (band: number) => string;
  getStatusColor: (status: string) => string;
}> = ({ attempt, getBandColor, getStatusColor }) => {
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
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-medium text-gray-900">{examTitle}</h3>
        <p className="text-sm text-gray-600">
          {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'In Progress'}
        </p>
      </div>
      <div className="text-right flex items-center space-x-3">
        <div>
          <div className={`text-lg font-semibold px-3 py-1 rounded-full ${getBandColor(attempt.overall_band)}`}>
            {attempt.overall_band}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(attempt.status)}`}>
          {attempt.status === 'graded' ? 'Graded' : attempt.status === 'completed' ? 'Pending Review' : 'In Progress'}
        </span>
      </div>
    </div>
  );
};

export default StudentResults;