import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ExamCreator from '../components/ExamCreator';
import { Exam } from '../types';
import { DatabaseService } from '../lib/database';
import { ExamStorage } from '../utils/examStorage';

const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [existingExam, setExistingExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (examId) {
      loadExistingExam();
    }
  }, [examId]);

  const loadExistingExam = async () => {
    try {
      setLoading(true);
      const exam = await ExamStorage.getExamById(examId!);
      setExistingExam(exam);
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Error loading exam for editing');
      navigate('/admin/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async (exam: Exam) => {
    try {
      if (examId && existingExam) {
        // Update existing exam
        await DatabaseService.updateExam(examId, exam.title, exam.sections, exam.isActive);
        alert(`Exam "${exam.title}" updated successfully!`);
      } else {
        // Create new exam
        await DatabaseService.createExam(exam.title, exam.sections);
        alert(`Exam "${exam.title}" created successfully!`);
      }
      navigate('/admin/exams');
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error saving exam. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/exams');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/admin/exams" className="text-blue-600 hover:text-blue-700 mr-4 flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Exam Management
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exam...</p>
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
              <Link to="/admin/exams" className="text-blue-600 hover:text-blue-700 mr-4 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Exam Management
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {existingExam ? 'Edit Exam' : 'Create New Exam'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
              <Link to="/admin/exams" className="text-blue-600 font-medium">Manage Exams</Link>
              <Link to="/admin/grading" className="text-gray-700 hover:text-blue-600 font-medium">Grade Students</Link>
            </div>
          </div>
        </div>
      </nav>
      
      <ExamCreator 
        onSave={handleSaveExam} 
        onCancel={handleCancel} 
        existingExam={existingExam}
      />
    </div>
  );
};

export default CreateExam;