-- Telegram ID педагога (личный чат с ботом, педагог узнаёт через /myid)
ALTER TABLE ak_teachers ADD COLUMN IF NOT EXISTS "telegramId" bigint;

-- Лид: список уже уведомлённых педагогов и время первого уведомления
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "notifiedTeachers" jsonb DEFAULT '[]';
ALTER TABLE ak_leads ADD COLUMN IF NOT EXISTS "notifiedAt" timestamptz;
