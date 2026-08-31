import "server-only";
import { getDb } from "@/lib/supabase";

/**
 * Confirming and unsubscribing, in one place.
 *
 * Both are reachable from two entrances — a page a person lands on, and a
 * route an email client calls — and the rule must not differ between them.
 * A token is the whole authorisation: unguessable, and an unsubscribe that
 * demanded a login would be an unsubscribe nobody completes.
 */

export type Outcome = "done" | "already" | "unknown" | "error";

export async function confirmByToken(token: string): Promise<Outcome> {
  if (!isUuid(token)) return "unknown";
  const db = getDb();

  const { data, error } = await db
    .from("subscribers")
    .select("id, confirmed_at, unsubscribed_at")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    console.error("confirm lookup failed:", error.message);
    return "error";
  }
  if (!data) return "unknown";

  /* Someone who unsubscribed and then followed an old confirmation link must
     not be quietly put back on. Subscribing again is their decision to make
     from the site, not a consequence of clicking a stale email. */
  if (data.unsubscribed_at) return "unknown";
  if (data.confirmed_at) return "already";

  const { error: upErr } = await db
    .from("subscribers")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("id", data.id);
  if (upErr) {
    console.error("confirm failed:", upErr.message);
    return "error";
  }
  return "done";
}

export async function unsubscribeByToken(token: string): Promise<Outcome> {
  if (!isUuid(token)) return "unknown";
  const db = getDb();

  const { data, error } = await db
    .from("subscribers")
    .select("id, unsubscribed_at")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    console.error("unsubscribe lookup failed:", error.message);
    return "error";
  }
  if (!data) return "unknown";
  if (data.unsubscribed_at) return "already";

  const { error: upErr } = await db
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", data.id);
  if (upErr) {
    console.error("unsubscribe failed:", upErr.message);
    return "error";
  }
  return "done";
}

/* Checked before the query so a malformed token is a miss rather than a
   Postgres error on a uuid column. */
const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
