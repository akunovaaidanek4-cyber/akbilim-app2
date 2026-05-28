/*
  # Create akbilim storage bucket for report photos

  1. New Storage Bucket
    - `akbilim` - public bucket for storing lesson/trial report photos and videos
  
  2. Security
    - Enable public access for reading files (photos should be viewable by all)
    - Only authenticated users can upload files
    - Anyone can download/view files

  3. Important Notes
    - This bucket stores photos and videos from lesson reports
    - Files are publicly accessible (no authentication needed to view)
    - Teachers need to be authenticated to upload
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('akbilim-bucket', 'akbilim', true)
ON CONFLICT (name) DO NOTHING;

-- Policy: Allow anyone to read files (public bucket)
CREATE POLICY "Public can view akbilim files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'akbilim');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to akbilim"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'akbilim');

-- Policy: Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update akbilim files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'akbilim');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete akbilim files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'akbilim');