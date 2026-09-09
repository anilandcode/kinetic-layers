#!/usr/bin/env node
/**
 * Copies the gated files from Supabase Storage into the private R2 bucket.
 *
 * One-time, but idempotent — it re-runs safely, skipping objects already in R2
 * at the same size, so an interrupted copy is resumed rather than restarted.
 *
 * It **never deletes from Supabase**. Until R2 has served real downloads,
 * Supabase is the rollback: flip STORAGE_DRIVER back and the bytes are still
 * there. Delete them by hand, later, once you are sure.
 *
 * Keys are unchanged. `storagePath` in Sanity is already a plain <slug>/<name>,
 * so nothing in the catalogue is rewritten and there is no window where a
 * document points at a key that does not exist.
 *
 *   node --env-file=.env.local tools/migrate-storage-to-r2.mjs --dry
 *   node --env-file=.env.local tools/migrate-storage-to-r2.mjs
 */
import { listSupabaseKeys, downloadFromSupabase, r2Config, r2Client } from "./storage.mjs";

const DRY = process.argv.includes("--dry");
const mb = (n) => (n / 1048576).toFixed(2);

const main = async () => {
  const objects = await listSupabaseKeys();
  const total = objects.reduce((n, o) => n + o.size, 0);

  if (!objects.length) {
    console.log("Supabase bucket is empty — nothing to copy.");
    return;
  }
  console.log(`Supabase: ${objects.length} object(s), ${mb(total)} MB`);

  if (DRY) {
    for (const o of objects.slice(0, 10)) console.log(`  ${o.key}  ${mb(o.size)} MB`);
    if (objects.length > 10) console.log(`  … ${objects.length - 10} more`);
    console.log("\n--dry: nothing copied.");
    return;
  }

  const { bucket } = r2Config();
  const { PutObjectCommand, HeadObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = await r2Client();

  let copied = 0, skipped = 0, bytes = 0;
  for (const o of objects) {
    /* Already there at the same size? Leave it. This is what makes a second
       run cheap instead of a full re-upload. */
    try {
      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: o.key }));
      if (head.ContentLength === o.size) { skipped++; continue; }
    } catch { /* not found — fall through and copy */ }

    const body = await downloadFromSupabase(o.key);
    if (body.length !== o.size && o.size > 0) {
      throw new Error(`${o.key}: read ${body.length} bytes, listing said ${o.size}`);
    }
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: o.key, Body: body }));
    copied++; bytes += body.length;
    process.stdout.write(`\r  copied ${copied}  skipped ${skipped}`);
  }

  console.log(`\n\nCopied ${copied} object(s), ${mb(bytes)} MB. Skipped ${skipped} already present.`);
  console.log("Supabase is untouched — it stays the rollback until R2 has served real traffic.");
  console.log("\nNext: set STORAGE_DRIVER=r2 in Vercel, redeploy, and take one real download.");
};

main().catch((e) => {
  console.error(`\n${e.message}\n`);
  process.exit(1);
});
