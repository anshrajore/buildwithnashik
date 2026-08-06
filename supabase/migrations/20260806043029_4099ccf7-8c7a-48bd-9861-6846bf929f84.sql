-- saved swag designs
CREATE TABLE public.swag_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'My badge',
  display_name text NOT NULL,
  role text NOT NULL,
  theme_id text NOT NULL,
  format_id text NOT NULL DEFAULT 'ig-post',
  avatar_emoji text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.swag_designs TO authenticated;
GRANT ALL ON public.swag_designs TO service_role;

ALTER TABLE public.swag_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own swag designs"
  ON public.swag_designs FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND length(label) BETWEEN 1 AND 60
    AND length(display_name) BETWEEN 1 AND 40
    AND length(role) BETWEEN 1 AND 30
    AND length(theme_id) BETWEEN 1 AND 40
    AND length(format_id) BETWEEN 1 AND 40
    AND (avatar_emoji IS NULL OR length(avatar_emoji) <= 8)
  );

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_swag_designs_updated_at
  BEFORE UPDATE ON public.swag_designs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- community events moderation fields
ALTER TABLE public.community_events
  ADD COLUMN IF NOT EXISTS submitted_by uuid,
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS notified_at timestamptz;

CREATE POLICY "Submitters can view their own events"
  ON public.community_events FOR SELECT TO authenticated
  USING (auth.uid() = submitted_by);