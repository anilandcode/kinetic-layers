-- Step 1 of 3: widen, so 'unlimited' and 'premium' are both legal.
--
-- The plan is renamed to match the product's language, but a single migration
-- that swapped the value would break every request in flight: the running
-- deployment writes 'unlimited', and a constraint that no longer accepts it
-- fails the insert. So this expands first, the code moves second, and the old
-- value is dropped third — each step safe to deploy on its own, in either
-- order relative to the code.
--
-- Nothing is rewritten here. Existing rows keep saying 'unlimited' and keep
-- working, because has_unlimited still answers for them.

alter table public.entitlements
  drop constraint if exists entitlements_plan_check;

alter table public.entitlements
  add constraint entitlements_plan_check
  check (plan in ('free', 'unlimited', 'premium'));

-- The question the app asks, under its new name. Accepts both values for the
-- length of the migration, so it is correct before and after the backfill.
create or replace function public.has_premium(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = uid
      and e.plan in ('unlimited', 'premium')
      and e.status = 'active'
      and (e.current_period_end is null or e.current_period_end > now())
  );
$$;

comment on function public.has_premium(uuid) is
  'Whether this account may take files. Accepts the legacy ''unlimited'' value until step 3 drops it.';

-- has_unlimited stays and is widened the same way, so a deployment that has
-- not picked up the new code yet still gets the right answer for a row the
-- backfill has already moved to 'premium'.
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
      and e.plan in ('unlimited', 'premium')
      and e.status = 'active'
      and (e.current_period_end is null or e.current_period_end > now())
  );
$$;

comment on function public.has_unlimited(uuid) is
  'Superseded by has_premium. Widened during the rename so old and new code agree; removed in step 3.';
