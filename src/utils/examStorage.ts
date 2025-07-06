import { Exam } from '../types';
import { DatabaseService } from '../lib/database';

export class ExamStorage {
  static async saveExam(exam: Exam): Promise<void> {
    try {
      await DatabaseService.createExam(exam.title, exam.sections);
    } catch (error) {
      console.error('Error saving exam:', error);
      throw error;
    }
  }

  static async getAllExams(): Promise<Exam[]> {
    try {
      const exams = await DatabaseService.getAllExams();
      return exams.map((exam) => ({
        ...exam,
        sections: typeof exam.sections === 'string' ? JSON.parse(exam.sections) : exam.sections,
        createdAt: new Date(exam.created_at),
        isActive: exam.is_active,
        createdBy: 'admin' // Default value since this field is not stored in database
      }));
    } catch (error) {
      console.error('Error getting exams:', error);
      return [];
    }
  }

  static async getExamById(id: string): Promise<Exam | null> {
    try {
      const exam = await DatabaseService.getExamById(id);
      if (!exam) return null;
      
      return {
        ...exam,
        sections: typeof exam.sections === 'string' ? JSON.parse(exam.sections) : exam.sections,
        createdAt: new Date(exam.created_at),
        isActive: exam.is_active,
        createdBy: 'admin' // Default value since this field is not stored in database
      };
    } catch (error) {
      console.error('Error getting exam by id:', error);
      return null;
    }
  }

  static async updateExam(id: string, updatedExam: Exam): Promise<void> {
    try {
      await DatabaseService.updateExam(id, {
        title: updatedExam.title,
        sections: JSON.stringify(updatedExam.sections),
        is_active: updatedExam.isActive
      });
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  static async deleteExam(id: string): Promise<void> {
    try {
      await DatabaseService.deleteExam(id);
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  static async getActiveExams(): Promise<Exam[]> {
    try {
      const exams = await DatabaseService.getActiveExams();
              return exams.map((exam) => ({
          ...exam,
          sections: typeof exam.sections === 'string' ? JSON.parse(exam.sections) : exam.sections,
          createdAt: new Date(exam.created_at),
          isActive: exam.is_active,
          createdBy: 'admin' // Default value since this field is not stored in database
        }));
    } catch (error) {
      console.error('Error getting active exams:', error);
      return [];
    }
  }
}