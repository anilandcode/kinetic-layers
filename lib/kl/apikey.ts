import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { admin } from "@/lib/supabase/admin";
import type { Viewer } from "./types";

/**
 * API keys for the MCP endpoint.
 *
 * An agent has no cookies, so the MCP server needs another way to know who is
 * asking — and it must know, because the entitlement rule that guards the
 * website has to guard this too. A second door with no lock is not a paywall.
 *
 * Only the SHA-256 hash is stored. The plaintext is returned once at creation
 * and never again, so a database dump yields nothing usable.
 */

const PREFIX = "kiln_";

export function mintKey() {
  const secret = randomBytes(24).toString("base64url");
  const key = `${PREFIX}${secret}`;
  return { key, hash: hashKey(key), prefix: key.slice(0, PREFIX.length + 4) };
}

export const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

/**
 * Resolve a key to a viewer, or null.
 *
 * The hash comparison is constant-time. That matters less than it would for a
 * password — the value compared is already a hash of a 192-bit random secret,
 * so guessing is hopeless either way — but a timing-variable compare on a
 * credential is the kind of thing that becomes a real problem the moment the
 * surrounding code changes.
 */
export async function viewerFromApiKey(key: string | null): Promise<Viewer | null> {
  if (!key || !key.startsWith(PREFIX)) return null;

  const db = admin();
  const hash = hashKey(key);

  const { data: row } = await db
    .from("api_keys")
    .select("id, user_id, key_hash, revoked_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (!row || row.revoked_at) return null;

  const a = Buffer.from(row.key_hash);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [{ data: profile }, { data: ent }] = await Promise.all([
    db.from("profiles").select("email").eq("id", row.user_id).maybeSingle(),
    db.from("entitlements").select("plan, status, current_period_end").eq("user_id", row.user_id).maybeSingle(),
  ]);

  /* Fire-and-forget: a failed touch must not deny an otherwise valid key. */
  void db.from("api_keys").update({ last_used: new Date().toISOString() }).eq("id", row.id);

  const active = ent?.plan === "premium" && ent?.status === "active";
  return {
    id: row.user_id,
    email: profile?.email ?? null,
    plan: active ? "premium" : "free",
    premium: active,
    periodEnd: ent?.current_period_end ?? null,
  };
}

/** Pulls the key out of Authorization: Bearer, or the X-Api-Key header. */
export function keyFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return request.headers.get("x-api-key");
}
