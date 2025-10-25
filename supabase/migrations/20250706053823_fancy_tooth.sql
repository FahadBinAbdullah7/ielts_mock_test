/*
  # Fix student signup RLS policy

  1. Security Changes
    - Add policy to allow anonymous users to create student accounts during signup
    - This enables the signup process to work properly while maintaining security
    
  2. Notes
    - The policy allows INSERT operations for anonymous users (anon role)
    - This is necessary for the signup flow where users aren't authenticated yet
    - Once signed up, users will be authenticated and can use existing policies
*/

-- Create policy to allow anonymous users to sign up (insert new student records)
CREATE POLICY "Allow anon users to sign up"
  ON students
  FOR INSERT
  TO anon
  WITH CHECK (true);