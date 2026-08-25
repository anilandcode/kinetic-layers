import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_KEY, SUPABASE_URL, authConfigured } from "./config";

/**
 * Browser client.
 *
 * Uses the publishable key, which is designed to ship in the bundle — RLS is
 * what protects the data, not the key. Every table it can reach has a policy
 * scoped to auth.uid().
 */
export function createClient() {
  if (!authConfigured) return null;
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY);
}
