
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- Recreate has_role in private schema (not exposed by PostgREST)
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Recreate admin claim in private schema; only trusted server code (service_role) can invoke
CREATE OR REPLACE FUNCTION private.claim_first_admin(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = _user_id) THEN
      RETURN jsonb_build_object('ok', true, 'already_admin', true);
    END IF;
    RETURN jsonb_build_object('ok', false, 'code', 'admin_exists');
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'claimed', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION private.claim_first_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.claim_first_admin(uuid) TO service_role;

-- Swap RLS policies to use private.has_role
DROP POLICY IF EXISTS "Admins can view all teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
CREATE POLICY "Admins can view all teams" ON public.teams
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update teams" ON public.teams
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view all mentor_judge_applications" ON public.mentor_judge_applications;
DROP POLICY IF EXISTS "Admins can update mentor_judge_applications" ON public.mentor_judge_applications;
CREATE POLICY "Admins can view all mentor_judge_applications" ON public.mentor_judge_applications
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update mentor_judge_applications" ON public.mentor_judge_applications
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view all sponsor_inquiries" ON public.sponsor_inquiries;
CREATE POLICY "Admins can view all sponsor_inquiries" ON public.sponsor_inquiries
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view all volunteer_signups" ON public.volunteer_signups;
CREATE POLICY "Admins can view all volunteer_signups" ON public.volunteer_signups
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can see all roles" ON public.user_roles;
CREATE POLICY "Admins can see all roles" ON public.user_roles
  FOR SELECT USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the publicly exposed versions
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.claim_first_admin();
