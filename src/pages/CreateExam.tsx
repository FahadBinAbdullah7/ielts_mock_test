import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ExamCreator from '../components/ExamCreator';
import { Exam } from '../types';
import { DatabaseService } from '../lib/database';

const CreateExam: React.FC = () => {
  const navigate = useNavigate();

  const handleSaveExam = async (exam: Exam) => {
    try {
      // Save to database instead of localStorage
      await DatabaseService.createExam(exam.title, exam.sections);
      alert(`Exam "${exam.title}" created successfully!`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error saving exam. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  return (
    <Layout userRole="teacher">
      <ExamCreator onSave={handleSaveExam} onCancel={handleCancel} />
    </Layout>
  );
};

export default CreateExam;