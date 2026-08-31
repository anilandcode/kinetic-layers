-- The mailing list.
--
-- Deliberately not `invite_requests`. That table is the demand test — role,
-- shipped, blocker, and a generated `qualified` column — and it answers "who
-- is asking for this". A mailing list answers "who agreed to be emailed", has
-- a lifecycle (pending → confirmed → unsubscribed) the research table has no
-- column for, and must survive that research being thrown away. Two questions,
-- two tables.
--
-- Until now there was neither. /api/subscribe answered "Thanks — you are on
-- the list" while EMAIL_PROVIDER was unset and no list existed, and
-- /privacy promised "Every one of those emails can unsubscribe you" with no
-- unsubscribe anywhere in the codebase.

create extension if not exists citext;

create table if not exists public.subscribers (
  id              uuid primary key default gen_random_uuid(),
  -- citext, because Someone@Example.com and someone@example.com are one person
  -- and a case-sensitive unique index would happily hold both.
  email           citext not null unique,
  created_at      timestamptz not null default now(),
  -- Null until they click the link. Nobody is on the list before that.
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  -- Addresses both the confirm and the unsubscribe link. Unguessable, so an
  -- unsubscribe needs no login — which is the only kind anyone actually uses.
  token           uuid not null default gen_random_uuid(),
  source          text not null default 'unknown'
);

-- Sending reads "confirmed and not unsubscribed"; both links read by token.
create index if not exists subscribers_sendable_idx
  on public.subscribers (confirmed_at) where unsubscribed_at is null;
create index if not exists subscribers_token_idx on public.subscribers (token);

alter table public.subscribers enable row level security;

-- No policy at all. Every read and write goes through a route holding the
-- service key, exactly like `usage`. A client that could select this table
-- could enumerate the list; one that could update it could unsubscribe
-- strangers.
