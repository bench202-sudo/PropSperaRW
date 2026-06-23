-- =============================================================================
-- ensure_user_profile(): SECURITY DEFINER RPC
--
-- Called from the frontend after sign-in when fetchAppUser(auth.uid()) returns
-- null.  This happens for pre-migration users whose public.users row was never
-- linked to their (new) auth.users entry.
--
-- Strategy (in order):
--   1. If a row with auth_id = auth.uid() already exists → return it (no-op).
--   2. If a row with matching email exists and auth_id IS NULL → link it and
--      return the updated row.  This is the pre-migration fix path.
--   3. No row at all → insert a new one.
--
-- The function runs as the Postgres superuser (SECURITY DEFINER) so it can
-- UPDATE auth_id even when RLS blocks anon/authenticated clients from doing so.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id  uuid;
  v_email    text;
  v_name     text;
  v_profile  json;
BEGIN
  -- ── Who is calling? ────────────────────────────────────────────────────────
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'ensure_user_profile: caller is not authenticated';
  END IF;

  SELECT
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)
  INTO v_email, v_name
  FROM auth.users au
  WHERE au.id = v_auth_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'ensure_user_profile: auth.users entry not found for uid %', v_auth_id;
  END IF;

  -- ── 1. Already linked? ─────────────────────────────────────────────────────
  SELECT row_to_json(u) INTO v_profile
  FROM public.users u
  WHERE u.auth_id = v_auth_id
  LIMIT 1;

  IF v_profile IS NOT NULL THEN
    RETURN v_profile;
  END IF;

  -- ── 2. Row exists by email but auth_id not set (pre-migration user) ─────────
  UPDATE public.users
  SET auth_id = v_auth_id, updated_at = now()
  WHERE email = v_email
    AND auth_id IS NULL;

  SELECT row_to_json(u) INTO v_profile
  FROM public.users u
  WHERE u.auth_id = v_auth_id
  LIMIT 1;

  IF v_profile IS NOT NULL THEN
    RETURN v_profile;
  END IF;

  -- ── 3. Brand-new user — insert a fresh row ─────────────────────────────────
  INSERT INTO public.users (auth_id, email, full_name, role, created_at, updated_at)
  VALUES (v_auth_id, v_email, v_name, 'buyer', now(), now());

  SELECT row_to_json(u) INTO v_profile
  FROM public.users u
  WHERE u.auth_id = v_auth_id
  LIMIT 1;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile TO authenticated;
