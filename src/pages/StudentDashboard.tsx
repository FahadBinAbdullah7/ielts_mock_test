import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Award, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { ExamStorage } from '../utils/examStorage';
import { DatabaseService } from '../lib/database';
import { Exam, ExamAttempt } from '../types';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { student } = useAuth();
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      loadDashboardData();
    }
  }, [student]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load active exams that students can take
      const activeExams = await ExamStorage.getActiveExams();
      setAvailableExams(activeExams);

      // Load recent exam attempts for this student
      const attempts = await DatabaseService.getExamAttemptsByStudent(student!.id);
      setRecentAttempts(attempts.slice(0, 5)); // Show last 5 attempts
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamTitle = async (examId: string) => {
    try {
      const exam = await ExamStorage.getExamById(examId);
      return exam?.title || 'Unknown Exam';
    } catch (error) {
      return 'Unknown Exam';
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

  if (loading) {
    return (
      <Layout userRole="student">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your IELTS preparation progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Taken</p>
                <p className="text-2xl font-bold text-gray-900">{recentAttempts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Band</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentAttempts.length > 0 
                    ? (recentAttempts.reduce((sum, attempt) => sum + attempt.overall_band, 0) / recentAttempts.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Exams</p>
                <p className="text-2xl font-bold text-gray-900">{availableExams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Graded Exams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentAttempts.filter(attempt => attempt.status === 'graded').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Exams */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Exam Attempts</h2>
                <Link
                  to="/student/exams"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All Attempts
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => (
                  <ExamAttemptCard key={attempt.id} attempt={attempt} />
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exams taken yet</h3>
                  <p className="text-gray-600">Start your IELTS preparation by taking a practice test.</p>
                </div>
              )}
              <Link
                to="/student/exams"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View Exam History
              </Link>
            </div>
          </div>

          {/* Available Exams */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Available Exams</h2>
            </div>
            <div className="p-6 space-y-4">
              {availableExams.length > 0 ? (
                availableExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{exam.title}</h3>
                      <p className="text-sm text-gray-600">
                        {exam.sections.length} sections • {exam.sections.reduce((total, section) => total + section.timeLimit, 0)} minutes
                      </p>
                      <p className="text-sm text-gray-500">
                        {exam.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                      </p>
                    </div>
                    <Link
                      to={`/student/exam/${exam.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Start Exam
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exams available</h3>
                  <p className="text-gray-600">Check back later for new practice tests.</p>
                </div>
              )}
              <Link
                to="/student/exams"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Exams
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trend</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Performance chart would be displayed here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Component to display exam attempt with async exam title loading
const ExamAttemptCard: React.FC<{ attempt: ExamAttempt }> = ({ attempt }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-medium text-gray-900">{examTitle}</h3>
        <p className="text-sm text-gray-600">
          {attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString() : 'In Progress'}
        </p>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-blue-600">
          Band {attempt.overall_band}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(attempt.status)}`}>
          {attempt.status === 'graded' ? 'Graded' : attempt.status === 'completed' ? 'Pending Review' : 'In Progress'}
        </span>
      </div>
    </div>
  );
};

export default StudentDashboard;