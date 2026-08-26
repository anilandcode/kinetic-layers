-- Usage meter, for the daily prompt and download allowances.
--
-- Why not reuse `downloads`: its user_id is NOT NULL with a foreign key to
-- auth.users, so it has nowhere to put an anonymous visitor — and anonymous
-- visitors are exactly who the tightest allowance applies to. It is also the
-- receipt list a user reads on /account, which is a different job from a meter.
-- So `downloads` stays the receipt and this becomes the count.
--
-- `subject` is the thing being metered, not necessarily a user:
--   'user:<uuid>'   a signed-in account, or an API key acting for one
--   'anon:<16 hex>' visitorHash(), which salts the client IP with the secret
--
-- The anonymous key is deliberately weak. It keys on IP, so an office behind
-- one NAT counts as a single visitor and a phone moving between cells counts as
-- several. That is fine for a one-a-day teaser and would not be fine as a
-- paywall, which is why anonymous downloads are zero rather than a small number.

create table if not exists public.usage (
  id         bigint generated always as identity primary key,
  subject    text not null,
  -- Null for anonymous. Set for accounts so a user can read their own rows
  -- through RLS, and so deleting an account takes its meter with it.
  user_id    uuid references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('prompt', 'download')),
  asset_slug text not null,
  created_at timestamptz not null default now()
);

-- Every read is "how many rows for this subject and kind since T". Mirrors the
-- shape of downloads_user_idx, which serves the same kind of question.
create index if not exists usage_window_idx
  on public.usage (subject, kind, created_at desc);

alter table public.usage enable row level security;

-- Readable by its owner so /account can show today's usage. No insert policy:
-- rows are written with the service key from the routes that enforce the
-- limit, which is the only place that can be trusted to count honestly.
create policy "own usage" on public.usage
  for select using (auth.uid() = user_id);
