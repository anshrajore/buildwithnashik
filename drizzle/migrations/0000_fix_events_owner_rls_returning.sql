-- Events RLS self-lookup fix:
-- The 'Managers can view/update their events' policies called private.can_manage_event(id, ...),
-- which re-queries public.events for the owner. During INSERT ... RETURNING (and UPDATE ... RETURNING)
-- the new row version is not yet visible to that re-entrant query, so owner inserts through the
-- Data API failed with "new row violates row-level security policy". The owner check is now done
-- directly on the row's owner_id column, with the helper kept for co-organizer and staff access.

DROP POLICY IF EXISTS "Managers can view their events" ON public.events;
CREATE POLICY "Managers can view their events"
  ON public.events FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR private.can_manage_event(id, 'view_participants'::text));

DROP POLICY IF EXISTS "Managers can update their events" ON public.events;
CREATE POLICY "Managers can update their events"
  ON public.events FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR private.can_manage_event(id, 'edit_event'::text))
  WITH CHECK (owner_id = auth.uid() OR private.can_manage_event(id, 'edit_event'::text));

-- Remove the two temporary diagnostic policies used to isolate this bug.
DROP POLICY IF EXISTS "probe_allow_insert_tmp" ON public.events;
DROP POLICY IF EXISTS "probe_allow_select_tmp" ON public.events;
