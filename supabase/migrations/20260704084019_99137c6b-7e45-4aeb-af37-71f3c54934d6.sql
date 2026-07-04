DROP POLICY IF EXISTS "Anyone can submit volunteer signups" ON public.volunteer_signups;

CREATE POLICY "Anyone can submit volunteer signups"
ON public.volunteer_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 1 AND 80
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(role_interest) BETWEEN 1 AND 60
  AND (phone IS NULL OR length(phone) BETWEEN 5 AND 20)
  AND (city IS NULL OR length(city) <= 80)
  AND (skills IS NULL OR length(skills) <= 500)
  AND (availability IS NULL OR length(availability) <= 200)
  AND (message IS NULL OR length(message) <= 1000)
);