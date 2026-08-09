-- ============ roles ============
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'founder';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'team_member';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'organizer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'participant';

-- ============ helper: staff check (plpgsql so new enum labels are safe) ============
CREATE OR REPLACE FUNCTION private.is_nest_staff(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text IN ('admin','founder')
  ) INTO ok;
  RETURN COALESCE(ok, false);
END;
$$;

-- ============ events ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text NOT NULL DEFAULT '',
  banner_url text,
  category text NOT NULL DEFAULT 'Hackathon',
  event_type text NOT NULL DEFAULT 'hackathon',
  mode text NOT NULL DEFAULT 'offline',
  city text,
  venue text,
  maps_url text,
  online_url text,
  start_at timestamptz,
  end_at timestamptz,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  website_url text,
  register_url text,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_name text,
  contact_email text,
  contact_phone text,
  participation_type text NOT NULL DEFAULT 'team',
  team_min integer NOT NULL DEFAULT 1,
  team_max integer NOT NULL DEFAULT 4,
  team_name_required boolean NOT NULL DEFAULT true,
  capacity integer,
  eligibility text,
  college_restriction text,
  required_participant_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_status_chk CHECK (status IN ('draft','published','registration_closed','completed','archived')),
  CONSTRAINT events_mode_chk CHECK (mode IN ('offline','online','hybrid')),
  CONSTRAINT events_participation_chk CHECK (participation_type IN ('individual','team','both')),
  CONSTRAINT events_team_chk CHECK (team_min >= 1 AND team_max >= team_min AND team_max <= 50),
  CONSTRAINT events_name_chk CHECK (length(name) BETWEEN 2 AND 140),
  CONSTRAINT events_slug_chk CHECK (slug ~ '^[a-z0-9-]{3,80}$')
);
CREATE INDEX events_status_idx ON public.events (status, start_at);
CREATE INDEX events_owner_idx ON public.events (owner_id);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============ event organizers (per-event permissions) ============
CREATE TABLE public.event_organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  email text,
  display_name text,
  permissions text[] NOT NULL DEFAULT ARRAY['view_participants']::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX event_organizers_user_idx ON public.event_organizers (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_organizers TO authenticated;
GRANT ALL ON public.event_organizers TO service_role;
ALTER TABLE public.event_organizers ENABLE ROW LEVEL SECURITY;

-- ============ permission helper ============
CREATE OR REPLACE FUNCTION public.can_manage_event(_event_id uuid, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid; ok boolean;
BEGIN
  uid := auth.uid();
  IF uid IS NULL OR _event_id IS NULL THEN RETURN false; END IF;
  IF private.is_nest_staff(uid) THEN RETURN true; END IF;
  SELECT EXISTS (SELECT 1 FROM public.events e WHERE e.id = _event_id AND e.owner_id = uid) INTO ok;
  IF ok THEN RETURN true; END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.event_organizers o
    WHERE o.event_id = _event_id AND o.user_id = uid
      AND ('full_access' = ANY (o.permissions) OR _permission = ANY (o.permissions))
  ) INTO ok;
  RETURN COALESCE(ok, false);
END;
$$;

-- events policies
CREATE POLICY "Published events are public" ON public.events
  FOR SELECT TO anon, authenticated
  USING (status IN ('published','registration_closed','completed'));
CREATE POLICY "Managers can view their events" ON public.events
  FOR SELECT TO authenticated USING (public.can_manage_event(id, 'view_participants'));
CREATE POLICY "Signed-in users can create events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Managers can update their events" ON public.events
  FOR UPDATE TO authenticated USING (public.can_manage_event(id, 'edit_event'))
  WITH CHECK (public.can_manage_event(id, 'edit_event'));
CREATE POLICY "Owners and staff can delete events" ON public.events
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR private.is_nest_staff(auth.uid()));

-- organizers policies
CREATE POLICY "Managers view event organizers" ON public.event_organizers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_event(event_id, 'view_participants'));
CREATE POLICY "Managers add event organizers" ON public.event_organizers
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_event(event_id, 'edit_event'));
CREATE POLICY "Managers update event organizers" ON public.event_organizers
  FOR UPDATE TO authenticated USING (public.can_manage_event(event_id, 'edit_event'))
  WITH CHECK (public.can_manage_event(event_id, 'edit_event'));
CREATE POLICY "Managers remove event organizers" ON public.event_organizers
  FOR DELETE TO authenticated USING (public.can_manage_event(event_id, 'edit_event'));

-- ============ rounds ============
CREATE TABLE public.event_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  round_type text NOT NULL DEFAULT 'submission',
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  submission_deadline timestamptz,
  submission_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  allow_file boolean NOT NULL DEFAULT true,
  allow_link boolean NOT NULL DEFAULT true,
  allow_text boolean NOT NULL DEFAULT true,
  is_enabled boolean NOT NULL DEFAULT true,
  submissions_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_rounds_name_chk CHECK (length(name) BETWEEN 1 AND 80),
  CONSTRAINT event_rounds_type_chk CHECK (round_type IN ('registration','submission','evaluation','offline','final','custom'))
);
CREATE INDEX event_rounds_event_idx ON public.event_rounds (event_id, position);
GRANT SELECT ON public.event_rounds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rounds TO authenticated;
GRANT ALL ON public.event_rounds TO service_role;
ALTER TABLE public.event_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rounds of published events are public" ON public.event_rounds
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id
                 AND e.status IN ('published','registration_closed','completed')));
CREATE POLICY "Managers view rounds" ON public.event_rounds
  FOR SELECT TO authenticated USING (public.can_manage_event(event_id, 'manage_rounds'));
CREATE POLICY "Managers create rounds" ON public.event_rounds
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_event(event_id, 'manage_rounds'));
CREATE POLICY "Managers update rounds" ON public.event_rounds
  FOR UPDATE TO authenticated USING (public.can_manage_event(event_id, 'manage_rounds'))
  WITH CHECK (public.can_manage_event(event_id, 'manage_rounds'));
CREATE POLICY "Managers delete rounds" ON public.event_rounds
  FOR DELETE TO authenticated USING (public.can_manage_event(event_id, 'manage_rounds'));

-- ============ registrations ============
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid,
  registration_code text NOT NULL UNIQUE,
  participation_type text NOT NULL DEFAULT 'team',
  team_name text,
  lead_name text NOT NULL,
  lead_email text NOT NULL,
  lead_phone text NOT NULL,
  college text,
  city text,
  member_count integer NOT NULL DEFAULT 1,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  current_round_id uuid REFERENCES public.event_rounds(id) ON DELETE SET NULL,
  organizer_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reg_status_chk CHECK (status IN ('submitted','under_review','shortlisted','on_hold','rejected','advanced','finalist','selected','completed','withdrawn')),
  CONSTRAINT reg_email_chk CHECK (lead_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT reg_name_chk CHECK (length(lead_name) BETWEEN 2 AND 80),
  CONSTRAINT reg_phone_chk CHECK (length(lead_phone) BETWEEN 5 AND 20),
  CONSTRAINT reg_member_chk CHECK (member_count BETWEEN 1 AND 50)
);
CREATE INDEX reg_event_idx ON public.event_registrations (event_id, status);
CREATE INDEX reg_user_idx ON public.event_registrations (user_id);
CREATE UNIQUE INDEX reg_event_team_name_idx
  ON public.event_registrations (event_id, lower(team_name)) WHERE team_name IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_registration(_registration_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE ok boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.event_registrations r
                 WHERE r.id = _registration_id AND r.user_id = auth.uid()) INTO ok;
  RETURN COALESCE(ok, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.registration_event_id(_registration_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT event_id FROM public.event_registrations WHERE id = _registration_id $$;

CREATE POLICY "Participants view own registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Managers view event registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (public.can_manage_event(event_id, 'view_participants'));
CREATE POLICY "Participants register themselves" ON public.event_registrations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'submitted'
    AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));
CREATE POLICY "Participants update own registration" ON public.event_registrations
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Managers update event registrations" ON public.event_registrations
  FOR UPDATE TO authenticated USING (public.can_manage_event(event_id, 'manage_registrations'))
  WITH CHECK (public.can_manage_event(event_id, 'manage_registrations'));

-- registration code generator
CREATE OR REPLACE FUNCTION public.set_registration_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE prefix text;
BEGIN
  IF NEW.registration_code IS NULL OR NEW.registration_code = '' THEN
    SELECT upper(coalesce(code,'EVT')) INTO prefix FROM public.events WHERE id = NEW.event_id;
    NEW.registration_code := coalesce(prefix,'EVT') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_registration_code_trg BEFORE INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_registration_code();

-- ============ registration members ============
CREATE TABLE public.registration_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  college text,
  role text,
  is_lead boolean NOT NULL DEFAULT false,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reg_member_name_chk CHECK (length(full_name) BETWEEN 1 AND 80)
);
CREATE INDEX registration_members_reg_idx ON public.registration_members (registration_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_members TO authenticated;
GRANT ALL ON public.registration_members TO service_role;
ALTER TABLE public.registration_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view own team" ON public.registration_members
  FOR SELECT TO authenticated USING (public.owns_registration(registration_id));
CREATE POLICY "Managers view teams" ON public.registration_members
  FOR SELECT TO authenticated
  USING (public.can_manage_event(public.registration_event_id(registration_id), 'view_participants'));
CREATE POLICY "Participants add own team" ON public.registration_members
  FOR INSERT TO authenticated WITH CHECK (public.owns_registration(registration_id));
CREATE POLICY "Participants edit own team" ON public.registration_members
  FOR UPDATE TO authenticated USING (public.owns_registration(registration_id))
  WITH CHECK (public.owns_registration(registration_id));
CREATE POLICY "Participants remove own team" ON public.registration_members
  FOR DELETE TO authenticated USING (public.owns_registration(registration_id));

-- ============ round submissions ============
CREATE TABLE public.round_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  round_id uuid NOT NULL REFERENCES public.event_rounds(id) ON DELETE CASCADE,
  registration_id uuid NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  text_response text,
  link_url text,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  score numeric,
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (round_id, registration_id),
  CONSTRAINT submission_status_chk CHECK (status IN ('submitted','under_review','approved','rejected','changes_requested'))
);
CREATE INDEX round_submissions_event_idx ON public.round_submissions (event_id, round_id);
GRANT SELECT, INSERT, UPDATE ON public.round_submissions TO authenticated;
GRANT ALL ON public.round_submissions TO service_role;
ALTER TABLE public.round_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view own submissions" ON public.round_submissions
  FOR SELECT TO authenticated USING (public.owns_registration(registration_id));
CREATE POLICY "Managers view submissions" ON public.round_submissions
  FOR SELECT TO authenticated USING (public.can_manage_event(event_id, 'review_submissions'));
CREATE POLICY "Participants create own submissions" ON public.round_submissions
  FOR INSERT TO authenticated WITH CHECK (public.owns_registration(registration_id));
CREATE POLICY "Participants update own submissions" ON public.round_submissions
  FOR UPDATE TO authenticated USING (public.owns_registration(registration_id))
  WITH CHECK (public.owns_registration(registration_id));
CREATE POLICY "Managers review submissions" ON public.round_submissions
  FOR UPDATE TO authenticated USING (public.can_manage_event(event_id, 'review_submissions'))
  WITH CHECK (public.can_manage_event(event_id, 'review_submissions'));

-- ============ email log ============
CREATE TABLE public.event_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  template text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_status_chk CHECK (status IN ('queued','sent','failed','skipped'))
);
CREATE INDEX event_email_log_event_idx ON public.event_email_log (event_id, created_at DESC);
GRANT SELECT ON public.event_email_log TO authenticated;
GRANT ALL ON public.event_email_log TO service_role;
ALTER TABLE public.event_email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers view communication history" ON public.event_email_log
  FOR SELECT TO authenticated USING (public.can_manage_event(event_id, 'send_emails'));

-- ============ tasks ============
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid NOT NULL,
  assigned_by uuid NOT NULL,
  assignee_name text,
  assignee_email text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'not_started',
  due_at timestamptz,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  activity jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT task_title_chk CHECK (length(title) BETWEEN 2 AND 140),
  CONSTRAINT task_priority_chk CHECK (priority IN ('low','medium','high','urgent')),
  CONSTRAINT task_status_chk CHECK (status IN ('not_started','in_progress','submitted','under_review','completed','rejected'))
);
CREATE INDEX tasks_assignee_idx ON public.tasks (assigned_to, status);
GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignees and assigners view tasks" ON public.tasks
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR private.is_nest_staff(auth.uid()));
CREATE POLICY "Staff assign tasks" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (assigned_by = auth.uid() AND private.is_nest_staff(auth.uid()));
CREATE POLICY "Assignees and staff update tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR private.is_nest_staff(auth.uid()))
  WITH CHECK (assigned_to = auth.uid() OR assigned_by = auth.uid() OR private.is_nest_staff(auth.uid()));

CREATE TABLE public.task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  text_response text,
  link_url text,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'submitted',
  feedback text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT task_sub_status_chk CHECK (status IN ('submitted','approved','rejected','changes_requested'))
);
CREATE INDEX task_submissions_task_idx ON public.task_submissions (task_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.task_submissions TO authenticated;
GRANT ALL ON public.task_submissions TO service_role;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task parties view submissions" ON public.task_submissions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id
    AND (t.assigned_to = auth.uid() OR t.assigned_by = auth.uid()))
    OR private.is_nest_staff(auth.uid()));
CREATE POLICY "Assignees submit work" ON public.task_submissions
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.assigned_to = auth.uid()));
CREATE POLICY "Reviewers update submissions" ON public.task_submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.assigned_by = auth.uid())
    OR private.is_nest_staff(auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.assigned_by = auth.uid())
    OR private.is_nest_staff(auth.uid()));

-- ============ audit log ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  actor_id uuid,
  actor_email text,
  actor_role text,
  previous_value jsonb,
  new_value jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON public.audit_logs (created_at DESC);
CREATE INDEX audit_logs_action_idx ON public.audit_logs (action);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (private.is_nest_staff(auth.uid()));

-- ============ updated_at triggers ============
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER event_rounds_updated_at BEFORE UPDATE ON public.event_rounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER event_registrations_updated_at BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER round_submissions_updated_at BEFORE UPDATE ON public.round_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();