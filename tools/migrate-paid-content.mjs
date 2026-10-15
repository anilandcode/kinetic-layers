#!/usr/bin/env node
/**
 * Moves paid text off public documents into their private paid.<id> twins.
 *
 * The dataset is public (a private one needs a paid Sanity plan), so a prompt
 * on an asset document can be read by anyone through the API. A document whose
 * id sits under `paid.` cannot (lib/kl/paid.ts). Two steps, so the site never
 * shows a kit without its prompt:
 *
 *   node tools/migrate-paid-content.mjs           # dry run: what would move
 *   node tools/migrate-paid-content.mjs --copy    # write paid.<id>; public copy untouched
 *   ...deploy the code that reads paid.<id>...
 *   node tools/migrate-paid-content.mjs --strip   # unset the public copies, after checking each moved
 *
 * Drafts are covered too: a draft is private already, but publishing it would
 * make its prompt public again.
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const COPY = process.argv.includes("--copy");
const STRIP = process.argv.includes("--strip");
const PID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const die = (m) => {
  console.error(m);
  process.exit(1);
};
if (!PID || !TOKEN) die("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN must be set.");

const API = `https://${PID}.api.sanity.io/v2024-01-01/data`;
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
const query = async (q) => {
  const r = await fetch(`${API}/query/production?query=${encodeURIComponent(q)}&perspective=raw`, { headers });
  if (!r.ok) die(`query ${r.status}`);
  return (await r.json()).result;
};
const mutate = async (mutations) => {
  for (let i = 0; i < mutations.length; i += 50) {
    const r = await fetch(`${API}/mutate/production`, { method: "POST", headers, body: JSON.stringify({ mutations: mutations.slice(i, i + 50) }) });
    if (!r.ok) die(`mutate ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
};

const base = (id) => id.replace(/^drafts\./, "");

/* Public field -> paid field, per type. */
const MAP = {
  asset: { prompt: "prompt", promptBody: "prompt", adaptationPrompt: "adaptationPrompt" },
  website: { codeMarkdown: "code", designMarkdown: "design" },
};

const docs = await query(
  `*[_type in ["asset", "website"] && !(_id in path("paid.**")) && (defined(prompt) || defined(promptBody) || defined(adaptationPrompt) || defined(codeMarkdown) || defined(designMarkdown))]{ _id, _type, prompt, promptBody, adaptationPrompt, codeMarkdown, designMarkdown }`
);
const paid = Object.fromEntries((await query(`*[_id in path("paid.*") && _type == "paidContent"]`)).map((d) => [d._id, d]));

/* What each paid doc should hold. A published value wins over a draft's. */
const want = {};
for (const d of [...docs].sort((a, b) => Number(a._id.startsWith("drafts.")) - Number(b._id.startsWith("drafts.")))) {
  const id = `paid.${base(d._id)}`;
  want[id] ??= { parent: base(d._id), fields: {} };
  for (const [from, to] of Object.entries(MAP[d._type])) {
    if (typeof d[from] === "string" && d[from].trim() && !want[id].fields[to]) want[id].fields[to] = d[from];
  }
}

console.log(`${docs.length} document(s) carry paid text publicly; ${Object.keys(want).length} paid document(s) to fill.`);
for (const [id, w] of Object.entries(want)) {
  const have = paid[id] ?? {};
  const todo = Object.keys(w.fields).filter((f) => have[f] !== w.fields[f]);
  console.log(`  ${id.padEnd(48)} ${Object.keys(w.fields).join(", ")}${todo.length ? `  (to copy: ${todo.join(", ")})` : "  (already copied)"}`);
}

if (COPY) {
  const mutations = Object.entries(want).flatMap(([id, w]) => [
    { createIfNotExists: { _id: id, _type: "paidContent", parent: w.parent } },
    { patch: { id, set: w.fields } },
  ]);
  await mutate(mutations);
  console.log("\nCopied. The public copies are untouched until --strip.");
}

if (STRIP) {
  const fresh = Object.fromEntries((await query(`*[_id in path("paid.*") && _type == "paidContent"]`)).map((d) => [d._id, d]));
  for (const [id, w] of Object.entries(want)) {
    for (const [f, v] of Object.entries(w.fields)) {
      if (fresh[id]?.[f] !== v) die(`${id}.${f} has not been copied yet — run --copy first. Nothing stripped.`);
    }
  }
  await mutate(docs.map((d) => ({ patch: { id: d._id, unset: Object.keys(MAP[d._type]) } })));
  console.log(`\nStripped the public copies from ${docs.length} document(s).`);
}

if (!COPY && !STRIP) console.log("\nDry run. Pass --copy, then --strip once the new code is deployed.");
