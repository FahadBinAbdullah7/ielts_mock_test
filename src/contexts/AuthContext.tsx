import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface Student {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  student: Student | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'students', user.uid));
        const userData = userDoc.data();

        setStudent({
          id: user.uid,
          email: user.email!,
          name: userData?.name || user.displayName || user.email!.split('@')[0]
        });
      } else {
        setStudent(null);
        localStorage.removeItem('adminSession');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'students', user.uid), {
        email,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {};
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error: error.message || 'An unexpected error occurred during signup' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return {};
    } catch (error: any) {
      console.error('Signin error:', error);
      return { error: error.message || 'An unexpected error occurred during signin' };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setStudent(null);
    localStorage.removeItem('adminSession');
  };

  const value = {
    student,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};