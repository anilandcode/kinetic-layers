-- Make spending an allowance atomic.
--
-- The quota was two statements: count the rows in the window, then insert one.
-- Between those, nothing stopped another request doing the same. Ten concurrent
-- reads against production were granted three times an allowance of one, and
-- with more concurrency the number goes up — which is exactly the unlimited
-- loop the limit exists to prevent. Serverless makes it worse: parallel
-- requests land on different instances, so no amount of in-process care helps.
--
-- The advisory lock is the fix. It serialises every concurrent request for one
-- subject and kind, so the count a request reads is the count it acts on. It is
-- taken per (subject, kind), not globally, so two different visitors never wait
-- on each other. Transaction-scoped, so it is released even if the statement
-- errors.

create or replace function public.consume_quota(
  p_subject         text,
  p_user            uuid,
  p_kind            text,
  p_slug            text,
  p_limit           int,
  p_window_seconds  int
)
returns table (allowed boolean, used int, resets_at timestamptz, usage_id bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used    int;
  v_oldest  timestamptz;
  v_id      bigint;
  v_window  interval := make_interval(secs => p_window_seconds);
begin
  perform pg_advisory_xact_lock(hashtextextended(p_subject || ':' || p_kind, 0));

  select count(*), min(created_at)
    into v_used, v_oldest
    from public.usage
   where subject = p_subject
     and kind = p_kind
     and created_at > now() - v_window;

  if v_used >= p_limit then
    return query select false, v_used, v_oldest + v_window, null::bigint;
    return;
  end if;

  insert into public.usage (subject, user_id, kind, asset_slug)
       values (p_subject, p_user, p_kind, p_slug)
    returning id into v_id;

  -- The window frees up one unit at a time, when the OLDEST use ages out. On
  -- the first spend there is no older row, so it is this one.
  return query select true, v_used + 1, coalesce(v_oldest, now()) + v_window, v_id;
end
$$;

-- Callers are server-side only and use the service key, which bypasses RLS.
-- No grant to anon or authenticated: a client that could call this directly
-- could spend someone else's allowance, or mint rows under any subject.
revoke all on function public.consume_quota(text, uuid, text, text, int, int) from public, anon, authenticated;
