ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'builder';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'campus_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'volunteer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentor';

CREATE TABLE public.nest_membership_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text,
  organisation text,
  skills text,
  portfolio_url text,
  motivation text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  review_note text,
  submitted_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.nest_membership_applications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.nest_membership_applications TO authenticated;
GRANT ALL ON public.nest_membership_applications TO service_role;

ALTER TABLE public.nest_membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can apply to join Nest"
ON public.nest_membership_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  track = ANY (ARRAY['builder','campus_lead','volunteer','mentor'])
  AND length(full_name) >= 2 AND length(full_name) <= 80
  AND length(email) >= 3 AND length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(phone) >= 5 AND length(phone) <= 20
  AND (city IS NULL OR length(city) <= 80)
  AND (organisation IS NULL OR length(organisation) <= 120)
  AND (skills IS NULL OR length(skills) <= 400)
  AND (portfolio_url IS NULL OR length(portfolio_url) <= 500)
  AND length(motivation) >= 20 AND length(motivation) <= 1200
  AND status = 'pending'
);

CREATE POLICY "Applicants can view their own application"
ON public.nest_membership_applications
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all membership applications"
ON public.nest_membership_applications
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update membership applications"
ON public.nest_membership_applications
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_nest_membership_applications_updated_at
BEFORE UPDATE ON public.nest_membership_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.nest_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  track text NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nest_members TO authenticated;
GRANT ALL ON public.nest_members TO service_role;

ALTER TABLE public.nest_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own record"
ON public.nest_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all members"
ON public.nest_members
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_nest_members_updated_at
BEFORE UPDATE ON public.nest_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();