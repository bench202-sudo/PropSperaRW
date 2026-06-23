-- Add structured Rwanda location fields while preserving legacy neighborhood values.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS province_id text,
  ADD COLUMN IF NOT EXISTS district_id text,
  ADD COLUMN IF NOT EXISTS sector_id text,
  ADD COLUMN IF NOT EXISTS location_label text;

-- Preserve existing neighborhood labels into location_label for backward compatibility.
UPDATE public.properties
SET location_label = COALESCE(NULLIF(TRIM(location_label), ''), NULLIF(TRIM(neighborhood), ''))
WHERE location_label IS NULL OR TRIM(location_label) = '';