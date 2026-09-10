import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { EARLY_ACCESS } from "./access";
import type { Asset, Viewer } from "./types";

/**
 * Who is looking, and what they may have.
 *
 * `cache` dedupes this across a single render, so a page and its nested
 * components asking independently still costs one round trip.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  if (!supabase) return null; // auth not configured; everyone is a visitor

  /* getUser revalidates against the auth server. getSession would trust the
     cookie, which is not good enough to hang entitlement off. */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  /* Both in flight at once: neither depends on the other, and this runs on
     every page that renders the header. */
  const [{ data: ent }, { data: profile }] = await Promise.all([
    supabase
      .from("entitlements")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
  ]);

  const entitled =
    ent?.plan === "premium" &&
    ent.status === "active" &&
    (!ent.current_period_end || new Date(ent.current_period_end) > new Date());

  /* While early access is on, an account IS the entitlement. This is the only
     place `premium` is decided, so the gate, the quota tier and every price
     string downstream follow from it without a second rule to keep in step. */
  const active = EARLY_ACCESS || entitled;

  return {
    id: user.id,
    email: user.email ?? null,
    /* profiles.display_name existed from the first migration and was read in
       one place and shown on none. The header greets people by name now, so it
       has somewhere to be. */
    name: profile?.display_name ?? null,
    plan: active ? "premium" : "free",
    premium: Boolean(active),
    periodEnd: ent?.current_period_end ?? null,
  };
});

/* The rule itself is pure and lives in ./gate so client components can share
   it. Re-exported here because every existing caller imports it from viewer,
   and one import path is easier to keep honest than two. */
export { canDownload, gateReason } from "./gate";
