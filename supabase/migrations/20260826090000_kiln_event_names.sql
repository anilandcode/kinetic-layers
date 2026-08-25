-- Widen the events check constraint to cover the Kiln event names.
--
-- The original constraint was written for the demand-test landing page and
-- listed only its six events. Kiln's instrumentation sent `gate_hit`,
-- `download`, `search` and `unlock_click`, every one of which the database
-- rejected with 23514 — and /api/event catches insert errors and answers 204
-- regardless, so the failure was completely silent. The table simply stayed
-- full of page_views and nothing else, with no error anywhere to explain it.
--
-- Keep this list in step with EVENT_NAMES in lib/contracts.ts. Two places
-- validate the same set on purpose: the route rejects junk before it reaches
-- the database, and the constraint is the backstop if the route is ever wrong.

alter table public.events drop constraint if exists events_event_check;

alter table public.events add constraint events_event_check check (event in (
  -- Kiln
  'page_view',
  'search',
  'download',
  'gate_hit',
  'unlock_click',
  'cta_click',
  'form_start',
  'form_submit',
  'qualified_submit',
  -- Retained from the demand test so its existing rows stay valid.
  'concept_click'
));
