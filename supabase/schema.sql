-- =============================================================================
-- OurPath Portal — Supabase schema
-- =============================================================================
-- This file documents the current state of the database. It is split into two
-- sections:
--
--   1. BASE SCHEMA   — the original schema (enums, tables, RLS, helpers).
--                      Already applied to the production database. Re-running
--                      it is safe (uses `if not exists` / `or replace` where
--                      possible).
--
--   2. PORTAL v2     — additions made when the portal app was wired up:
--                      profiles.mentor_id, calendly_event_uri columns on
--                      sessions, session_zero_bookings, notifications_log,
--                      handle_new_user trigger, and assignment-scoped policies
--                      that use mentor_id.
--
-- The migration name in Supabase is `portal_v2_additions`.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. BASE SCHEMA (informational — already applied)
-- -----------------------------------------------------------------------------

-- Enums
do $$ begin create type app_role as enum ('mentee','mentor','admin','director'); exception when duplicate_object then null; end $$;
do $$ begin create type app_rhythm as enum ('monthly','fortnightly','weekly','unsure'); exception when duplicate_object then null; end $$;
do $$ begin create type session_rhythm as enum ('monthly','fortnightly','weekly'); exception when duplicate_object then null; end $$;
do $$ begin create type contact_mode as enum ('video','phone','in_person'); exception when duplicate_object then null; end $$;
do $$ begin create type session_status as enum ('scheduled','completed','cancelled','no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type subscription_status as enum ('active','paused','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type application_status as enum ('new','in_review','approved','declined'); exception when duplicate_object then null; end $$;
do $$ begin create type journal_mode as enum ('structured','freewrite'); exception when duplicate_object then null; end $$;

-- Helper functions used by RLS
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = _user_id and role = _role
  )
$$;

create or replace function public."current_role"()
returns app_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'mentee',
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- applications (Session Zero waiting list)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_name text not null,
  email text not null,
  reason_for_support text,
  preferred_rhythm app_rhythm not null default 'unsure',
  preferred_mode contact_mode not null default 'video',
  consent boolean not null default false,
  status application_status not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.applications enable row level security;

-- application_notes (admin-only annotations on applications)
create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  body text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.application_notes enable row level security;

-- journal_entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  mode journal_mode not null,
  question_1_current_reality text,
  question_2_pressure_cost text,
  question_3_clarity_learning text,
  question_4_direction text,
  question_5_orientation text,
  freewrite_text text,
  shared_with_mentor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.journal_entries enable row level security;

-- sessions
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id),
  scheduled_at timestamptz not null,
  duration_mins integer not null default 60,
  mode contact_mode not null default 'video',
  status session_status not null default 'scheduled',
  created_at timestamptz not null default now()
);
alter table public.sessions enable row level security;

-- session_notes
create table if not exists public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  ground_covered text,
  what_was_named text,
  framework_used text,
  to_sit_with text,
  created_at timestamptz not null default now()
);
alter table public.session_notes enable row level security;

-- commitments
create table if not exists public.commitments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.commitments enable row level security;

-- messages (between sessions)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  bring_to_session boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

-- subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  rhythm session_rhythm not null,
  status subscription_status not null default 'active',
  stripe_subscription_id text,
  started_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;

-- =============================================================================
-- BASE RLS policies (existing — already applied)
-- =============================================================================
-- Listed here for completeness; recreating them is harmless because each
-- `create policy` statement is preceded by `drop policy if exists`.

-- profiles -------------------------------------------------------------------
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select using (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "admin reads all profiles" on public.profiles;
create policy "admin reads all profiles" on public.profiles for select
  using (has_role(auth.uid(), 'admin'::app_role));

drop policy if exists "director reads all profiles" on public.profiles;
create policy "director reads all profiles" on public.profiles for select
  using (has_role(auth.uid(), 'director'::app_role));

drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles for all
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

-- A mentor can also see a profile if they share at least one session with it
-- (existing session-based assignment).
drop policy if exists "mentor reads assigned mentees" on public.profiles;
create policy "mentor reads assigned mentees" on public.profiles for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.sessions s
      where s.mentor_id = auth.uid() and s.mentee_id = profiles.id
    )
  );

-- (more base policies on other tables follow the same pattern; see migration
--  history in Supabase — we don't repeat them here to keep this file readable.)


-- =============================================================================
-- 2. PORTAL v2 ADDITIONS — applied as migration `portal_v2_additions`
-- =============================================================================
-- Re-running these blocks is safe.

-- profiles.mentor_id ---------------------------------------------------------
alter table public.profiles
  add column if not exists mentor_id uuid references public.profiles(id);
create index if not exists profiles_mentor_id_idx on public.profiles(mentor_id);

-- sessions.calendly_event_uri / calendly_invitee_uri -------------------------
alter table public.sessions
  add column if not exists calendly_event_uri text,
  add column if not exists calendly_invitee_uri text;

-- session_zero_bookings ------------------------------------------------------
-- Fallback for Calendly bookings whose invitee email has no matching profile.
create table if not exists public.session_zero_bookings (
  id uuid primary key default gen_random_uuid(),
  invitee_name text,
  invitee_email text,
  scheduled_at timestamptz,
  event_type_name text,
  calendly_event_uri text,
  calendly_invitee_uri text,
  status text default 'pending' check (status in ('pending','matched','cancelled')),
  raw_payload jsonb,
  created_at timestamptz default now()
);
alter table public.session_zero_bookings enable row level security;

drop policy if exists "admin and director read session_zero_bookings"
  on public.session_zero_bookings;
create policy "admin and director read session_zero_bookings"
  on public.session_zero_bookings for select
  using (has_role(auth.uid(), 'admin'::app_role)
      or has_role(auth.uid(), 'director'::app_role));

drop policy if exists "admin manages session_zero_bookings"
  on public.session_zero_bookings;
create policy "admin manages session_zero_bookings"
  on public.session_zero_bookings for all
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

-- notifications_log (5-min throttle for new_message emails) ------------------
-- Read/written only by the service-role key inside Netlify Functions.
create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  type text not null,
  sent_at timestamptz default now()
);
create index if not exists notifications_log_recipient_type_idx
  on public.notifications_log (recipient_email, type, sent_at desc);
alter table public.notifications_log enable row level security;

-- v2 RLS — assignment via profiles.mentor_id ---------------------------------
-- These coexist with the existing session-based "mentor reads X" policies.
-- A mentor sees a row if EITHER it has a session with the mentee OR the mentee
-- is assigned to them via mentor_id (eager assignment, before any session).

drop policy if exists "mentor reads assigned via mentor_id" on public.profiles;
create policy "mentor reads assigned via mentor_id"
  on public.profiles for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and mentor_id = auth.uid()
  );

drop policy if exists "mentor reads shared journal via mentor_id" on public.journal_entries;
create policy "mentor reads shared journal via mentor_id"
  on public.journal_entries for select
  using (
    shared_with_mentor = true
    and has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = journal_entries.mentee_id
        and m.mentor_id = auth.uid()
    )
  );

drop policy if exists "mentor reads sessions via mentor_id" on public.sessions;
create policy "mentor reads sessions via mentor_id"
  on public.sessions for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = sessions.mentee_id
        and m.mentor_id = auth.uid()
    )
  );

drop policy if exists "mentor reads commitments via mentor_id" on public.commitments;
create policy "mentor reads commitments via mentor_id"
  on public.commitments for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = commitments.mentee_id
        and m.mentor_id = auth.uid()
    )
  );

drop policy if exists "mentor inserts commitments via mentor_id" on public.commitments;
create policy "mentor inserts commitments via mentor_id"
  on public.commitments for insert
  with check (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = commitments.mentee_id
        and m.mentor_id = auth.uid()
    )
  );

drop policy if exists "mentor reads subscriptions via mentor_id" on public.subscriptions;
create policy "mentor reads subscriptions via mentor_id"
  on public.subscriptions for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles m
      where m.id = subscriptions.mentee_id
        and m.mentor_id = auth.uid()
    )
  );

-- handle_new_user trigger ----------------------------------------------------
-- Backfills profiles from auth.users metadata and auto-assigns the most
-- recently created mentor as the new mentee's mentor_id.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_mentor uuid;
begin
  select id into default_mentor
  from public.profiles
  where role = 'mentor'::app_role
  order by created_at desc
  limit 1;

  insert into public.profiles (id, full_name, email, role, mentor_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    'mentee'::app_role,
    default_mentor
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- One-shot backfill for existing mentees with no mentor_id.
update public.profiles p
set mentor_id = (
  select id from public.profiles where role = 'mentor'::app_role
  order by created_at desc limit 1
)
where p.mentor_id is null
  and p.role = 'mentee'::app_role;

-- session tools (v3) ----------------------------------------------------------
-- tool_results stores each tool's state keyed by tool ID: { "t6": {...}, ... }
alter table public.sessions
  add column if not exists tool_results jsonb default '{}';

-- source_tool records which OurPath tool generated a commitment (nullable)
alter table public.commitments
  add column if not exists source_tool text;
