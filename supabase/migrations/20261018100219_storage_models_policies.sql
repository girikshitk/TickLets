/*
# Storage policies for models bucket

1. Security
- Enable public read access on the `models` storage bucket.
- The bucket is public (public=true) so files are readable without auth.
- Allow anon + authenticated to upload/update/delete for management.
*/

DROP POLICY IF EXISTS "anon_read_models_bucket" ON storage.objects;
CREATE POLICY "anon_read_models_bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'models');

DROP POLICY IF EXISTS "anon_upload_models_bucket" ON storage.objects;
CREATE POLICY "anon_upload_models_bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'models');

DROP POLICY IF EXISTS "anon_update_models_bucket" ON storage.objects;
CREATE POLICY "anon_update_models_bucket"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'models') WITH CHECK (bucket_id = 'models');

DROP POLICY IF EXISTS "anon_delete_models_bucket" ON storage.objects;
CREATE POLICY "anon_delete_models_bucket"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'models');
