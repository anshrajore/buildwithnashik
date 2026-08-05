CREATE TABLE public.community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  tagline text,
  description text NOT NULL,
  category text NOT NULL,
  mode text NOT NULL DEFAULT 'offline',
  banner_url text,
  start_date date,
  end_date date,
  city text,
  venue text,
  maps_url text,
  team_min integer NOT NULL DEFAULT 1,
  team_max integer NOT NULL DEFAULT 4,
  organiser_name text NOT NULL,
  organiser_email text NOT NULL,
  organiser_phone text NOT NULL,
  organisation text,
  website_url text,
  register_url text,
  socials jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

GRANT SELECT ON public.community_events TO anon;
GRANT SELECT, INSERT ON public.community_events TO authenticated;
GRANT ALL ON public.community_events TO service_role;

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an event"
ON public.community_events FOR INSERT TO anon, authenticated
WITH CHECK (
  length(event_name) BETWEEN 2 AND 120
  AND (tagline IS NULL OR length(tagline) <= 160)
  AND length(description) BETWEEN 20 AND 3000
  AND length(category) BETWEEN 2 AND 60
  AND mode = ANY (ARRAY['offline','online','hybrid'])
  AND (banner_url IS NULL OR length(banner_url) <= 500)
  AND (city IS NULL OR length(city) <= 80)
  AND (venue IS NULL OR length(venue) <= 200)
  AND (maps_url IS NULL OR length(maps_url) <= 500)
  AND team_min >= 1 AND team_max >= team_min AND team_max <= 50
  AND length(organiser_name) BETWEEN 2 AND 80
  AND length(organiser_email) BETWEEN 3 AND 255
  AND organiser_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(organiser_phone) BETWEEN 5 AND 20
  AND (organisation IS NULL OR length(organisation) <= 120)
  AND (website_url IS NULL OR length(website_url) <= 500)
  AND (register_url IS NULL OR length(register_url) <= 500)
  AND status = 'pending'
);

CREATE POLICY "Published events are public"
ON public.community_events FOR SELECT TO anon, authenticated
USING (status = 'approved');

CREATE POLICY "Admins can view all community_events"
ON public.community_events FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update community_events"
ON public.community_events FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role));