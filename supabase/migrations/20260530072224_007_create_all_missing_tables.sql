/*
  # Create all missing tables for Akbilim system

  1. New Tables
    - `ak_students` - Students/ученики
    - `ak_leads` - Leads/лиды (potential students)
    - `ak_reports` - Lesson reports/отчёты об уроках
    - `ak_trials` - Trial lessons/пробные уроки
    - `ak_parents` - Parents/родители
    - `ak_groups` - Groups/группы
    - `ak_finances` - Finance records/финансы
    - `ak_reviews` - Reviews/отзывы
    - `ak_smm_reports` - SMM content ideas

  2. Security
    - Enable RLS on all tables
    - Allow public access for anon key (app uses REST API without auth)
    - All users can read/write data

  3. Important Notes
    - All tables use bigint id as primary key
    - Text fields for flexibility (dates stored as text for simplicity)
    - RLS is permissive to allow anon API access
*/

-- ak_students table
CREATE TABLE IF NOT EXISTS ak_students (
  id bigint PRIMARY KEY,
  name text DEFAULT '',
  grade text DEFAULT '',
  address text DEFAULT '',
  days text DEFAULT '[]',
  time text DEFAULT '',
  teacherid bigint,
  parentphone text DEFAULT '',
  format text DEFAULT 'выезд',
  groupid bigint,
  lessonprice integer DEFAULT 0,
  status text DEFAULT 'active',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ak_leads table
CREATE TABLE IF NOT EXISTS ak_leads (
  id bigint PRIMARY KEY,
  name text DEFAULT '',
  phone text DEFAULT '',
  subject text DEFAULT '',
  grade text DEFAULT '',
  address text DEFAULT '',
  source text DEFAULT '',
  status text DEFAULT 'new',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ak_reports table
CREATE TABLE IF NOT EXISTS ak_reports (
  id bigint PRIMARY KEY,
  teacherid bigint,
  studentid bigint,
  date text DEFAULT '',
  topic text DEFAULT '',
  notes text DEFAULT '',
  homework text DEFAULT '',
  rating integer DEFAULT 0,
  paymentreceived boolean DEFAULT false,
  paymentamount integer DEFAULT 0,
  files text DEFAULT '[]',
  teachername text DEFAULT '',
  studentname text DEFAULT '',
  teacheravatar text DEFAULT '',
  teachercolor text DEFAULT '#3A8CC7',
  created_at timestamptz DEFAULT now()
);

-- ak_trials table
CREATE TABLE IF NOT EXISTS ak_trials (
  id bigint PRIMARY KEY,
  teacherid bigint,
  date text DEFAULT '',
  childname text DEFAULT '',
  childage integer DEFAULT 0,
  childgrade text DEFAULT '',
  childlevel text DEFAULT '',
  parentname text DEFAULT '',
  parentphone text DEFAULT '',
  parentgoal text DEFAULT '',
  teachernotes text DEFAULT '',
  suggestedformat text DEFAULT '',
  suggesteddays text DEFAULT '[]',
  suggestedtime text DEFAULT '',
  decision text DEFAULT '',
  rejectreason text DEFAULT '',
  testresult integer DEFAULT 0,
  files text DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ak_parents table
CREATE TABLE IF NOT EXISTS ak_parents (
  id bigint PRIMARY KEY,
  name text DEFAULT '',
  phone text DEFAULT '',
  password text DEFAULT '',
  studentid bigint,
  created_at timestamptz DEFAULT now()
);

-- ak_groups table
CREATE TABLE IF NOT EXISTS ak_groups (
  id bigint PRIMARY KEY,
  name text DEFAULT '',
  teacherid bigint,
  subject text DEFAULT '',
  schedule text DEFAULT '',
  students text DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ak_finances table
CREATE TABLE IF NOT EXISTS ak_finances (
  id bigint PRIMARY KEY,
  date text DEFAULT '',
  category text DEFAULT '',
  amount integer DEFAULT 0,
  type text DEFAULT 'expense',
  description text DEFAULT '',
  teacherid bigint,
  created_at timestamptz DEFAULT now()
);

-- ak_reviews table
CREATE TABLE IF NOT EXISTS ak_reviews (
  id bigint PRIMARY KEY,
  teacherid bigint,
  studentid bigint,
  rating integer DEFAULT 0,
  text text DEFAULT '',
  date text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ak_smm_reports table
CREATE TABLE IF NOT EXISTS ak_smm_reports (
  id bigint PRIMARY KEY,
  teacherid bigint,
  date text DEFAULT '',
  type text DEFAULT '',
  title text DEFAULT '',
  description text DEFAULT '',
  files text DEFAULT '[]',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE ak_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak_smm_reports ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access (anon API)
CREATE POLICY "allow_all_students" ON ak_students FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_leads" ON ak_leads FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reports" ON ak_reports FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_trials" ON ak_trials FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_parents" ON ak_parents FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_groups" ON ak_groups FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_finances" ON ak_finances FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reviews" ON ak_reviews FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_smm_reports" ON ak_smm_reports FOR ALL TO public USING (true) WITH CHECK (true);