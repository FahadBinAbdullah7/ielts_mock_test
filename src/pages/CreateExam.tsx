import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <ExamCreator 
      onSave={handleSaveExam} 
      onCancel={handleCancel} 
      existingExam={existingExam}
    />
  );
};

export default CreateExam;