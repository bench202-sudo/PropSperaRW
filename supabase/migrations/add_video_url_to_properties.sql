-- Migration: Add video_url column to properties table
-- Allows one optional video per property listing
-- Date: 2026-04-22

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN properties.video_url IS 'Optional single video URL per property. Stored in property-videos Supabase Storage bucket. Accepts mp4, mov, webm formats.';

-- Storage bucket for property videos (run this in Supabase dashboard if not using migrations for storage)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'property-videos',
--   'property-videos',
--   true,
--   52428800,  -- 50 MB limit
--   ARRAY['video/mp4', 'video/quicktime', 'video/webm']
-- )
-- ON CONFLICT (id) DO NOTHING;
