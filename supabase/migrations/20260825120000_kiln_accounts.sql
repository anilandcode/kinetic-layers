-- Kiln accounts and entitlement.
--
-- Unlike invite_requests and events — which have RLS on and no policies
-- because only the server ever touches them — these tables are read by a
-- signed-in user's own session. So they get RLS *with* policies, scoped to
-- auth.uid(), and a user can never see another user's rows.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Created by trigger, never by the client.';

-- ---------------------------------------------------------------------------
-- Entitlement
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  user_id            uuid primary key references auth.users on delete cascade,
  plan               text not null default 'free' check (plan in ('free', 'unlimited')),
  status             text not null default 'active' check (status in ('active', 'past_due', 'cancelled')),
  current_period_end timestamptz,
  source             text not null default 'signup',
  updated_at         timestamptz not null default now()
);

comment on table public.entitlements is
  'What a user may download. Written only by the server — the grant route now, a Stripe webhook later.';

-- The single question the app asks. Kept in SQL so the answer cannot drift
-- between the page that renders the gate and the route that enforces it.
create or replace function public.has_unlimited(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = uid
      and e.plan = 'unlimited'
      and e.status = 'active'
      and (e.current_period_end is null or e.current_period_end > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- Activity
-- ---------------------------------------------------------------------------
create table if not exists public.downloads (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  asset_slug text not null,
  asset_name text,
  file_name  text,
  bytes      bigint,
  created_at timestamptz not null default now()
);

create index if not exists downloads_user_idx on public.downloads (user_id, created_at desc);

create table if not exists public.saved_collections (
  user_id         uuid not null references auth.users on delete cascade,
  collection_slug text not null,
  created_at      timestamptz not null default now(),
  primary key (user_id, collection_slug)
);

create table if not exists public.saved_assets (
  user_id    uuid not null references auth.users on delete cascade,
  asset_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, asset_slug)
);

-- ---------------------------------------------------------------------------
-- New users get a profile and a free entitlement, atomically
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.entitlements (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS — a user sees only their own rows
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.entitlements      enable row level security;
alter table public.downloads         enable row level security;
alter table public.saved_collections enable row level security;
alter table public.saved_assets      enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Read-only to the client on purpose: a user must not be able to grant
-- themselves unlimited. Writes go through the server.
drop policy if exists "own entitlement" on public.entitlements;
create policy "own entitlement" on public.entitlements
  for select using (auth.uid() = user_id);

drop policy if exists "own downloads" on public.downloads;
create policy "own downloads" on public.downloads
  for select using (auth.uid() = user_id);

drop policy if exists "own saved collections" on public.saved_collections;
create policy "own saved collections" on public.saved_collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own saved assets" on public.saved_assets;
create policy "own saved assets" on public.saved_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Private bucket for the gated files
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

-- No storage policies are created. The bucket stays unreachable to anon and
-- authenticated roles; the download route checks entitlement and then signs a
-- short-lived URL with the service key. A policy here would be a second,
-- weaker gate on the same door.
