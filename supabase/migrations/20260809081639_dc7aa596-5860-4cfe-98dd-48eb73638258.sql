-- Recreate helpers in the private (non-API) schema
CREATE OR REPLACE FUNCTION private.can_manage_event(_event_id uuid, _permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
END; $$;

CREATE OR REPLACE FUNCTION private.owns_registration(_registration_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.event_registrations r
                 WHERE r.id = _registration_id AND r.user_id = auth.uid()) INTO ok;
  RETURN COALESCE(ok, false);
END; $$;

CREATE OR REPLACE FUNCTION private.registration_event_id(_registration_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT event_id FROM public.event_registrations WHERE id = _registration_id $$;

CREATE OR REPLACE FUNCTION private.set_registration_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE prefix text;
BEGIN
  IF NEW.registration_code IS NULL OR NEW.registration_code = '' THEN
    SELECT upper(coalesce(code,'EVT')) INTO prefix FROM public.events WHERE id = NEW.event_id;
    NEW.registration_code := coalesce(prefix,'EVT') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS set_registration_code_trg ON public.event_registrations;
CREATE TRIGGER set_registration_code_trg BEFORE INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION private.set_registration_code();

-- Repoint policies at the private helpers
DROP POLICY "Managers can view their events" ON public.events;
CREATE POLICY "Managers can view their events" ON public.events
  FOR SELECT TO authenticated USING (private.can_manage_event(id, 'view_participants'));
DROP POLICY "Managers can update their events" ON public.events;
CREATE POLICY "Managers can update their events" ON public.events
  FOR UPDATE TO authenticated USING (private.can_manage_event(id, 'edit_event'))
  WITH CHECK (private.can_manage_event(id, 'edit_event'));

DROP POLICY "Managers view event organizers" ON public.event_organizers;
CREATE POLICY "Managers view event organizers" ON public.event_organizers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.can_manage_event(event_id, 'view_participants'));
DROP POLICY "Managers add event organizers" ON public.event_organizers;
CREATE POLICY "Managers add event organizers" ON public.event_organizers
  FOR INSERT TO authenticated WITH CHECK (private.can_manage_event(event_id, 'edit_event'));
DROP POLICY "Managers update event organizers" ON public.event_organizers;
CREATE POLICY "Managers update event organizers" ON public.event_organizers
  FOR UPDATE TO authenticated USING (private.can_manage_event(event_id, 'edit_event'))
  WITH CHECK (private.can_manage_event(event_id, 'edit_event'));
DROP POLICY "Managers remove event organizers" ON public.event_organizers;
CREATE POLICY "Managers remove event organizers" ON public.event_organizers
  FOR DELETE TO authenticated USING (private.can_manage_event(event_id, 'edit_event'));

DROP POLICY "Managers view rounds" ON public.event_rounds;
CREATE POLICY "Managers view rounds" ON public.event_rounds
  FOR SELECT TO authenticated USING (private.can_manage_event(event_id, 'manage_rounds'));
DROP POLICY "Managers create rounds" ON public.event_rounds;
CREATE POLICY "Managers create rounds" ON public.event_rounds
  FOR INSERT TO authenticated WITH CHECK (private.can_manage_event(event_id, 'manage_rounds'));
DROP POLICY "Managers update rounds" ON public.event_rounds;
CREATE POLICY "Managers update rounds" ON public.event_rounds
  FOR UPDATE TO authenticated USING (private.can_manage_event(event_id, 'manage_rounds'))
  WITH CHECK (private.can_manage_event(event_id, 'manage_rounds'));
DROP POLICY "Managers delete rounds" ON public.event_rounds;
CREATE POLICY "Managers delete rounds" ON public.event_rounds
  FOR DELETE TO authenticated USING (private.can_manage_event(event_id, 'manage_rounds'));

DROP POLICY "Managers view event registrations" ON public.event_registrations;
CREATE POLICY "Managers view event registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (private.can_manage_event(event_id, 'view_participants'));
DROP POLICY "Managers update event registrations" ON public.event_registrations;
CREATE POLICY "Managers update event registrations" ON public.event_registrations
  FOR UPDATE TO authenticated USING (private.can_manage_event(event_id, 'manage_registrations'))
  WITH CHECK (private.can_manage_event(event_id, 'manage_registrations'));

DROP POLICY "Participants view own team" ON public.registration_members;
CREATE POLICY "Participants view own team" ON public.registration_members
  FOR SELECT TO authenticated USING (private.owns_registration(registration_id));
DROP POLICY "Managers view teams" ON public.registration_members;
CREATE POLICY "Managers view teams" ON public.registration_members
  FOR SELECT TO authenticated
  USING (private.can_manage_event(private.registration_event_id(registration_id), 'view_participants'));
DROP POLICY "Participants add own team" ON public.registration_members;
CREATE POLICY "Participants add own team" ON public.registration_members
  FOR INSERT TO authenticated WITH CHECK (private.owns_registration(registration_id));
DROP POLICY "Participants edit own team" ON public.registration_members;
CREATE POLICY "Participants edit own team" ON public.registration_members
  FOR UPDATE TO authenticated USING (private.owns_registration(registration_id))
  WITH CHECK (private.owns_registration(registration_id));
DROP POLICY "Participants remove own team" ON public.registration_members;
CREATE POLICY "Participants remove own team" ON public.registration_members
  FOR DELETE TO authenticated USING (private.owns_registration(registration_id));

DROP POLICY "Participants view own submissions" ON public.round_submissions;
CREATE POLICY "Participants view own submissions" ON public.round_submissions
  FOR SELECT TO authenticated USING (private.owns_registration(registration_id));
DROP POLICY "Managers view submissions" ON public.round_submissions;
CREATE POLICY "Managers view submissions" ON public.round_submissions
  FOR SELECT TO authenticated USING (private.can_manage_event(event_id, 'review_submissions'));
DROP POLICY "Participants create own submissions" ON public.round_submissions;
CREATE POLICY "Participants create own submissions" ON public.round_submissions
  FOR INSERT TO authenticated WITH CHECK (private.owns_registration(registration_id));
DROP POLICY "Participants update own submissions" ON public.round_submissions;
CREATE POLICY "Participants update own submissions" ON public.round_submissions
  FOR UPDATE TO authenticated USING (private.owns_registration(registration_id))
  WITH CHECK (private.owns_registration(registration_id));
DROP POLICY "Managers review submissions" ON public.round_submissions;
CREATE POLICY "Managers review submissions" ON public.round_submissions
  FOR UPDATE TO authenticated USING (private.can_manage_event(event_id, 'review_submissions'))
  WITH CHECK (private.can_manage_event(event_id, 'review_submissions'));

DROP POLICY "Managers view communication history" ON public.event_email_log;
CREATE POLICY "Managers view communication history" ON public.event_email_log
  FOR SELECT TO authenticated USING (private.can_manage_event(event_id, 'send_emails'));

DROP FUNCTION IF EXISTS public.can_manage_event(uuid, text);
DROP FUNCTION IF EXISTS public.owns_registration(uuid);
DROP FUNCTION IF EXISTS public.registration_event_id(uuid);
DROP FUNCTION IF EXISTS public.set_registration_code();