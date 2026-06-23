-- Backfill structured location fields for existing properties and keep
-- location fields synchronized for future inserts/updates.

CREATE OR REPLACE FUNCTION public.normalize_property_location_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_label text;
BEGIN
  v_label := COALESCE(NULLIF(TRIM(NEW.location_label), ''), NULLIF(TRIM(NEW.neighborhood), ''));

  IF NEW.location_label IS NULL OR TRIM(NEW.location_label) = '' THEN
    NEW.location_label := v_label;
  END IF;

  IF (NEW.province_id IS NULL OR TRIM(NEW.province_id) = '')
     AND (v_label IS NOT NULL OR NEW.district_id IS NOT NULL OR NEW.sector_id IS NOT NULL) THEN
    NEW.province_id := 'kigali-city';
  END IF;

  IF NEW.district_id IS NULL OR TRIM(NEW.district_id) = '' THEN
    NEW.district_id := CASE lower(COALESCE(v_label, ''))
      WHEN 'batsinda' THEN 'gasabo'
      WHEN 'birembo' THEN 'gasabo'
      WHEN 'bumbogo' THEN 'gasabo'
      WHEN 'gaculiro' THEN 'gasabo'
      WHEN 'gacuriro' THEN 'gasabo'
      WHEN 'gasabo' THEN 'gasabo'
      WHEN 'gisozi' THEN 'gasabo'
      WHEN 'jabana' THEN 'gasabo'
      WHEN 'kacyiru' THEN 'gasabo'
      WHEN 'kagugu' THEN 'gasabo'
      WHEN 'kibagabaga' THEN 'gasabo'
      WHEN 'kimihurura' THEN 'gasabo'
      WHEN 'kimironko' THEN 'gasabo'
      WHEN 'kinyinya' THEN 'gasabo'
      WHEN 'masoro' THEN 'gasabo'
      WHEN 'ndera' THEN 'gasabo'
      WHEN 'nduba' THEN 'gasabo'
      WHEN 'nyarutarama' THEN 'gasabo'
      WHEN 'nzove' THEN 'gasabo'
      WHEN 'remera' THEN 'gasabo'
      WHEN 'rugando' THEN 'gasabo'
      WHEN 'rusororo' THEN 'gasabo'
      WHEN 'gahanga' THEN 'kicukiro'
      WHEN 'gikondo' THEN 'kicukiro'
      WHEN 'kabeza' THEN 'kicukiro'
      WHEN 'kanombe' THEN 'kicukiro'
      WHEN 'kicukiro' THEN 'kicukiro'
      WHEN 'rebero' THEN 'kicukiro'
      WHEN 'kanyinya' THEN 'nyarugenge'
      WHEN 'kiyovu' THEN 'nyarugenge'
      WHEN 'nyamirambo' THEN 'nyarugenge'
      ELSE NEW.district_id
    END;
  END IF;

  IF (NEW.sector_id IS NULL OR TRIM(NEW.sector_id) = '') AND v_label IS NOT NULL THEN
    NEW.sector_id := regexp_replace(lower(v_label), '[^a-z0-9]+', '-', 'g');
    NEW.sector_id := regexp_replace(NEW.sector_id, '(^-|-$)', '', 'g');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_property_location_fields ON public.properties;

CREATE TRIGGER trg_normalize_property_location_fields
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.normalize_property_location_fields();

-- Backfill all existing rows by reusing trigger logic.
UPDATE public.properties
SET
  location_label = COALESCE(NULLIF(TRIM(location_label), ''), NULLIF(TRIM(neighborhood), '')),
  province_id = COALESCE(NULLIF(TRIM(province_id), ''), NULL),
  district_id = COALESCE(NULLIF(TRIM(district_id), ''), NULL),
  sector_id = COALESCE(NULLIF(TRIM(sector_id), ''), NULL),
  updated_at = now();

NOTIFY pgrst, 'reload schema';