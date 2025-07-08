import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExamInterface from './pages/ExamInterface';
import ExamResults from './pages/ExamResults';
import StudentResults from './pages/StudentResults';
import CreateExam from './pages/CreateExam';
import ExamManagement from './pages/ExamManagement';
import StudentGrading from './pages/StudentGrading';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/signup" element={<StudentSignup />} />
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* Student Protected Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/exam/:examId" element={
            <ProtectedRoute>
              <ExamInterface />
            </ProtectedRoute>
          } />
          <Route path="/student/results" element={
            <ProtectedRoute>
              <StudentResults />
            </ProtectedRoute>
          } />
          <Route path="/student/exam-results" element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          } />
          
          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/exams" element={
            <AdminProtectedRoute>
              <ExamManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/exams/create" element={
            <AdminProtectedRoute>
              <CreateExam />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/exams/edit/:examId" element={
            <AdminProtectedRoute>
              <CreateExam />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/grading" element={
            <AdminProtectedRoute>
              <StudentGrading />
            </AdminProtectedRoute>
          } />
          
          {/* Redirect any unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;