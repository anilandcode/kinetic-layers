#!/usr/bin/env node
/**
 * The three personas the gate has to be tested against.
 *
 * A paywall cannot be verified by looking at the UI — a hidden button is not a
 * gate. It has to be checked by calling /api/download as each kind of visitor
 * and confirming the two that should be refused actually are. This creates the
 * accounts that make that possible, and removes them again.
 *
 *   node --env-file=.env.local tools/qa-personas.mjs --create
 *   node --env-file=.env.local tools/qa-personas.mjs --destroy
 *
 * Third persona is anonymous, which needs no account.
 */
import { createClient } from "@supabase/supabase-js";

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const PASSWORD = "kl-test-pw-2026";
const PEOPLE = [
  { email: "qa-free@example.com", plan: "free" },
  { email: "qa-unlimited@example.com", plan: "unlimited" },
];

const find = async (email) =>
  (await admin.auth.admin.listUsers()).data.users.find((u) => u.email === email);

async function destroy() {
  for (const { email } of PEOPLE) {
    const u = await find(email);
    if (!u) { console.log(`  ${email} — already gone`); continue; }
    /* profiles/entitlements/downloads/saved_* all cascade from auth.users. */
    const { error } = await admin.auth.admin.deleteUser(u.id);
    console.log(`  ${email} — ${error ? "FAILED " + error.message : "deleted"}`);
  }
}

async function create() {
  for (const { email, plan } of PEOPLE) {
    const existing = await find(email);
    if (existing) await admin.auth.admin.deleteUser(existing.id);
    const { data, error } = await admin.auth.admin.createUser({
      email, password: PASSWORD, email_confirm: true,
    });
    if (error) { console.log(`  ${email} — FAILED ${error.message}`); continue; }
    if (plan === "unlimited") {
      await admin.from("entitlements").upsert({
        user_id: data.user.id, plan: "unlimited", status: "active", source: "qa",
        current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
      });
    }
    console.log(`  ${email} — created, plan ${plan}`);
  }
  console.log(`\n  password: ${PASSWORD}`);
}

const mode = process.argv[2];
if (mode === "--create") await create();
else if (mode === "--destroy") await destroy();
else { console.log("Usage: --create | --destroy"); process.exit(1); }
