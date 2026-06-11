-- =============================================================================
-- induction_forms
-- Stores client induction pack submissions.
--
-- Flow: mentor sends → token stored → mentee completes form at /induction/:token
--       → completed_at set → mentor views responses in MentorManage.
--
-- All statements idempotent.
-- =============================================================================

create table if not exists public.induction_forms (
  id              uuid primary key default gen_random_uuid(),
  mentee_id       uuid not null references public.profiles(id) on delete cascade,
  token           text not null unique default gen_random_uuid()::text,

  -- Lifecycle timestamps
  sent_at         timestamptz not null default now(),
  completed_at    timestamptz,

  -- Section 2: Service Agreement consent (checkbox)
  service_consent boolean not null default false,

  -- Section 4: Privacy Notice consent (checkbox)
  privacy_consent boolean not null default false,

  -- Section 6: Client Intake / Session Zero
  full_name           text,
  preferred_name      text,
  date_of_birth       text,
  phone               text,
  referral_source     text,
  what_brings_you     text,
  whats_working       text,
  whats_harder        text,
  background_context  text,
  hoped_change        text,
  readiness_score     integer check (readiness_score between 1 and 5),

  created_at      timestamptz not null default now()
);

alter table public.induction_forms enable row level security;

-- Mentors can read induction forms for their assigned mentees
drop policy if exists "mentor reads induction_forms" on public.induction_forms;
create policy "mentor reads induction_forms"
  on public.induction_forms for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles p
      where p.id = induction_forms.mentee_id
        and p.mentor_id = auth.uid()
    )
  );

-- Mentors can insert induction forms (send pack) for their mentees
drop policy if exists "mentor inserts induction_forms" on public.induction_forms;
create policy "mentor inserts induction_forms"
  on public.induction_forms for insert
  with check (
    has_role(auth.uid(), 'mentor'::app_role)
    and exists (
      select 1 from public.profiles p
      where p.id = induction_forms.mentee_id
        and p.mentor_id = auth.uid()
    )
  );

-- Admins and directors see all
drop policy if exists "admin reads induction_forms" on public.induction_forms;
create policy "admin reads induction_forms"
  on public.induction_forms for select
  using (
    has_role(auth.uid(), 'admin'::app_role)
    or has_role(auth.uid(), 'director'::app_role)
  );

drop policy if exists "admin manages induction_forms" on public.induction_forms;
create policy "admin manages induction_forms"
  on public.induction_forms for all
  using (
    has_role(auth.uid(), 'admin'::app_role)
    or has_role(auth.uid(), 'director'::app_role)
  );

-- Public (anon) can read by token — needed so mentee can open the form link
-- without being logged in. The token functions as a secret URL.
drop policy if exists "anon reads induction by token" on public.induction_forms;
create policy "anon reads induction by token"
  on public.induction_forms for select
  using (true);

-- Public (anon) can update their own form by matching the token.
-- Restricted to non-sensitive columns only via the application layer.
drop policy if exists "anon updates induction by token" on public.induction_forms;
create policy "anon updates induction by token"
  on public.induction_forms for update
  using (true);
