-- Create releases storage bucket for APK downloads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('releases', 'releases', true, 104857600, ARRAY['application/vnd.android.package-archive'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Releases are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'releases');

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload releases"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'releases'
    AND auth.role() = 'authenticated'
  );
