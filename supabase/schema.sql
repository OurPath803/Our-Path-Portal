-- Run this in your Supabase SQL editor

-- Profiles (extends auth.users)
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
create policy "Mentors can view mentee profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'mentor')
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Journal entries
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
create policy "Mentors can read shared entries" on journal_entries for select using (
  shared_with_mentor = true and
  exists (
    select 1 from profiles mentee
    join profiles mentor on mentee.mentor_id = mentor.id
    where mentee.id = journal_entries.user_id and mentor.id = auth.uid()
  )
);

-- Sessions
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
create policy "Users can view their sessions" on sessions for select using (
  auth.uid() = mentee_id or auth.uid() = mentor_id
);
create policy "Mentors can manage sessions" on sessions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'mentor')
);

-- Messages (between sessions)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table messages enable row level security;
create policy "Users can view their messages" on messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "Users can send messages" on messages for insert with check (auth.uid() = sender_id);
create policy "Users can mark messages read" on messages for update using (auth.uid() = receiver_id);

-- Enable realtime for messages
alter publication supabase_realtime add table messages;

-- Session notes (written by mentor after each session)
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
create policy "Mentees can view their notes" on session_notes for select using (auth.uid() = mentee_id);
create policy "Mentors can manage notes" on session_notes for all using (auth.uid() = mentor_id);

-- Commitments
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
create policy "Mentors can view mentee commitments" on commitments for select using (
  exists (
    select 1 from profiles mentee
    join profiles mentor on mentee.mentor_id = mentor.id
    where mentee.id = commitments.user_id and mentor.id = auth.uid()
  )
);

-- Session Zero applications
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
create policy "Mentors can view applications" on applications for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'mentor')
);
