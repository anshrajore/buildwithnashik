
-- ============================================================
-- Role infrastructure
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own roles" ON public.user_roles;
CREATE POLICY "Users can see their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
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

-- Allow authenticated + anon to call has_role (used by RLS policies)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- Admin policy on user_roles itself (so admins can list all roles)
DROP POLICY IF EXISTS "Admins can see all roles" ON public.user_roles;
CREATE POLICY "Admins can see all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Admin SELECT policies on existing data tables
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all teams" ON public.teams;
CREATE POLICY "Admins can view all teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
CREATE POLICY "Admins can update teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all mentor_judge_applications" ON public.mentor_judge_applications;
CREATE POLICY "Admins can view all mentor_judge_applications"
  ON public.mentor_judge_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update mentor_judge_applications" ON public.mentor_judge_applications;
CREATE POLICY "Admins can update mentor_judge_applications"
  ON public.mentor_judge_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all sponsor_inquiries" ON public.sponsor_inquiries;
CREATE POLICY "Admins can view all sponsor_inquiries"
  ON public.sponsor_inquiries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all volunteer_signups" ON public.volunteer_signups;
CREATE POLICY "Admins can view all volunteer_signups"
  ON public.volunteer_signups FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Application review status
-- ============================================================
ALTER TABLE public.mentor_judge_applications
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.mentor_judge_applications
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- ============================================================
-- Teams submissions
-- ============================================================
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS ppt_url text;

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS submission_notes text;

-- ============================================================
-- First-admin bootstrap: any authenticated user can claim admin
-- ONLY if there is no admin yet. After that this is a no-op.
-- ============================================================
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- Already an admin somewhere; only allow silently if caller is the admin
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = v_uid) THEN
      RETURN jsonb_build_object('ok', true, 'already_admin', true);
    END IF;
    RETURN jsonb_build_object('ok', false, 'code', 'admin_exists');
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'claimed', true);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
