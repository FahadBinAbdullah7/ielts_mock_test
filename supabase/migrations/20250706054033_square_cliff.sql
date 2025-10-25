/*
  # Fix Student Signup RLS Policy

  1. Security Updates
    - Update RLS policy to allow authenticated users to insert their own student record
    - Remove password_hash requirement since Supabase Auth handles authentication
    - Allow students to insert records with their own auth.uid()

  2. Changes
    - Modify INSERT policy for students table
    - Update policy to check auth.uid() matches the inserted id
*/

-- Drop the existing anon insert policy
DROP POLICY IF EXISTS "Allow anon users to sign up" ON students;

-- Create new policy that allows authenticated users to insert their own record
CREATE POLICY "Allow users to insert own student record"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update the password_hash column to be nullable since we're using Supabase Auth
ALTER TABLE students ALTER COLUMN password_hash DROP NOT NULL;