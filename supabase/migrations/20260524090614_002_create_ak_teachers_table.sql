/*
  # Create ak_teachers table

  1. New Tables
    - `ak_teachers`
      - `id` (bigint, primary key) - unique identifier
      - `name` (text) - teacher's full name
      - `login` (text, unique) - username for authentication (lowercase)
      - `password` (text) - password for authentication
      - `role` (text) - "teacher", "coordinator", or other staff role
      - `subject` (text) - subject they teach or position
      - `phone` (text) - phone number
      - `rate` (integer) - hourly/lesson rate
      - `format` (text) - work format ("выезд", "офис", "онлайн", "регион")
      - `avatar` (text) - single letter avatar
      - `color` (text) - hex color code for UI
      - `duties` (text) - job responsibilities
      - `position` (text) - custom position for "other" staff role
      - `created_at` (timestamp) - record creation time

  2. Security
    - Enable RLS on `ak_teachers` table
    - Allow public read access for authentication purposes
    - Allow public insert/update/delete for application functionality

  3. Notes
    - This table stores teacher/staff information
    - Login must be unique and stored in lowercase
    - Removed fields like staffRole, salaryType, photoUrl are not stored in DB
*/

CREATE TABLE IF NOT EXISTS ak_teachers (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  login text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'teacher',
  subject text DEFAULT '',
  phone text DEFAULT '',
  rate integer DEFAULT 0,
  format text DEFAULT '',
  avatar text DEFAULT '',
  color text DEFAULT '#3A8CC7',
  duties text DEFAULT '',
  position text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ak_teachers ENABLE ROW LEVEL SECURITY;

-- Allow public access for authentication and management
-- This is needed because the app uses anonymous key for all operations
CREATE POLICY "Public can read teachers"
  ON ak_teachers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert teachers"
  ON ak_teachers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update teachers"
  ON ak_teachers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete teachers"
  ON ak_teachers FOR DELETE
  TO anon, authenticated
  USING (true);
