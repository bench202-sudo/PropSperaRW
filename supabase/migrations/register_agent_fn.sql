-- SECURITY DEFINER function so the frontend can insert an agent record
-- without being blocked by RLS (same pattern as submit_inquiry).
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
BEGIN
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

  -- Mirror role update on public.users so the user sees their status change
  UPDATE public.users SET role = 'agent', updated_at = now()
  WHERE id = p_user_id;

  RETURN v_agent_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_agent TO authenticated;
