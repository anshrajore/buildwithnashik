-- event-files: users upload/read inside their own uid-prefixed folder; staff read all
CREATE POLICY "Users upload own event files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own event files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'event-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own event files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'event-files' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'event-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own event files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'event-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Staff read all event files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'event-files' AND private.is_nest_staff(auth.uid()));