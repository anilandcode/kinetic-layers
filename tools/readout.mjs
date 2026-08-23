#!/usr/bin/env node
/**
 * Fills the readout table from the playbook by querying Supabase directly.
 *
 *   npm run readout
 *
 * Rows the playbook asks for that this phase cannot fill are printed as
 * unavailable rather than estimated, because no payment is collected yet.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* env may come from the shell instead */
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

// QA traffic is excluded everywhere: it is us, not the market.
const [reqRes, evRes] = await Promise.all([
  db.from("invite_requests").select("*").eq("qa", false),
  db.from("events").select("*").eq("qa", false),
]);
if (reqRes.error || evRes.error) {
  console.error("Query failed:", (reqRes.error ?? evRes.error).message);
  process.exit(1);
}
const requests = reqRes.data ?? [];
const events = evRes.data ?? [];

const VARIANTS = ["a", "b"];
const by = (rows, v) => rows.filter((r) => r.variant === v);
const uniq = (rows) => {
  const seen = rows.map((r) => r.visitor).filter(Boolean);
  return seen.length ? new Set(seen).size : rows.length;
};
const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + "%" : "—");

const stats = Object.fromEntries(
  VARIANTS.map((v) => {
    const ev = by(events, v);
    const rq = by(requests, v);
    const visitors = uniq(ev.filter((e) => e.event === "page_view"));
    const qualified = rq.filter((r) => r.qualified);
    return [
      v,
      {
        visitors,
        conceptClicks: ev.filter((e) => e.event === "concept_click").length,
        formStarts: uniq(ev.filter((e) => e.event === "form_start")),
        submissions: rq.length,
        qualified: qualified.length,
        interviews: rq.filter((r) => r.interview).length,
        consent: rq.filter((r) => r.consent).length,
        conversion: pct(qualified.length, visitors),
      },
    ];
  })
);

const row = (label, pick, note) => `| ${label} | ${pick("a")} | ${pick("b")} | ${note} |`;

console.log(`
Demand-test readout  ${new Date().toISOString().slice(0, 16).replace("T", " ")}
${"=".repeat(64)}

| Metric | Variant A ($79) | Variant B ($179) | Interpretation |
| --- | ---: | ---: | --- |
${row("Qualified visitors", (v) => stats[v].visitors, "Unique, QA traffic excluded")}
${row("Direction card opens", (v) => stats[v].conceptClicks, "Interest in the samples")}
${row("Form starts", (v) => stats[v].formStarts, "Reached the ask")}
${row("Submissions", (v) => stats[v].submissions, "All responses")}
${row("Qualified submissions", (v) => stats[v].qualified, "Delivers client sites, 2+ shipped in 12mo")}
${row("Qualified conversion", (v) => stats[v].conversion, "Primary metric available this phase")}
${row("Interview offers", (v) => stats[v].interviews, "Feeds the 15-interview gate")}
${row("Marketing consent", (v) => stats[v].consent, "Opt-in rate, not a demand signal")}
| Reservation-start rate | unavailable | unavailable | No checkout in this phase |
| Paid refundable reservations | unavailable | unavailable | No checkout in this phase |
| Median volunteered price | from interviews | from interviews | Ask before showing a price |
`);

const opened = {};
for (const e of events.filter((e) => e.event === "concept_click")) {
  const k = e.detail ?? "unknown";
  opened[k] = (opened[k] ?? 0) + 1;
}
const named = {};
for (const r of requests) if (r.concept) named[r.concept] = (named[r.concept] ?? 0) + 1;

console.log("Direction interest");
console.log("-".repeat(64));
const slugs = new Set([...Object.keys(opened), ...Object.keys(named)]);
if (!slugs.size) console.log("  nothing recorded yet");
for (const slug of slugs) {
  console.log(
    `  ${slug.padEnd(18)} opened ${String(opened[slug] ?? 0).padStart(4)}   named first ${String(named[slug] ?? 0).padStart(4)}`
  );
}

const objections = requests.filter((r) => r.qualified && (r.blocker ?? "").trim());
console.log(`\nObjections from qualified respondents (${objections.length})`);
console.log("-".repeat(64));
if (!objections.length) console.log("  none recorded yet");
for (const o of objections) {
  console.log(`  [${o.variant}] ${o.blocker.replace(/\s+/g, " ").slice(0, 110)}`);
}
console.log("\n  Reminder: an objection becomes roadmap input only when 3+ qualified");
console.log("  people raise it. Read these, do not count them.\n");

const totalQualified = requests.filter((r) => r.qualified).length;
const offered = requests.filter((r) => r.qualified && r.interview).length;
console.log("Gate status");
console.log("-".repeat(64));
console.log(`  Qualified respondents .......... ${totalQualified}`);
console.log(`  Offered an interview ........... ${offered} (need 15 completed)`);
console.log(`  Paid commitments ............... 0 (need 5 — requires a checkout)`);
console.log(
  `  Per-variant minimum ............ ${stats.a.visitors} / ${stats.b.visitors} (need 100 qualified visitors each)\n`
);
