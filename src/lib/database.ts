import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

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

export class DatabaseService {
  static async createStudent(email: string, name: string, passwordHash: string) {
    try {
      const studentRef = doc(collection(db, 'students'));
      const studentData = {
        email,
        name,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(studentRef, studentData);
      return { insertId: studentRef.id };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  static async getStudentByEmail(email: string): Promise<Student | null> {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;

      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Student;
    } catch (error) {
      console.error('Error getting student by email:', error);
      return null;
    }
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const docRef = doc(db, 'students', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as Student;
    } catch (error) {
      console.error('Error getting student by id:', error);
      return null;
    }
  }

  static async getAllStudents(): Promise<Student[]> {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  }

  static async createExam(title: string, sections: any) {
    try {
      console.log('Creating exam with title:', title);
      console.log('Sections:', sections);

      const examRef = doc(collection(db, 'exams'));
      const examData = {
        title,
        sections: JSON.stringify(sections),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(examRef, examData);
      console.log('Exam created successfully:', examRef.id);
      return { insertId: examRef.id };
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  static async updateExam(id: string, title: string, sections: any, isActive: boolean) {
    try {
      console.log('Updating exam:', id, title);

      const examRef = doc(db, 'exams', id);
      await updateDoc(examRef, {
        title,
        sections: JSON.stringify(sections),
        is_active: isActive,
        updated_at: new Date().toISOString()
      });

      console.log('Exam updated successfully');
      return { affectedRows: 1 };
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  static async getAllExams(): Promise<Exam[]> {
    try {
      const examsRef = collection(db, 'exams');
      const q = query(examsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
    } catch (error) {
      console.error('Error getting all exams:', error);
      return [];
    }
  }

  static async getActiveExams(): Promise<Exam[]> {
    try {
      const examsRef = collection(db, 'exams');
      const q = query(examsRef, where('is_active', '==', true), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
    } catch (error) {
      console.error('Error getting active exams:', error);
      return [];
    }
  }

  static async getExamById(id: string): Promise<Exam | null> {
    try {
      const docRef = doc(db, 'exams', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as Exam;
    } catch (error) {
      console.error('Error getting exam by id:', error);
      return null;
    }
  }

  static async deleteExam(id: string) {
    try {
      const examRef = doc(db, 'exams', id);
      await deleteDoc(examRef);
      return { affectedRows: 1 };
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  static async createExamAttempt(examId: string, studentId: string) {
    try {
      const attemptRef = doc(collection(db, 'exam_attempts'));
      const attemptData = {
        exam_id: examId,
        student_id: studentId,
        status: 'in-progress',
        answers: '{}',
        scores: '{}',
        overall_band: 0,
        writing_feedback: '{}',
        started_at: new Date().toISOString(),
        completed_at: null
      };

      await setDoc(attemptRef, attemptData);
      return { insertId: attemptRef.id };
    } catch (error) {
      console.error('Error creating exam attempt:', error);
      throw error;
    }
  }

  static async updateExamAttempt(id: string, updates: any) {
    try {
      const attemptRef = doc(db, 'exam_attempts', id);
      await updateDoc(attemptRef, updates);
      return { affectedRows: 1 };
    } catch (error) {
      console.error('Error updating exam attempt:', error);
      throw error;
    }
  }

  static async getExamAttemptsByStudent(studentId: string): Promise<ExamAttempt[]> {
    try {
      const attemptsRef = collection(db, 'exam_attempts');
      const q = query(attemptsRef, where('student_id', '==', studentId), orderBy('started_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExamAttempt[];
    } catch (error) {
      console.error('Error getting exam attempts by student:', error);
      return [];
    }
  }

  static async getAllExamAttempts(): Promise<ExamAttempt[]> {
    try {
      const attemptsRef = collection(db, 'exam_attempts');
      const q = query(attemptsRef, orderBy('started_at', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExamAttempt[];
    } catch (error) {
      console.error('Error getting all exam attempts:', error);
      return [];
    }
  }

  static async getExamAttemptById(id: string): Promise<ExamAttempt | null> {
    try {
      const docRef = doc(db, 'exam_attempts', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return { id: docSnap.id, ...docSnap.data() } as ExamAttempt;
    } catch (error) {
      console.error('Error getting exam attempt by id:', error);
      return null;
    }
  }

  static async saveMediaFile(fileName: string, fileType: string, fileData: string) {
    try {
      console.log('Saving media file:', fileName, fileType, 'Data length:', fileData.length);

      let base64Data = fileData;
      if (fileData.includes(',')) {
        base64Data = fileData.split(',')[1];
      }

      console.log('Base64 data length:', base64Data.length);

      const mediaRef = doc(collection(db, 'media_files'));
      const mediaData = {
        file_name: fileName,
        file_type: fileType,
        file_data: base64Data,
        created_at: new Date().toISOString()
      };

      await setDoc(mediaRef, mediaData);
      console.log('Media file saved successfully:', mediaRef.id);
      return { insertId: mediaRef.id };
    } catch (error) {
      console.error('Error saving media file:', error);
      throw error;
    }
  }

  static async getMediaFile(id: string): Promise<MediaFile | null> {
    try {
      console.log('Getting media file:', id);

      const docRef = doc(db, 'media_files', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('Media file not found:', id);
        return null;
      }

      const data = docSnap.data();
      const dataUrl = `data:${data.file_type};base64,${data.file_data}`;
      console.log('Media file retrieved successfully, data URL length:', dataUrl.length);

      return {
        id: docSnap.id,
        ...data,
        file_data: dataUrl
      } as MediaFile;
    } catch (error) {
      console.error('Error getting media file:', error);
      return null;
    }
  }

  static async getStats() {
    try {
      const studentsRef = collection(db, 'students');
      const examsRef = collection(db, 'exams');
      const attemptsRef = collection(db, 'exam_attempts');

      const [studentsSnapshot, examsSnapshot, attemptsSnapshot] = await Promise.all([
        getCountFromServer(studentsRef),
        getCountFromServer(examsRef),
        getCountFromServer(attemptsRef)
      ]);

      return {
        totalStudents: studentsSnapshot.data().count,
        totalExams: examsSnapshot.data().count,
        totalAttempts: attemptsSnapshot.data().count
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
