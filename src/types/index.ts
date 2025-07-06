export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
}

export interface Question {
  id: string;
  section: 'reading' | 'listening' | 'writing' | 'speaking';
  type: 'mcq' | 'fill-blank' | 'true-false' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  passage?: string;
  audioUrl?: string;
  imageUrl?: string;
  timeLimit?: number;
}

export interface Exam {
  id: string;
  title: string;
  sections: ExamSection[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface ExamSection {
  id: string;
  name: string;
  type: 'reading' | 'listening' | 'writing' | 'speaking';
  questions: Question[];
  timeLimit: number;
  instructions: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  answers: Record<string, any>;
  scores: Record<string, number>;
  overall_band: number;
  started_at: string;
  completed_at?: string | null;
  status: 'in-progress' | 'completed' | 'graded';
  writing_feedback: Record<string, string>;
}

export interface BandScore {
  section: string;
  score: number;
  band: number;
  feedback: string;
}