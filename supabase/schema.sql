-- Run this in your Supabase SQL editor.
--
-- IMPORTANT — re-running on an existing database:
-- Postgres will not silently replace an existing policy. If you previously
-- applied an earlier version of this schema, drop the old policies before
-- re-running. The full set is grouped at the bottom of this file under the
-- "DROP POLICY IF EXISTS …" block — uncomment it for a clean re-apply.

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text default 'mentee', -- 'mentee' | 'mentor'
  mentor_id uuid references profiles(id),
  rhythm text, -- 'monthly' | 'fortnightly' | 'weekly'
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Assignment-scoped: a mentor only sees their own assigned mentees.
create policy "Mentors can view their assigned mentees" on profiles for select using (
  mentor_id = auth.uid()
);
-- Mentors are allowed to update their assigned mentees (e.g. admin-level edits).
create policy "Mentors can update their assigned mentees" on profiles for update using (
  mentor_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup, auto-assign default mentor
-- ---------------------------------------------------------------------------
-- Picks the most-recently-created mentor profile. With one mentor (Shakil)
-- this just always returns him. If multiple mentors exist later, we'll fall
-- back to the most recent one — admin can re-assign manually after.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  default_mentor uuid;
begin
  select id into default_mentor
  from profiles
  where role = 'mentor'
  order by created_at desc
  limit 1;

  insert into profiles (id, full_name, email, mentor_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    default_mentor
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- Journal entries
-- ---------------------------------------------------------------------------
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('structured', 'freewrite')),
  q1 text, q2 text, q3 text, q4 text, q5 text,
  freewrite_content text,
  shared_with_mentor boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table journal_entries enable row level security;
create policy "Users own their journal" on journal_entries for all using (auth.uid() = user_id);
-- Assignment-scoped: a mentor only sees shared entries from their own mentees.
create policy "Mentors can read shared entries from their mentees" on journal_entries for select using (
  shared_with_mentor = true
  and exists (
    select 1 from profiles mentee
    where mentee.id = journal_entries.user_id
      and mentee.mentor_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid references profiles(id) on delete cascade not null,
  mentor_id uuid references profiles(id),
  scheduled_at timestamptz,
  duration_minutes integer default 60,
  mode text check (mode in ('video', 'phone', 'in_person')),
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  calendly_event_uri text,
  calendly_invitee_uri text,
  created_at timestamptz default now()
);

alter table sessions enable row level security;
-- Mentees see their own sessions. Mentors see sessions for their assigned
-- mentees only.
create policy "Mentees can view their sessions" on sessions for select using (
  auth.uid() = mentee_id
);
create policy "Mentors can view sessions for their mentees" on sessions for select using (
  exists (
    select 1 from profiles mentee
    where mentee.id = sessions.mentee_id
      and mentee.mentor_id = auth.uid()
  )
);
create policy "Mentors can manage sessions for their mentees" on sessions for all using (
  exists (
    select 1 from profiles mentee
    where mentee.id = sessions.mentee_id
      and mentee.mentor_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Session Zero / unmatched Calendly bookings
-- ---------------------------------------------------------------------------
-- Used by netlify/functions/calendly-webhook.js when a booking comes in for an
-- email that has no matching profile (e.g. someone booked Session Zero from the
-- marketing site before signing up). Admin can review and link manually.
create table if not exists session_zero_bookings (
  id uuid primary key default gen_random_uuid(),
  invitee_name text,
  invitee_email text,
  scheduled_at timestamptz,
  event_type_name text,
  calendly_event_uri text,
  calendly_invitee_uri text,
  status text default 'pending' check (status in ('pending', 'matched', 'cancelled')),
  raw_payload jsonb,
  created_at timestamptz default now()
);

alter table session_zero_bookings enable row level security;
create policy "Mentors can view session zero bookings" on session_zero_bookings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'mentor')
);

-- ---------------------------------------------------------------------------
-- Messages (between sessions)
-- ---------------------------------------------------------------------------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table messages enable row level security;
-- Users see their own messages (sender or receiver). Because mentor↔mentee is a
-- direct assignment, this is already assignment-scoped: the mentor only ever
-- has messages where they are sender_id or receiver_id of their own mentees.
create policy "Users can view their messages" on messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);
create policy "Users can mark messages read" on messages for update using (auth.uid() = receiver_id);

-- Enable realtime for messages
alter publication supabase_realtime add table messages;

-- ---------------------------------------------------------------------------
-- Session notes (written by mentor after each session)
-- ---------------------------------------------------------------------------
create table if not exists session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  mentee_id uuid references profiles(id) not null,
  mentor_id uuid references profiles(id) not null,
  ground_covered text,
  what_was_named text[],
  framework_in_use text,
  question_to_sit_with text,
  created_at timestamptz default now()
);

alter table session_notes enable row level security;
-- Mentees can read notes about themselves.
create policy "Mentees can view their notes" on session_notes for select using (
  auth.uid() = mentee_id
);
-- Mentors can manage notes only for mentees assigned to them.
create policy "Mentors can manage notes for their mentees" on session_notes for all using (
  auth.uid() = mentor_id
  and exists (
    select 1 from profiles mentee
    where mentee.id = session_notes.mentee_id
      and mentee.mentor_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Commitments
-- ---------------------------------------------------------------------------
create table if not exists commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  session_id uuid references sessions(id),
  text text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table commitments enable row level security;
create policy "Users own their commitments" on commitments for all using (auth.uid() = user_id);
-- Assignment-scoped: mentor reads commitments only from their assigned mentees.
create policy "Mentors can view commitments from their mentees" on commitments for select using (
  exists (
    select 1 from profiles mentee
    where mentee.id = commitments.user_id
      and mentee.mentor_id = auth.uid()
  )
);
-- Mentors can also create commitments for their mentees during note-writing.
create policy "Mentors can create commitments for their mentees" on commitments for insert with check (
  exists (
    select 1 from profiles mentee
    where mentee.id = commitments.user_id
      and mentee.mentor_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Session Zero applications (waiting list form)
-- ---------------------------------------------------------------------------
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  motivation text,
  preferred_rhythm text,
  preferred_mode text,
  status text default 'pending' check (status in ('pending', 'contacted', 'accepted', 'declined')),
  created_at timestamptz default now()
);

alter table applications enable row level security;
create policy "Anyone can submit an application" on applications for insert with check (true);
create policy "Mentors can manage applications" on applications for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'mentor')
);

-- ---------------------------------------------------------------------------
-- Notifications log (5-minute throttle for new_message emails)
-- ---------------------------------------------------------------------------
create table if not exists notifications_log (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  type text not null,
  sent_at timestamptz default now()
);
create index if not exists notifications_log_recipient_type_idx
  on notifications_log (recipient_email, type, sent_at desc);

alter table notifications_log enable row level security;
-- No client-side access — this is written/read only by the service-role key
-- inside Netlify Functions. RLS-enabled with no policies = effectively locked.

-- ---------------------------------------------------------------------------
-- DROP POLICY block — uncomment if re-applying on an existing database
-- ---------------------------------------------------------------------------
-- drop policy if exists "Mentors can view mentee profiles" on profiles;
-- drop policy if exists "Mentors can read shared entries" on journal_entries;
-- drop policy if exists "Users can view their sessions" on sessions;
-- drop policy if exists "Mentors can manage sessions" on sessions;
-- drop policy if exists "Mentors can view mentee commitments" on commitments;
-- drop policy if exists "Mentors can manage notes" on session_notes;
-- drop policy if exists "Mentors can view applications" on applications;
