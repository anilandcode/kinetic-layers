-- Stripe's half of the entitlement seam.
--
-- `entitlements` already holds the answer to "may they have it" and is written
-- by the server alone. Until now the only writer was /api/admin/grant. The
-- Stripe webhook writes the same row, so the gate, the quota tiers and every
-- plan state in the UI keep working untouched — they never learn where the
-- entitlement came from, which is the point of the seam.
--
-- Both columns are nullable: rows granted by hand have no Stripe objects, and
-- must stay valid.

alter table public.entitlements
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text;

comment on column public.entitlements.stripe_customer_id is
  'Stripe customer. Null for comps and admin grants.';
comment on column public.entitlements.stripe_subscription_id is
  'Stripe subscription. Null for comps and admin grants.';

-- One customer owns at most one row. Webhooks arrive out of order and are
-- redelivered on failure, so the unique index is what makes a replay an update
-- instead of a second entitlement.
--
-- Partial, because NULLs are not distinct enough on their own here: every
-- hand-granted row would otherwise collide once a second one existed.
create unique index if not exists entitlements_stripe_customer_idx
  on public.entitlements (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists entitlements_stripe_subscription_idx
  on public.entitlements (stripe_subscription_id)
  where stripe_subscription_id is not null;
