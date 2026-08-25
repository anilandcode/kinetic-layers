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

/**
 * The gate, in one place.
 *
 * Free assets need an account — the free tier is a reason to sign up, not a
 * reason to skip signing up. Everything else needs an active unlimited
 * entitlement. Both the item page and the download route ask this, so the UI
 * can never disagree with what the server will actually allow.
 */
export function canDownload(viewer: Viewer | null, asset: Pick<Asset, "free">): boolean {
  if (!viewer) return false;
  return asset.free ? true : viewer.unlimited;
}

/** Why the gate is closed, for the copy on the item page. */
export function gateReason(
  viewer: Viewer | null,
  asset: Pick<Asset, "free">
): "open" | "needs-account" | "needs-unlimited" {
  if (canDownload(viewer, asset)) return "open";
  if (!viewer) return "needs-account";
  return "needs-unlimited";
}
