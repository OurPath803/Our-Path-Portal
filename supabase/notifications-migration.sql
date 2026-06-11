-- =============================================================================
-- Notification preferences column on profiles
--
-- Stores per-user email notification preferences as a JSONB object.
-- Keys: session_reminders, session_confirmations, journal_prompts, newsletter
-- Default: null (treated as all-on by the application layer)
-- =============================================================================

alter table public.profiles
  add column if not exists notification_prefs jsonb;
