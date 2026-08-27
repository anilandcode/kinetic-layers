-- Let the meter carry abuse counters too.
--
-- /api/subscribe and /api/event take writes with no account at all: a honeypot
-- and a body-size cap, but nothing that stops the same caller doing it a
-- thousand times. Rather than build a second rate limiter, they reuse
-- consume_quota — which is already atomic under concurrency, which a fresh
-- one would have to prove all over again.
--
-- These rows are always written with user_id null, so they never surface in
-- the per-account usage tile: that reads through RLS, which shows a user only
-- their own rows.

alter table public.usage drop constraint if exists usage_kind_check;

alter table public.usage
  add constraint usage_kind_check
  check (kind in ('prompt', 'download', 'subscribe', 'event'));
