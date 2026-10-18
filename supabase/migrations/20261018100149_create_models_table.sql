/*
# Create models table for 3D cat showcase

1. New Tables
- `models`
  - `id` (uuid, primary key)
  - `display_name` (text, not null) — human-friendly name shown in the caption
  - `file_path` (text, not null) — path/URL to the .glb file (storage path or absolute URL)
  - `strip_order` (int, not null, default 0) — position in the film-strip carousel; lower = earlier
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `models`.
- This is a single-tenant showcase with no sign-in screen; the data is intentionally public.
- Allow anon + authenticated to read (SELECT) the list of models.
- Allow anon + authenticated to insert/update/delete for management (shared showcase).

3. Notes
- The frontend reads from this table to build the carousel dynamically.
- Add new rows to expand the strip without redesigning the app.
- `file_path` may be a Supabase Storage path (resolved client-side) or an absolute URL.
*/

CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  file_path text NOT NULL,
  strip_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_models" ON models;
CREATE POLICY "anon_select_models"
  ON models FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon_insert_models" ON models;
CREATE POLICY "anon_insert_models"
  ON models FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_models" ON models;
CREATE POLICY "anon_update_models"
  ON models FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_models" ON models;
CREATE POLICY "anon_delete_models"
  ON models FOR DELETE
  TO anon, authenticated
  USING (true);
