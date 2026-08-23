-- Move the demand-test tables into `public`.
--
-- The first migration put them in their own schema, which is the right shape
-- when the tables share a project with something else. This project is
-- dedicated to the demand test, so the isolation buys nothing — and PostgREST
-- only exposes `public` and `graphql_public` by default, so the API could not
-- reach them there without extra configuration.
--
-- There is no data to preserve: this runs on a project created minutes ago.

drop schema if exists direction_kit cascade;

-- ---------------------------------------------------------------------------
-- Invitation requests
-- ---------------------------------------------------------------------------
create table if not exists public.invite_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  email       text not null,
  role        text check (role in ('agency', 'freelancer', 'neither')),
  shipped     text check (shipped in ('0-1', '2-5', '6plus')),
  concept     text check (concept in ('signal-arc', 'proof-ledger', 'studio-current')),
  blocker     text,

  interview   boolean not null default false,
  consent     boolean not null default false,

  variant     text not null default 'unknown' check (variant in ('a', 'b', 'unknown')),
  source      text not null default 'unknown',

  -- Qualification is the recruiting spec, computed in the database so it can
  -- never drift from whatever the application happened to believe that day:
  -- delivers client sites, and shipped at least two in the last year.
  qualified   boolean generated always as (
                role in ('agency', 'freelancer')
                and shipped in ('2-5', '6plus')
              ) stored,

  -- Our own QA traffic, excluded from every reading.
  qa          boolean not null default false,

  -- Salted hash of the client address. Enough to spot one bot submitting two
  -- hundred times; not enough to identify a person.
  visitor     text
);

comment on table public.invite_requests is
  'Non-binding invitation requests. No payment detail is ever collected here.';

create index if not exists invite_requests_reading_idx
  on public.invite_requests (variant, qualified)
  where qa = false;

create index if not exists invite_requests_created_idx
  on public.invite_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- First-party events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),

  event       text not null check (event in (
                'page_view', 'concept_click', 'cta_click',
                'form_start', 'form_submit', 'qualified_submit'
              )),
  variant     text not null default 'unknown' check (variant in ('a', 'b', 'unknown')),
  source      text not null default 'unknown',
  qa          boolean not null default false,

  path        text,
  viewport    text,
  detail      text,
  visitor     text
);

comment on table public.events is
  'Page views and interactions. Carries no content the visitor typed.';

create index if not exists events_reading_idx
  on public.events (event, variant)
  where qa = false;

create index if not exists events_created_idx
  on public.events (created_at desc);

-- ---------------------------------------------------------------------------
-- Lock the doors
-- ---------------------------------------------------------------------------
alter table public.invite_requests enable row level security;
alter table public.events          enable row level security;

-- No policies are defined on purpose. With RLS on and no policy, the anon and
-- authenticated roles can do nothing at all. The API routes reach these tables
-- with the secret key, which bypasses RLS, and no browser ever talks to
-- Postgres directly. Adding a policy later would be a deliberate act rather
-- than an oversight.

revoke all on public.invite_requests from anon, authenticated;
revoke all on public.events          from anon, authenticated;
