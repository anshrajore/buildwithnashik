CREATE TABLE public.mentor_judge_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  current_title TEXT NOT NULL,
  organization TEXT NOT NULL,
  linkedin_url TEXT,
  expertise TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  bio TEXT NOT NULL,
  availability TEXT,
  motivation TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.mentor_judge_applications TO anon, authenticated;
GRANT ALL ON public.mentor_judge_applications TO service_role;

ALTER TABLE public.mentor_judge_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a mentor or judge application"
  ON public.mentor_judge_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    application_type IN ('mentor','judge')
    AND length(full_name) BETWEEN 2 AND 80
    AND length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(phone) BETWEEN 5 AND 20
    AND (city IS NULL OR length(city) <= 80)
    AND length(current_title) BETWEEN 2 AND 120
    AND length(organization) BETWEEN 1 AND 120
    AND (linkedin_url IS NULL OR length(linkedin_url) <= 255)
    AND length(expertise) BETWEEN 2 AND 300
    AND experience_years BETWEEN 0 AND 60
    AND length(bio) BETWEEN 20 AND 1000
    AND (availability IS NULL OR length(availability) <= 200)
    AND (motivation IS NULL OR length(motivation) <= 800)
  );
