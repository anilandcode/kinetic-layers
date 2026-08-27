/**
 * Runs a .sql file against the live database.
 *
 *   node scripts/apply-sql.mjs supabase/migrations/<file>.sql
 *
 * There is no psql on this machine and the Supabase CLI is not logged in, so
 * migrations otherwise have to be pasted into the dashboard by hand — which is
 * how a migration file and the database drift apart. Credentials come from
 * .env.local; nothing is hardcoded.
 *
 * The pooler hostname includes a region that is not in any env var, so the
 * regions are tried in turn and the first that authenticates wins.
 */
import fs from "node:fs";
import pg from "pg";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const ref = new URL(env.SUPABASE_URL).hostname.split(".")[0];
const pw = encodeURIComponent(env.SUPABASE_DB_PASSWORD);
const sql = fs.readFileSync(process.argv[2], "utf8");

const hosts = ["aws-0-us-east-1", "aws-0-us-west-1", "aws-1-us-east-1", "aws-0-eu-central-1", "aws-0-ap-south-1", "aws-0-ap-southeast-1"];
for (const h of hosts) {
  const url = `postgresql://postgres.${ref}:${pw}@${h}.pooler.supabase.com:5432/postgres`;
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    await client.query(sql);
    console.log(`applied via ${h}`);
    await client.end();
    process.exit(0);
  } catch (e) {
    await client.end().catch(() => {});
    if (!/getaddrinfo|Tenant or user not found|timeout|ETIMEDOUT/i.test(e.message)) {
      console.error(`FAILED on ${h}: ${e.message}`); process.exit(1);
    }
  }
}
console.error("no pooler host matched"); process.exit(1);
