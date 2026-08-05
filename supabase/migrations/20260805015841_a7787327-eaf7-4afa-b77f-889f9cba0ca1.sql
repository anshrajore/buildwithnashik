CREATE POLICY "Anyone can upload an event banner"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Event banners are readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'event-banners');