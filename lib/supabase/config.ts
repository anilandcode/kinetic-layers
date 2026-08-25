/**
 * Whether Supabase auth is wired up.
 *
 * The publishable key is fetched from the project dashboard and may not be set
 * yet. Without it the site must still render — the catalogue is public and does
 * not need a session — so every auth path checks this first and reports
 * honestly instead of throwing a 500 on a page that had no need of a user.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const authConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const AUTH_UNAVAILABLE =
  "Accounts are not connected yet — NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing.";
