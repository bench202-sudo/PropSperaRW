-- Storage RLS policies for property-videos bucket
-- Run this in the Supabase SQL editor after creating the bucket

-- Allow anyone to read public videos
CREATE POLICY "Public read property videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos');

-- Allow authenticated users to upload videos under their own user id prefix
CREATE POLICY "Authenticated users can upload property videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update/replace their own videos
CREATE POLICY "Users can update own property videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own property videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
