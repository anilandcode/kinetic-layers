#!/usr/bin/env node
/**
 * Smoke-tests the database over the same path the API routes use: the REST
 * endpoint with the secret key, against the direction_kit schema.
 *
 *   node tools/verify-db.mjs
 *
 * Writes a QA-flagged row, reads it back, then deletes it. QA rows are
 * excluded from every reading, so a stray one would not skew the readout —
 * but it cleans up after itself anyway.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* env may come from the shell instead */
  }
}
loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const db = createClient(url, key, {
  
  auth: { persistSession: false },
});

const fail = (label, error) => {
  console.error(`  ✗ ${label}: ${error.message}`);
  process.exitCode = 1;
};

console.log(`\nVerifying ${url}\n`);

// 1. insert a request, and check the generated qualified column
const probe = {
  email: "verify@example.invalid",
  role: "agency",
  shipped: "6plus",
  concept: "signal-arc",
  blocker: "verification probe",
  interview: true,
  consent: false,
  variant: "a",
  source: "verify-script",
  qa: true,
  visitor: "verify",
};

const inserted = await db.from("invite_requests").insert(probe).select().single();
if (inserted.error) fail("insert invite_requests", inserted.error);
else {
  console.log("  ✓ insert invite_requests");
  console.log(
    inserted.data.qualified
      ? "  ✓ qualified computed in the database (agency + 6plus → true)"
      : "  ✗ qualified computed wrong — expected true"
  );
  if (!inserted.data.qualified) process.exitCode = 1;
}

// 2. the negative case, to prove the generated column actually discriminates
const weak = await db
  .from("invite_requests")
  .insert({ ...probe, role: "neither", shipped: "0-1" })
  .select()
  .single();
if (weak.error) fail("insert unqualified row", weak.error);
else {
  console.log(
    weak.data.qualified === false
      ? "  ✓ unqualified computed correctly (neither + 0-1 → false)"
      : "  ✗ unqualified computed wrong — expected false"
  );
  if (weak.data.qualified !== false) process.exitCode = 1;
}

// 3. events
const ev = await db
  .from("events")
  .insert({ event: "page_view", variant: "a", source: "verify-script", qa: true, path: "/verify" })
  .select()
  .single();
if (ev.error) fail("insert events", ev.error);
else console.log("  ✓ insert events");

// 4. a rejected value should be rejected
const bad = await db.from("events").insert({ event: "not_a_real_event", variant: "a" });
console.log(
  bad.error
    ? "  ✓ check constraint rejects an unknown event name"
    : "  ✗ check constraint did not reject an unknown event name"
);
if (!bad.error) process.exitCode = 1;

// 5. clean up
const cleanA = await db.from("invite_requests").delete().eq("source", "verify-script");
const cleanB = await db.from("events").delete().eq("source", "verify-script");
if (cleanA.error) fail("cleanup invite_requests", cleanA.error);
if (cleanB.error) fail("cleanup events", cleanB.error);
if (!cleanA.error && !cleanB.error) console.log("  ✓ probe rows removed");

console.log(
  process.exitCode ? "\nVerification FAILED\n" : "\nVerification passed\n"
);
