import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the secret key, which bypasses RLS. The tables have RLS enabled with no
 * policies at all, so this is the only way in — no browser ever reaches
 * Postgres. Neither variable is prefixed NEXT_PUBLIC_, so neither can be
 * bundled into client code even by accident.
 */

let cached: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SECRET_KEY must be set. Copy .env.example to .env.local for development, and set both in the Vercel project settings for deploys."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * A salted, truncated hash of the client address.
 *
 * Enough to spot one bot submitting two hundred times; not enough to identify
 * a person or to be worth stealing. The salt is the secret key, which never
 * leaves the server, so the hashes cannot be recomputed from outside.
 */
export async function visitorHash(request: Request): Promise<string> {
  /**
   * Prefer headers the platform sets over ones a client can send.
   *
   * `x-forwarded-for` is a request header like any other: a client can put
   * whatever it likes in it. Vercel overwrites it at the edge, so on production
   * this was already safe — I confirmed a spoofed value is ignored there — but
   * it is trusted blindly by this function, and locally, or behind any proxy
   * that appends rather than replaces, rotating the header mints a fresh
   * identity per request and the anonymous allowance becomes unlimited.
   *
   * `x-vercel-forwarded-for` is set by Vercel's edge and is not forwardable,
   * so it is checked first; `x-real-ip` is the usual equivalent elsewhere.
   */
  const trusted =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip") ?? "";
  const forwarded = trusted || request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  const salt = process.env.SUPABASE_SECRET_KEY ?? "unsalted";

  const bytes = new TextEncoder().encode(`${salt}|${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
