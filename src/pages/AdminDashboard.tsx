import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, FileText, Clock, Award, Plus, LogOut, Shield, Home } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalAttempts: 0,
    pendingGrading: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total students
      const { count: studentsCount } = await supabaseAdmin
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get total exams
      const { count: examsCount } = await supabaseAdmin
        .from('exams')
        .select('*', { count: 'exact', head: true });

      // Get total attempts
      const { count: attemptsCount } = await supabaseAdmin
        .from('exam_attempts')
        .select('*', { count: 'exact', head: true });

      // Get pending grading
      const { count: pendingCount } = await supabaseAdmin
        .from('exam_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      setStats({
        totalStudents: studentsCount || 0,
        totalExams: examsCount || 0,
        totalAttempts: attemptsCount || 0,
        pendingGrading: pendingCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">IELTS Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-red-600 font-medium">Dashboard</Link>
              <Link to="/admin/exams" className="text-gray-700 hover:text-red-600 font-medium">Manage Exams</Link>
              <Link to="/admin/grading" className="text-gray-700 hover:text-red-600 font-medium">Grade Students</Link>
              <span className="text-sm text-gray-500">Administrator</span>
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
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage IELTS mock tests and student progress</p>
          </div>
          <Link
            to="/admin/exams/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Exam
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/exams/create"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Create Exam</h3>
              <p className="text-sm text-gray-600">Create new IELTS mock tests</p>
            </Link>
            
            <Link
              to="/admin/grading"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Grade Students</h3>
              <p className="text-sm text-gray-600">Review and grade student submissions</p>
            </Link>
            
            <Link
              to="/admin/exams"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Award className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Exams</h3>
              <p className="text-sm text-gray-600">View and manage all exams</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;