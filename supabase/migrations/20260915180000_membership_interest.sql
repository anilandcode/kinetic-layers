-- Founding Membership is a separate, non-binding interest list. Newsletter
-- consent cannot be reused here: someone may want launch information without
-- agreeing to the regular digest, and an interest record must never imply an
-- entitlement, subscription, or payment method.

create extension if not exists citext;

create table if not exists public.membership_interest (
  id           uuid primary key default gen_random_uuid(),
  email        citext not null unique,
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz,
  token        uuid not null default gen_random_uuid(),
  source       text not null default 'unknown'
);

create index if not exists membership_interest_confirmed_idx
  on public.membership_interest (confirmed_at)
  where confirmed_at is not null;
create index if not exists membership_interest_token_idx
  on public.membership_interest (token);

alter table public.membership_interest enable row level security;

-- No client policy: anonymous visitors submit through the rate-limited route,
-- and only the server-side service key can read launch interest.
