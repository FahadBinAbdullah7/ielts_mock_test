/*
  # Fix media files table for proper file storage

  1. Changes
    - Update media_files table to use TEXT instead of BYTEA for base64 storage
    - This allows proper storage of base64 encoded files
    - Add proper indexes for performance

  2. Security
    - Maintain existing RLS policies
*/

-- Update the media_files table to use TEXT for base64 storage
DO $$
BEGIN
  -- Check if the column exists and is bytea type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_files' 
    AND column_name = 'file_data' 
    AND data_type = 'bytea'
  ) THEN
    -- Drop and recreate the column as TEXT
    ALTER TABLE media_files DROP COLUMN file_data;
    ALTER TABLE media_files ADD COLUMN file_data TEXT NOT NULL;
  END IF;
END $$;

-- Ensure the table structure is correct
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_data text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Recreate policies if they don't exist
DO $$
BEGIN
  -- Students can read media files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'media_files' 
    AND policyname = 'Students can read media files'
  ) THEN
    CREATE POLICY "Students can read media files"
      ON media_files
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Service role full access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'media_files' 
    AND policyname = 'Service role full access media'
  ) THEN
    CREATE POLICY "Service role full access media"
      ON media_files
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  -- Allow authenticated users to insert media files (for admin functionality)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'media_files' 
    AND policyname = 'Allow authenticated users to insert media'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert media"
      ON media_files
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;