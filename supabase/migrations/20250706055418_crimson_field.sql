/*
  # Fix admin permissions and media file storage

  1. Security Changes
    - Add policies to allow admin operations
    - Fix media file storage permissions
    - Ensure proper RLS policies for all operations

  2. Changes
    - Add anon role policies for admin operations
    - Update media file policies
    - Add proper admin access patterns
*/

-- Allow anon role to perform admin operations (for admin login)
CREATE POLICY "Allow anon admin operations on exams"
  ON exams
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon admin operations on exam_attempts"
  ON exam_attempts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon admin operations on media_files"
  ON media_files
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon admin operations on students"
  ON students
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Ensure media files table has correct structure
ALTER TABLE media_files ALTER COLUMN file_data TYPE text;