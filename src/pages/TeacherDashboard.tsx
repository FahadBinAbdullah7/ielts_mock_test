import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Clock, Award, Plus } from 'lucide-react';
import Layout from '../components/Layout';

const TeacherDashboard: React.FC = () => {
  const recentExams = [
    { id: '1', title: 'IELTS Academic Practice Test 1', students: 25, avgScore: 6.8, created: '2024-01-15' },
    { id: '2', title: 'IELTS General Training Test 1', students: 18, avgScore: 6.2, created: '2024-01-10' },
    { id: '3', title: 'IELTS Academic Practice Test 2', students: 12, avgScore: 7.1, created: '2024-01-08' }
  ];

  const pendingGrading = [
    { id: '1', student: 'John Doe', exam: 'IELTS Writing Task 2', submitted: '2024-01-16' },
    { id: '2', student: 'Jane Smith', exam: 'IELTS Writing Task 1', submitted: '2024-01-16' },
    { id: '3', student: 'Mike Johnson', exam: 'IELTS Writing Task 2', submitted: '2024-01-15' }
  ];

  return (
    <Layout userRole="teacher">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your IELTS mock tests and student progress</p>
          </div>
          <Link
            to="/teacher/exams/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Exam
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Band Score</p>
                <p className="text-2xl font-bold text-gray-900">6.7</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Exams */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Exams</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-600">{exam.students} students • Avg: {exam.avgScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{exam.created}</p>
                  </div>
                </div>
              ))}
              <Link
                to="/teacher/exams"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Exams
              </Link>
            </div>
          </div>

          {/* Pending Grading */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pending Grading</h2>
            </div>
            <div className="p-6 space-y-4">
              {pendingGrading.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.student}</h3>
                    <p className="text-sm text-gray-600">{item.exam}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{item.submitted}</p>
                    <Link
                      to="/teacher/grading"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Grade Now
                    </Link>
                  </div>
                </div>
              ))}
              <Link
                to="/teacher/grading"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Pending
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/teacher/exams/create"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Create Exam</h3>
              <p className="text-sm text-gray-600">Create new IELTS mock tests</p>
            </Link>
            
            <Link
              to="/teacher/grading"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Grade Students</h3>
              <p className="text-sm text-gray-600">Review and grade student submissions</p>
            </Link>
            
            <Link
              to="/teacher/exams"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Award className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Exams</h3>
              <p className="text-sm text-gray-600">View and manage all your exams</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;