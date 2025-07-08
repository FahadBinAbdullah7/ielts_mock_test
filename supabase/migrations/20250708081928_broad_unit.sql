/*
  # Fix Audio Upload and Media File Storage

  1. Changes
    - Update media_files table to use proper base64 text storage
    - Fix RLS policies for media file uploads
    - Ensure proper permissions for authenticated users

  2. Security
    - Allow authenticated users to upload media files
    - Maintain read access for all authenticated users
*/

-- Ensure media_files table structure is correct
DO $$
BEGIN
  -- Update file_data column to be TEXT if it's not already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_files' 
    AND column_name = 'file_data' 
    AND data_type != 'text'
  ) THEN
    ALTER TABLE media_files ALTER COLUMN file_data TYPE text;
  END IF;
END $$;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Students can read media files" ON media_files;
DROP POLICY IF EXISTS "Authenticated users can manage media files" ON media_files;
DROP POLICY IF EXISTS "Allow authenticated users to insert media" ON media_files;

-- Create comprehensive media file policies
CREATE POLICY "Authenticated users can read media files"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert media files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update media files"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete media files"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (true);