-- =============================================================================
-- messages-attachments-migration.sql
-- Adds attachment columns to messages + full RLS policies for messages table.
-- Run once in Supabase SQL Editor. Safe to re-run.
-- =============================================================================

-- 1. Add attachment columns to messages --------------------------------------

alter table public.messages
  add column if not exists attachment_url  text,
  add column if not exists attachment_name text;

-- 2. RLS policies for messages -----------------------------------------------
-- Mentees can read/send their own messages.
-- Mentors can read/send messages involving their assigned mentees.
-- Admins can read/send all messages.

-- Mentee reads messages they sent or received
drop policy if exists "participants read own messages" on public.messages;
create policy "participants read own messages"
  on public.messages for select
  using (
    auth.uid() = sender_id
    or auth.uid() = recipient_id
  );

-- Mentee sends a message (they must be the sender)
drop policy if exists "participants insert own messages" on public.messages;
create policy "participants insert own messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Mentee can update read_at on messages sent to them
drop policy if exists "recipient marks message read" on public.messages;
create policy "recipient marks message read"
  on public.messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Mentor reads messages involving their assigned mentees
drop policy if exists "mentor reads messages via mentor_id" on public.messages;
create policy "mentor reads messages via mentor_id"
  on public.messages for select
  using (
    has_role(auth.uid(), 'mentor'::app_role)
    and (
      exists (
        select 1 from public.profiles p
        where p.id = messages.sender_id
          and p.mentor_id = auth.uid()
      )
      or exists (
        select 1 from public.profiles p
        where p.id = messages.recipient_id
          and p.mentor_id = auth.uid()
      )
    )
  );

-- Admin reads and manages all messages
drop policy if exists "admin manages messages" on public.messages;
create policy "admin manages messages"
  on public.messages for all
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));


-- 3. Storage bucket + policies -----------------------------------------------
-- Run these separately in the Supabase SQL Editor (Storage schema).
-- Or create the bucket manually in Supabase Dashboard → Storage → New bucket:
--   Name: message-attachments
--   Public: YES (so attachment URLs are directly accessible)
--
-- Then add these storage policies:

-- Allow authenticated users to upload to their own folder
drop policy if exists "authenticated users upload own attachments"
  on storage.objects;
create policy "authenticated users upload own attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read any attachment (links are shared in chat)
drop policy if exists "authenticated users read attachments"
  on storage.objects;
create policy "authenticated users read attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'message-attachments');

-- Allow users to delete their own uploads
drop policy if exists "users delete own attachments"
  on storage.objects;
create policy "users delete own attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
