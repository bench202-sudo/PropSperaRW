CREATE OR REPLACE FUNCTION public.submit_property(
  p_agent_id        uuid,
  p_title           text,
  p_description     text,
  p_property_type   text,
  p_listing_type    text,
  p_price           numeric,
  p_currency        text,
  p_bedrooms        int,
  p_bathrooms       int,
  p_area_sqm        numeric,
  p_built_area      numeric,
  p_location        text,
  p_province_id     text DEFAULT NULL,
  p_district_id     text DEFAULT NULL,
  p_sector_id       text DEFAULT NULL,
  p_location_label  text DEFAULT NULL,
  p_neighborhood    text DEFAULT NULL,
  p_address         text,
  p_latitude        numeric,
  p_longitude       numeric,
  p_images          text[],
  p_video_url       text,
  p_amenities       text[],
  p_furnished       text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id uuid;
  v_caller_agent_id uuid;
BEGIN
  SELECT id INTO v_caller_agent_id
  FROM public.agents
  WHERE id = p_agent_id
    AND user_id = auth.uid();

  IF v_caller_agent_id IS NULL THEN
    SELECT a.id INTO v_caller_agent_id
    FROM public.agents a
    JOIN public.users u ON u.id = a.user_id
    WHERE a.id = p_agent_id
      AND u.auth_id = auth.uid();
  END IF;

  IF v_caller_agent_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: caller does not own agent record %', p_agent_id;
  END IF;

  INSERT INTO public.properties (
    agent_id, title, description, property_type, listing_type,
    price, currency, bedrooms, bathrooms, area_sqm, built_area,
    location, province_id, district_id, sector_id, location_label, neighborhood,
    address, latitude, longitude,
    images, video_url, amenities, furnished,
    status, featured, views, created_at, updated_at
  ) VALUES (
    p_agent_id, p_title, p_description, p_property_type, p_listing_type,
    p_price, p_currency, p_bedrooms, p_bathrooms, p_area_sqm, p_built_area,
    p_location, p_province_id, p_district_id, p_sector_id,
    COALESCE(NULLIF(TRIM(p_location_label), ''), NULLIF(TRIM(p_neighborhood), '')),
    p_neighborhood, p_address, p_latitude, p_longitude,
    p_images, p_video_url, p_amenities, p_furnished,
    'pending', false, 0, now(), now()
  )
  RETURNING id INTO v_property_id;

  RETURN v_property_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_property TO authenticated;