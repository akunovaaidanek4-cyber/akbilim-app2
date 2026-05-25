/*
  # Create ak_settings table for storing app settings

  1. New Table
    - `ak_settings`
      - `id` (bigint, primary key)
      - `key` (text) - setting key identifier
      - `value` (text) - JSON string value
  2. Security
    - Enable RLS on table
    - Add permissive policy for authenticated access
*/

CREATE TABLE IF NOT EXISTS ak_settings (
  id bigint PRIMARY KEY,
  key text,
  value text
);

ALTER TABLE ak_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON ak_settings FOR ALL TO public USING (true) WITH CHECK (true);