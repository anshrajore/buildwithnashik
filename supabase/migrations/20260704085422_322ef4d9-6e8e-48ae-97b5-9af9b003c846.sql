
-- 1. Case-insensitive unique index on team_name
CREATE UNIQUE INDEX IF NOT EXISTS teams_team_name_ci_unique
  ON public.teams (lower(team_name));

-- 2. Members change tracking column
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS members_changed_at timestamptz;

-- 3. Secure RPC to change members exactly once, gated by lead email + phone
CREATE OR REPLACE FUNCTION public.request_member_change(
  p_team_name text,
  p_lead_email text,
  p_lead_phone text,
  p_members jsonb,
  p_member_count int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team public.teams%ROWTYPE;
BEGIN
  IF p_member_count IS NULL OR p_member_count < 2 OR p_member_count > 4 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_count', 'message', 'Team size must be 2 to 4.');
  END IF;
  IF jsonb_typeof(p_members) <> 'array' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_members', 'message', 'Members must be a list.');
  END IF;

  SELECT * INTO v_team FROM public.teams
    WHERE lower(team_name) = lower(p_team_name)
    LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found', 'message', 'No team with that name.');
  END IF;

  IF lower(v_team.lead_email) <> lower(p_lead_email)
     OR regexp_replace(v_team.lead_phone, '\D', '', 'g') <> regexp_replace(p_lead_phone, '\D', '', 'g') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'verify_failed', 'message', 'Lead email or phone did not match our records.');
  END IF;

  IF v_team.members_changed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'already_changed', 'message', 'Members have already been updated once for this team.');
  END IF;

  UPDATE public.teams
    SET members = p_members,
        member_count = p_member_count,
        members_changed_at = now()
    WHERE id = v_team.id;

  RETURN jsonb_build_object('ok', true, 'team_id', v_team.id);
END;
$$;

REVOKE ALL ON FUNCTION public.request_member_change(text, text, text, jsonb, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_member_change(text, text, text, jsonb, int) TO anon, authenticated;
