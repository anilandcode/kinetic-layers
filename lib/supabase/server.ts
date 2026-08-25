import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_KEY, SUPABASE_URL, authConfigured } from "./config";

/**
 * Server client, acting as the signed-in user.
 *
 * Deliberately uses the publishable key, not the secret one: this client is
 * meant to be constrained by RLS. Anything that legitimately needs to bypass
 * RLS goes through lib/supabase/admin.ts instead, which is the only place the
 * secret key is used.
 */
export async function createClient() {
  if (!authConfigured) return null;
  const store = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* Called from a server component, where cookies are read-only.
             middleware.ts refreshes the session, so this is safe to ignore. */
        }
      },
    },
  });
}
