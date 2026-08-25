import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client. Bypasses RLS.
 *
 * Only three things need it: granting entitlement, signing a Storage URL after
 * the gate has been checked, and the pre-existing invite/event routes. Never
 * use it to read user data on a user's behalf — that is what the RLS-scoped
 * server client is for.
 */
let cached: ReturnType<typeof createClient<Database>> | null = null;

export function admin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set.");
  cached = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}
