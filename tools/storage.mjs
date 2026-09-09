/**
 * The scripts' half of lib/kl/storage.ts.
 *
 * Two copies of this logic exist and that is deliberate: the app's module is
 * TypeScript behind an `@/` alias that plain `node tools/*.mjs` cannot resolve,
 * and giving the scripts a build step to share one file would cost more than
 * the forty lines it saves. They must stay in step — the key shape, the bucket
 * names and the STORAGE_DRIVER flag are the contract, and a drift in any of
 * them means an asset uploaded to one place and signed from another.
 *
 * Read the header of lib/kl/storage.ts for why the gated bucket is private and
 * why R2_ASSETS_BUCKET is deliberately not R2_BUCKET.
 */
import { createClient } from "@supabase/supabase-js";

export const driver = () => (process.env.STORAGE_DRIVER === "r2" ? "r2" : "supabase");

const SUPABASE_BUCKET = "assets";

export function r2Config() {
  const {
    R2_ACCOUNT_ID: account,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_ASSETS_BUCKET: bucket,
  } = process.env;
  if (!account || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "R2 needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and " +
        "R2_ASSETS_BUCKET. R2_BUCKET is the public preview bucket and is not a " +
        "substitute — gated files must not land there."
    );
  }
  return { account, accessKeyId, secretAccessKey, bucket };
}

export async function r2Client() {
  const { account, accessKeyId, secretAccessKey } = r2Config();
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Store one object under `key`, overwriting. */
export async function putObject(key, body, contentType = "application/octet-stream") {
  if (driver() === "r2") {
    const { bucket } = r2Config();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = await r2Client();
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
    );
    return;
  }
  const db = supabaseAdmin();
  const { error } = await db.storage
    .from(SUPABASE_BUCKET)
    .upload(key, body, { upsert: true, contentType });
  if (error) throw new Error(`upload ${key}: ${error.message}`);
}

/** Every object key in the Supabase bucket, recursing into folders. */
export async function listSupabaseKeys(prefix = "") {
  const db = supabaseAdmin();
  const out = [];
  const walk = async (p) => {
    const { data, error } = await db.storage
      .from(SUPABASE_BUCKET)
      .list(p, { limit: 1000, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list ${p || "/"}: ${error.message}`);
    for (const item of data ?? []) {
      const full = p ? `${p}/${item.name}` : item.name;
      /* A folder comes back with a null id and no metadata. */
      if (item.id === null) await walk(full);
      else out.push({ key: full, size: item.metadata?.size ?? 0 });
    }
  };
  await walk(prefix);
  return out;
}

export async function downloadFromSupabase(key) {
  const db = supabaseAdmin();
  const { data, error } = await db.storage.from(SUPABASE_BUCKET).download(key);
  if (error || !data) throw new Error(`download ${key}: ${error?.message ?? "empty"}`);
  return Buffer.from(await data.arrayBuffer());
}
