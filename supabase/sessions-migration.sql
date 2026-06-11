-- =============================================================================
-- sessions-framework-columns
-- Adds OurPath framework recording fields to the sessions table.
--
-- Run once against the live Supabase project via the SQL editor or:
--   supabase db push  (if using local dev + migrations)
--
-- All statements are idempotent (safe to run again).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. New columns on sessions
-- -----------------------------------------------------------------------------

-- al-Masīr phase (one of the six canonical phase IDs)
alter table public.sessions
  add column if not exists phase text
    check (phase in (
      'orientation', 'excavation', 'clarification',
      'construction', 'integration', 'transmission'
    ));

-- Mentor stance (one of the four canonical stance IDs)
alter table public.sessions
  add column if not exists mentor_stance text
    check (mentor_stance in ('shahid', 'miraa', 'dalil', 'rafiq'));

-- OCS dimensions — integer 1–5 each (NULL = not yet scored)
alter table public.sessions
  add column if not exists ocs_clarity      integer check (ocs_clarity      between 1 and 5),
  add column if not exists ocs_agency       integer check (ocs_agency       between 1 and 5),
  add column if not exists ocs_groundedness integer check (ocs_groundedness between 1 and 5),
  add column if not exists ocs_energy       integer check (ocs_energy       between 1 and 5),
  add column if not exists ocs_momentum     integer check (ocs_momentum     between 1 and 5);

-- Nine Reflection Domains explored in this session (text array)
alter table public.sessions
  add column if not exists domains_explored text[];

-- What moved — narrative observation saved alongside framework data
alter table public.sessions
  add column if not exists what_moved text;

-- -----------------------------------------------------------------------------
-- 2. RLS — allow mentors to UPDATE sessions for their assigned mentees
--
-- Mentors already have SELECT on sessions via "mentor reads sessions via
-- mentor_id" (schema.sql). They need UPDATE to save framework data from
-- the MentorNotes session recording form.
-- -----------------------------------------------------------------------------

drop policy if exists "mentor updates sessions via mentor_id" on public.sessions;
create policy "mentor updates sessions via mentor_id"
  on public.sessions for update
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = sessions.mentee_id
        and m.mentor_id = auth.uid()
    )
  )
  with check (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = sessions.mentee_id
        and m.mentor_id = auth.uid()
    )
  );

-- Allow directors/admins to update any session (already have full access via
-- other policies, but explicit UPDATE keeps things clear).
drop policy if exists "admin updates sessions" on public.sessions;
create policy "admin updates sessions"
  on public.sessions for update
  using (
    has_role(auth.uid(), 'admin'::app_role)
    or has_role(auth.uid(), 'director'::app_role)
  );
