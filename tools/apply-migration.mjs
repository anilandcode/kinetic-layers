#!/usr/bin/env node
/**
 * Applies a migration by connecting straight to Postgres with the project's
 * DB password.
 *
 *   node tools/apply-migration.mjs supabase/migrations/<file>.sql
 *
 * `supabase db push` is the normal route, but it calls the management API,
 * which needs the CLI to be signed into the account that owns the project.
 * This path only needs the connection string, so it keeps working when the
 * CLI session is pointed somewhere else.
 */
import { readFileSync } from "node:fs";
import pg from "pg";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const file = process.argv[2];
if (!file) { console.error("usage: apply-migration.mjs <file.sql>"); process.exit(1); }

const ref = new URL(process.env.SUPABASE_URL).hostname.split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) { console.error("SUPABASE_DB_PASSWORD missing"); process.exit(1); }

const sql = readFileSync(file, "utf8");

/* Try the direct host first, then the poolers. Which one resolves varies by
   network and by project age, so this walks them rather than guessing. */
const candidates = [
  { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
  { host: "aws-0-us-east-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
  { host: "aws-1-us-east-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
  { host: "aws-0-us-east-1.pooler.supabase.com", port: 6543, user: `postgres.${ref}` },
];

let lastErr;
for (const c of candidates) {
  const client = new pg.Client({
    host: c.host, port: c.port, user: c.user, password,
    database: "postgres", ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 12000,
  });
  try {
    await client.connect();
    console.log(`connected via ${c.host}:${c.port}`);
    await client.query(sql);
    console.log(`applied ${file}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    lastErr = err;
    try { await client.end(); } catch {}
    console.log(`  ${c.host}:${c.port} → ${err.message.slice(0, 70)}`);
  }
}
console.error("\nCould not apply:", lastErr?.message);
process.exit(1);
