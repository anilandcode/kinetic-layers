-- Demand-test storage.
--
-- Everything lives in its own schema so the tables stay easy to drop when the
-- validation ends, and so they never collide with anything else in the project.
--
-- RLS is enabled with no policies at all. That denies every anon and
-- authenticated request outright; the API routes reach these tables with the
-- secret key, which bypasses RLS. No client ever talks to Postgres directly.

create schema if not exists direction_kit;

-- ---------------------------------------------------------------------------
-- Invitation requests
-- ---------------------------------------------------------------------------
create table if not exists direction_kit.invite_requests (
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

comment on table direction_kit.invite_requests is
  'Non-binding invitation requests. No payment detail is ever collected here.';

create index if not exists invite_requests_reading_idx
  on direction_kit.invite_requests (variant, qualified)
  where qa = false;

create index if not exists invite_requests_created_idx
  on direction_kit.invite_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- First-party events
-- ---------------------------------------------------------------------------
create table if not exists direction_kit.events (
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

comment on table direction_kit.events is
  'Page views and interactions. Carries no content the visitor typed.';

create index if not exists events_reading_idx
  on direction_kit.events (event, variant)
  where qa = false;

create index if not exists events_created_idx
  on direction_kit.events (created_at desc);

-- ---------------------------------------------------------------------------
-- Lock the doors
-- ---------------------------------------------------------------------------
alter table direction_kit.invite_requests enable row level security;
alter table direction_kit.events          enable row level security;

-- No policies are defined on purpose. With RLS on and no policy, anon and
-- authenticated roles can do nothing at all. Adding a policy later would be a
-- deliberate act, not an oversight.

revoke all on schema direction_kit from anon, authenticated;
revoke all on all tables in schema direction_kit from anon, authenticated;
