import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Client for authenticated users (students)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client - for admin operations, we'll use the same client but with admin session
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          title: string;
          sections: JSON;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          sections: JSON;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          sections?: JSON;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      exam_attempts: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          answers: JSON;
          scores: JSON;
          overall_band: number;
          status: string;
          started_at: string;
          completed_at: string | null;
          writing_feedback: JSON;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          answers?: JSON;
          scores?: JSON;
          overall_band?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          writing_feedback?: JSON;
        };
        Update: {
          id?: string;
          exam_id?: string;
          student_id?: string;
          answers?: JSON;
          scores?: JSON;
          overall_band?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          writing_feedback?: JSON;
        };
      };
      media_files: {
        Row: {
          id: string;
          file_name: string;
          file_type: string;
          file_data: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          file_type: string;
          file_data: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_name?: string;
          file_type?: string;
          file_data?: string;
          created_at?: string;
        };
      };
    };
  };
};