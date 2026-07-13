-- ШАГ 1: Исправить ak_leads
ALTER TABLE ak_leads RENAME COLUMN name TO "childName";
ALTER TABLE ak_leads RENAME COLUMN phone TO "parentPhone";
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "parentName" text DEFAULT '';
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS district text DEFAULT '';
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "teacherId" bigint;
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "teacherName" text DEFAULT '';
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "trialDate" text DEFAULT '';
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "rejectReason" text DEFAULT '';

-- ШАГ 2: Исправить ak_reports (lowercase → camelCase, files text → jsonb, добавить колонки)
ALTER TABLE ak_reports RENAME COLUMN teacherid TO "teacherId";
ALTER TABLE ak_reports RENAME COLUMN studentid TO "studentId";
ALTER TABLE ak_reports RENAME COLUMN teachername TO "teacherName";
ALTER TABLE ak_reports RENAME COLUMN studentname TO "studentName";
ALTER TABLE ak_reports RENAME COLUMN teacheravatar TO "teacherAvatar";
ALTER TABLE ak_reports RENAME COLUMN teachercolor TO "teacherColor";
ALTER TABLE ak_reports ALTER COLUMN files TYPE jsonb USING COALESCE(NULLIF(files, '')::jsonb, '[]'::jsonb);
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS type text DEFAULT 'lesson';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS decision text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "rejectReason" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "suggestedDays" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "suggestedTime" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "childAge" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "childGrade" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "parentName" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS "parentPhone" text DEFAULT '';
ALTER TABLE ak_reports ADD COLUMN IF NOT EXISTS subject text DEFAULT '';

-- ШАГ 3: Исправить ak_students
ALTER TABLE ak_students RENAME COLUMN teacherid TO "teacherId";
ALTER TABLE ak_students ADD COLUMN IF NOT EXISTS "teacherName" text DEFAULT '';
ALTER TABLE ak_students ADD COLUMN IF NOT EXISTS "parentName" text DEFAULT '';
ALTER TABLE ak_students ADD COLUMN IF NOT EXISTS subject text DEFAULT '';
ALTER TABLE ak_students ALTER COLUMN days TYPE jsonb USING COALESCE(NULLIF(days, '')::jsonb, '[]'::jsonb);

-- ШАГ 4: Добавить колонки в ak_teachers
ALTER TABLE ak_teachers ADD COLUMN IF NOT EXISTS districts jsonb DEFAULT '[]';
ALTER TABLE ak_teachers ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]';
ALTER TABLE ak_teachers ADD COLUMN IF NOT EXISTS "photoUrl" text DEFAULT '';

-- ШАГ 5: Создать недостающие таблицы
CREATE TABLE IF NOT EXISTS ak_formats (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  price numeric DEFAULT 0,
  teacher_rate numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ak_books (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  "desc" text DEFAULT '',
  price numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS akteacher_districts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  teacher_name text NOT NULL,
  main_districts jsonb DEFAULT '[]',
  nearby_districts jsonb DEFAULT '[]',
  subjects jsonb DEFAULT '[]',
  language text DEFAULT '',
  can_kg boolean DEFAULT false
);

-- ШАГ 6: Исправить политики Storage (bucket_id был 'akbilim', должен быть 'akbilim-bucket')
DROP POLICY IF EXISTS "Public read akbilim" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload akbilim" ON storage.objects;

CREATE POLICY IF NOT EXISTS "Public read akbilim-bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'akbilim-bucket');

CREATE POLICY IF NOT EXISTS "Auth upload akbilim-bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'akbilim-bucket');
