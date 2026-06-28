
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name text NOT NULL,
  track text NOT NULL,
  project_idea text,
  lead_name text NOT NULL,
  lead_email text NOT NULL,
  lead_phone text NOT NULL,
  member_count int NOT NULL DEFAULT 1,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  city text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.teams TO anon;
GRANT INSERT ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a team registration"
  ON public.teams FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(team_name) BETWEEN 1 AND 80
    AND length(lead_name) BETWEEN 1 AND 80
    AND length(lead_email) BETWEEN 3 AND 255
    AND length(lead_phone) BETWEEN 5 AND 20
    AND member_count BETWEEN 2 AND 4
  );

CREATE TABLE public.sponsor_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  tier text NOT NULL,
  website text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.sponsor_inquiries TO anon;
GRANT INSERT ON public.sponsor_inquiries TO authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;

ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a sponsor inquiry"
  ON public.sponsor_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(company_name) BETWEEN 1 AND 120
    AND length(contact_name) BETWEEN 1 AND 80
    AND length(contact_email) BETWEEN 3 AND 255
    AND length(tier) BETWEEN 1 AND 40
  );
