#!/usr/bin/env node
/**
 * Rewrites every non-canonical asset slug to the canonical form in
 * lib/kl/slug.ts, in Sanity and in the Supabase rows keyed by slug.
 *
 * Slugs typed by hand ("Nevoro Studio") 404'd, and the Studio now refuses
 * them. This fixes the ones already published. Old links keep working: the
 * item page finds the kit by either form and redirects to the canonical one.
 *
 * Sanity references point at _id, never at a slug, so collections, drops and
 * tags are untouched. Supabase is not: usage, downloads and saved_assets store
 * the slug, so those rows move too, or saves and download history would orphan.
 *
 *   node tools/migrate-slugs.mjs            # dry run: prints the mapping
 *   node tools/migrate-slugs.mjs --apply
 */
import { readFileSync } from "node:fs";
import pg from "pg";
import { toSlug } from "../lib/kl/slug.ts";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const APPLY = process.argv.includes("--apply");
const PID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const die = (msg) => {
  console.error(msg);
  process.exit(1);
};
if (!PID) die("NEXT_PUBLIC_SANITY_PROJECT_ID is not set.");
if (!TOKEN) die("SANITY_WRITE_TOKEN is not set.");

const API = `https://${PID}.api.sanity.io/v2024-01-01`;
const auth = { Authorization: `Bearer ${TOKEN}` };

const query = encodeURIComponent(`*[_type == "asset" && defined(slug.current)]{_id, "slug": slug.current}`);
const res = await fetch(`${API}/data/query/${DS}?query=${query}`, { headers: auth });
if (!res.ok) die(`Sanity query failed: ${res.status}`);
const docs = (await res.json()).result;

const taken = new Map(docs.map((d) => [d.slug, d._id]));
const moves = [];
for (const d of docs) {
  const next = toSlug(d.slug);
  if (next === d.slug) continue;
  if (!next) die(`"${d.slug}" (${d._id}) has no canonical form — rename it in the Studio.`);
  const holder = taken.get(next);
  if (holder && holder !== d._id) die(`"${d.slug}" → "${next}" collides with ${holder}. Resolve by hand first.`);
  if (moves.some((m) => m.to === next)) die(`Two slugs map to "${next}". Resolve by hand first.`);
  moves.push({ id: d._id, from: d.slug, to: next });
}

if (!moves.length) {
  console.log("Every asset slug is already canonical.");
  process.exit(0);
}
for (const m of moves) console.log(`${m.from.padEnd(28)} → ${m.to}   (${m.id})`);
if (!APPLY) {
  console.log(`\n${moves.length} to move. Dry run — pass --apply to write.`);
  process.exit(0);
}

/* Supabase first: if the database step fails, Sanity still holds the old
   slugs and nothing is half-moved from the site's point of view. */
const ref = new URL(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) die("SUPABASE_DB_PASSWORD is not set.");
const candidates = [
  { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
  { host: "aws-0-us-east-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
  { host: "aws-1-us-east-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
];
let db;
for (const c of candidates) {
  const client = new pg.Client({ ...c, database: "postgres", password, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    db = client;
    break;
  } catch {
    await client.end().catch(() => {});
  }
}
if (!db) die("Could not reach the database.");

try {
  await db.query("begin");
  for (const m of moves) {
    for (const table of ["usage", "downloads", "saved_assets"]) {
      const r = await db.query(`update public.${table} set asset_slug = $1 where asset_slug = $2`, [m.to, m.from]);
      if (r.rowCount) console.log(`  ${table}: ${r.rowCount} row(s) ${m.from} → ${m.to}`);
    }
  }
  await db.query("commit");
} catch (err) {
  await db.query("rollback");
  die(`Database step failed, nothing written: ${err.message}`);
} finally {
  await db.end();
}

const mutations = moves.map((m) => ({ patch: { id: m.id, set: { "slug.current": m.to } } }));
const write = await fetch(`${API}/data/mutate/${DS}`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!write.ok) die(`Sanity write failed: ${write.status} ${await write.text()}`);
console.log(`\nMoved ${moves.length} slug(s) in Sanity and Supabase.`);
