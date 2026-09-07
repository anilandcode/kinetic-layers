-- Step 3 of 3: drop the legacy value.
--
-- DO NOT RUN THIS UNTIL THE STEP 2 CODE IS LIVE.
--
-- Until the deployment that writes 'premium' is actually serving traffic, the
-- running app still writes 'unlimited'. Narrowing the constraint before then
-- fails every entitlement write — the Stripe webhook included, which would
-- accept a payment and then fail to grant it.
--
-- The safe order is:
--   1. deploy the step 2 code (npx vercel --prod)
--   2. confirm it is live, and that no row has plan = 'unlimited'
--   3. run this
--
-- Step 2 already backfilled every existing row, so the guard below should find
-- nothing. It exists because "should" is not "did": a webhook that fired from
-- the old deployment between the backfill and this migration would have
-- written 'unlimited' again, and failing loudly beats silently violating a
-- constraint that is about to be enforced.

do $$
declare
  stragglers int;
begin
  select count(*) into stragglers
  from public.entitlements
  where plan = 'unlimited';

  if stragglers > 0 then
    raise exception
      'Refusing to contract: % row(s) still say ''unlimited''. The old deployment is probably still serving. Re-run the backfill, confirm the new code is live, then try again.',
      stragglers;
  end if;
end $$;

alter table public.entitlements
  drop constraint if exists entitlements_plan_check;

alter table public.entitlements
  add constraint entitlements_plan_check
  check (plan in ('free', 'premium'));

-- has_premium no longer needs to accept the old value.
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
      and e.plan = 'premium'
      and e.status = 'active'
      and (e.current_period_end is null or e.current_period_end > now())
  );
$$;

comment on function public.has_premium(uuid) is
  'Whether this account may take files.';

-- Nothing in the application calls this; gating is computed in TypeScript from
-- the plan column. It is dropped rather than left as a second answer to the
-- same question that could drift from the first.
drop function if exists public.has_unlimited(uuid);
