-- API keys, so the MCP server can act for a user without a browser session.
--
-- The MCP endpoint is used by an agent, which has no cookies. It needs to know
-- who is asking so the SAME entitlement rule that guards the website can guard
-- it too — otherwise the paywall has a second door with no lock on it.
--
-- Only the SHA-256 hash of a key is stored. A leaked database dump therefore
-- yields nothing usable, and the plaintext is shown exactly once at creation.
-- The prefix is kept separately so the UI can say "kiln_a1b2…" without being
-- able to reconstruct the key.

create table if not exists public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'MCP',
  -- sha256 hex of the plaintext key. Never the key itself.
  key_hash    text not null unique,
  -- First few characters, for display only.
  prefix      text not null,
  created_at  timestamptz not null default now(),
  last_used   timestamptz,
  revoked_at  timestamptz
);

create index if not exists api_keys_user_idx on public.api_keys (user_id);
create index if not exists api_keys_hash_idx on public.api_keys (key_hash);

alter table public.api_keys enable row level security;

-- A user may see and revoke their own keys. Nobody may read key_hash back for
-- someone else, and nobody may INSERT through this policy — keys are minted
-- server-side, where the plaintext can be generated and returned exactly once.
create policy "own api keys" on public.api_keys
  for select using (auth.uid() = user_id);

create policy "revoke own api keys" on public.api_keys
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own api keys" on public.api_keys
  for delete using (auth.uid() = user_id);
