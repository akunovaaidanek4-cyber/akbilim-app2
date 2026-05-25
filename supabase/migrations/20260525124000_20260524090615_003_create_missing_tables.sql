/*
  # Create missing tables for attendance and book sales

  1. New Tables
    - `ak_attendance`
      - `id` (bigint, primary key)
      - `teacherId` (bigint)
      - `studentId` (bigint)
      - `date` (text)
      - `status` (text)
    - `ak_book_sales`
      - `id` (bigint, primary key)
      - `trial_id` (bigint)
      - `book_title` (text)
      - `amount` (integer)
      - `date` (text)
      - `month` (text)
  2. Security
    - Enable RLS on both tables
    - Add permissive policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS ak_attendance (
  id bigint PRIMARY KEY,
  teacherId bigint,
  studentId bigint,
  date text,
  status text
);

CREATE TABLE IF NOT EXISTS ak_book_sales (
  id bigint PRIMARY KEY,
  trial_id bigint,
  book_title text,
  amount integer,
  date text,
  month text
);

ALTER TABLE ak_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_book_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON ak_attendance FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ak_book_sales FOR ALL TO public USING (true) WITH CHECK (true);