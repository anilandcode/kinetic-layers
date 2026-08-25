import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
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

  const { data: ent } = await supabase
    .from("entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const active =
    ent?.plan === "unlimited" &&
    ent.status === "active" &&
    (!ent.current_period_end || new Date(ent.current_period_end) > new Date());

  return {
    id: user.id,
    email: user.email ?? null,
    plan: active ? "unlimited" : "free",
    unlimited: Boolean(active),
    periodEnd: ent?.current_period_end ?? null,
  };
});

/* The rule itself is pure and lives in ./gate so client components can share
   it. Re-exported here because every existing caller imports it from viewer,
   and one import path is easier to keep honest than two. */
export { canDownload, gateReason } from "./gate";
