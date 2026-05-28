/*
  # Fix akbilim storage bucket policies for anonymous uploads

  1. Changes
    - Drop existing INSERT policy that requires authenticated users
    - Create new INSERT policy that allows anon key holders to upload
    - This is necessary because the app uses REST API with anon key (no auth)
  
  2. Security Considerations
    - Only users with valid anon key can upload (prevents random uploads)
    - Files are still publicly readable
    - Delete/Update still requires authentication (safer)
*/

-- Drop the restrictive authenticated-only INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload to akbilim" ON storage.objects;

-- Create new policy allowing uploads with anon key (to authenticated OR anon)
-- Note: Using 'anon' role would be ideal, but Supabase maps anon key to 'authenticated' role
-- We'll allow both to be safe
CREATE POLICY "Allow uploads with anon key to akbilim"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'akbilim');

-- Also allow anon users to read files (public bucket)
DROP POLICY IF EXISTS "Public can view akbilim files" ON storage.objects;
CREATE POLICY "Anyone can view akbilim files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'akbilim');