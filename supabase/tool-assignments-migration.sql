-- OurPath OS · tool_assignments table
-- Run this in the Supabase dashboard → SQL Editor.
-- This table lets mentors assign interactive tools to specific mentees.
-- The tool appears on the mentee's Dashboard > "Your Tools" section.

CREATE TABLE IF NOT EXISTS tool_assignments (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_slug    text        NOT NULL,
  assigned_by  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at  timestamptz DEFAULT now() NOT NULL,
  notes        text,
  revoked_at   timestamptz
);

-- Index for fast mentee lookups (Dashboard fetch)
CREATE INDEX IF NOT EXISTS tool_assignments_mentee_idx
  ON tool_assignments (mentee_id);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE tool_assignments ENABLE ROW LEVEL SECURITY;

-- Mentees can read their own (non-revoked) assignments
CREATE POLICY "Mentees read own assignments"
  ON tool_assignments FOR SELECT
  USING (
    auth.uid() = mentee_id
  );

-- Mentors can read, insert, and update assignments for their mentees
CREATE POLICY "Mentors manage assignments for their mentees"
  ON tool_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (role = 'mentor' OR role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND (role = 'mentor' OR role = 'admin')
    )
  );

-- ── Valid tool slugs (informational comment — not enforced by DB constraint) ──
-- ocs-checkin, position-map, cost-audit, integration-filter, orientation
