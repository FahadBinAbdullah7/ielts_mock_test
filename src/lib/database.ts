import { supabase } from './supabase';

interface Student {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface Exam {
  id: string;
  title: string;
  sections: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  answers: string;
  scores: string;
  overall_band: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  writing_feedback: string;
}

interface MediaFile {
  id: string;
  file_name: string;
  file_type: string;
  file_data: string;
  created_at: string;
}

// Database service functions using Supabase

// Database service functions using Supabase
export class DatabaseService {
  // Student operations
  static async createStudent(email: string, name: string, passwordHash: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            email,
            name,
            password_hash: passwordHash
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { insertId: data.id };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  static async getStudentByEmail(email: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting student by email:', error);
      return null;
    }
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting student by id:', error);
      return null;
    }
  }

  // Exam operations
  static async createExam(title: string, sections: unknown) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert([
          {
            title,
            sections: JSON.stringify(sections),
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { insertId: data.id };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  static async getAllExams(): Promise<Exam[]> {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all exams:', error);
      return [];
    }
  }

  static async getActiveExams(): Promise<Exam[]> {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active exams:', error);
      return [];
    }
  }

  static async getExamById(id: string): Promise<Exam | null> {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting exam by id:', error);
      return null;
    }
  }

  static async updateExam(id: string, updates: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { affectedRows: data?.length || 0 };
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  static async deleteExam(id: string) {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { affectedRows: 1 };
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  // Exam attempt operations
  static async createExamAttempt(examId: string, studentId: string) {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .insert([
          {
            exam_id: examId,
            student_id: studentId,
            status: 'in-progress',
            answers: '{}',
            scores: '{}',
            overall_band: 0,
            writing_feedback: '{}'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { insertId: data.id };
    } catch (error) {
      console.error('Error creating exam attempt:', error);
      throw error;
    }
  }

  static async updateExamAttempt(id: string, updates: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { affectedRows: data?.length || 0 };
    } catch (error) {
      console.error('Error updating exam attempt:', error);
      throw error;
    }
  }

  static async getExamAttemptsByStudent(studentId: string): Promise<ExamAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('student_id', studentId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting exam attempts by student:', error);
      return [];
    }
  }

  static async getAllExamAttempts(): Promise<ExamAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all exam attempts:', error);
      return [];
    }
  }

  // Media file operations
  static async saveMediaFile(fileName: string, fileType: string, fileData: string) {
    try {
      // Convert data URL to base64 string for storage
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      
      const { data, error } = await supabase
        .from('media_files')
        .insert([
          {
            file_name: fileName,
            file_type: fileType,
            file_data: base64Data
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return { insertId: data.id };
    } catch (error) {
      console.error('Error saving media file:', error);
      throw error;
    }
  }

  static async getMediaFile(id: string): Promise<MediaFile | null> {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Convert base64 back to data URL for display
        const dataUrl = `data:${data.file_type};base64,${data.file_data}`;
        return {
          ...data,
          file_data: dataUrl
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting media file:', error);
      return null;
    }
  }

  // Admin/Stats operations
  static async getStats() {
    try {
      const [studentsResult, examsResult, attemptsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('exam_attempts').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalStudents: studentsResult.count || 0,
        totalExams: examsResult.count || 0,
        totalAttempts: attemptsResult.count || 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalStudents: 0,
        totalExams: 0,
        totalAttempts: 0
      };
    }
  }
}