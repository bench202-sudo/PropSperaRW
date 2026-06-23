-- Ensure register_agent exists with the exact RPC signature expected by the app.
-- Also handle schema variance between verification_docs and verification_documents.

DROP FUNCTION IF EXISTS public.register_agent(
  uuid,
  text,
  text,
  text,
  text,
  int,
  text[],
  text[],
  text
);

CREATE OR REPLACE FUNCTION public.register_agent(
  p_user_id          uuid,
  p_full_name        text,
  p_phone            text,
  p_company_name     text,
  p_bio              text,
  p_years_experience int,
  p_specializations  text[],
  p_verification_docs text[],
  p_avatar_url       text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id uuid;
  v_has_verification_documents boolean;
  v_has_verification_docs boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agents'
      AND column_name = 'verification_documents'
  ) INTO v_has_verification_documents;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agents'
      AND column_name = 'verification_docs'
  ) INTO v_has_verification_docs;

  IF v_has_verification_documents THEN
    INSERT INTO public.agents (
      user_id, full_name, phone, company_name, bio,
      years_experience, specializations, verification_documents,
      avatar_url, verification_status, total_listings, rating,
      created_at, updated_at
    ) VALUES (
      p_user_id, p_full_name, p_phone, p_company_name, p_bio,
      p_years_experience, p_specializations, p_verification_docs,
      p_avatar_url, 'pending', 0, 0,
      now(), now()
    )
    RETURNING id INTO v_agent_id;
  ELSIF v_has_verification_docs THEN
    INSERT INTO public.agents (
      user_id, full_name, phone, company_name, bio,
      years_experience, specializations, verification_docs,
      avatar_url, verification_status, total_listings, rating,
      created_at, updated_at
    ) VALUES (
      p_user_id, p_full_name, p_phone, p_company_name, p_bio,
      p_years_experience, p_specializations, p_verification_docs,
      p_avatar_url, 'pending', 0, 0,
      now(), now()
    )
    RETURNING id INTO v_agent_id;
  ELSE
    RAISE EXCEPTION 'agents table is missing verification_docs and verification_documents columns';
  END IF;

  UPDATE public.users
  SET role = 'agent', updated_at = now()
  WHERE id = p_user_id;

  RETURN v_agent_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_agent TO authenticated;

-- Refresh PostgREST schema cache so RPC becomes visible immediately.
NOTIFY pgrst, 'reload schema';