import "server-only";
import { SUPABASE_URL, SUPABASE_KEY, authConfigured } from "./config";

/**
 * Which social logins this project actually has switched on.
 *
 * The join page used to offer Google and GitHub unconditionally, and clicking
 * either one bounced the visitor to Supabase to be handed raw JSON:
 *
 *   {"code":400,"error_code":"validation_failed",
 *    "msg":"Unsupported provider: provider is not enabled"}
 *
 * `signInWithProvider` in app/auth/actions.ts does guard against this, but the
 * guard cannot fire: `signInWithOAuth` builds the authorize URL on the client
 * side without asking whether the provider exists, so it returns a `data.url`
 * and no error every time. The failure only happens once the browser follows
 * that URL, which is too late to say anything useful.
 *
 * Supabase publishes the answer at /auth/v1/settings, readable with the
 * publishable key. Ask it, and a provider that is off simply has no button.
 *
 * Cached for five minutes: this changes when someone edits the dashboard, not
 * per request, and a login screen should not wait on a round trip to render.
 */

type Settings = { external?: Record<string, boolean> };

export type Provider = "google" | "github";

const SUPPORTED: Provider[] = ["google", "github"];

export async function enabledProviders(): Promise<Provider[]> {
  if (!authConfigured) return [];

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const settings = (await res.json()) as Settings;
    return SUPPORTED.filter((p) => settings.external?.[p] === true);
  } catch {
    /* Fail closed. An unreachable settings endpoint means we cannot promise a
       provider works, and a button that 400s is worse than one that is absent —
       email sign-in is always there underneath. */
    return [];
  }
}
