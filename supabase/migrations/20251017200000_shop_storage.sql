-- Public shop media bucket (collection covers, product photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop',
  'shop',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Shop images public read" ON storage.objects;
CREATE POLICY "Shop images public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'shop');

DROP POLICY IF EXISTS "Admins manage shop images" ON storage.objects;
CREATE POLICY "Admins manage shop images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'shop'
    AND EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'shop'
    AND EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.auth_id = auth.uid() AND m.role = 'admin'
    )
  );
