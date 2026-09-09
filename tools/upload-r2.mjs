#!/usr/bin/env node
/**
 * Mirrors public/preview/ into the R2 bucket.
 *
 * R2 speaks the S3 API, so this is a plain S3 client pointed at the account
 * endpoint. The bucket is PUBLIC — everything in it is a preview, which is the
 * marketing, and R2 charges nothing for egress at any volume. The gated files
 * are a different bucket on a different provider entirely (private Supabase
 * Storage, signed per request by app/api/download/route.ts); nothing that
 * matters ever lands here.
 *
 * Content types are set explicitly because R2 does not sniff. The cache is
 * split rather than immutable: these keys are stable, so a replaced render has
 * to be able to reach someone who already has the old one.
 *
 *   node --env-file=.env.local tools/upload-r2.mjs          # upload
 *   node --env-file=.env.local tools/upload-r2.mjs --dry    # list only
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "preview");
const DRY = process.argv.includes("--dry");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = "kinetic-layers-preview",
} = process.env;

const TYPES = {
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const main = async () => {
  const files = [];
  let bytes = 0;
  try {
    for await (const f of walk(ROOT)) {
      files.push(f);
      bytes += (await stat(f)).size;
    }
  } catch {
    console.error(`Nothing at ${ROOT} — run tools/make-dummy-media.mjs first.`);
    process.exit(1);
  }

  const plan = `${files.length} files · ${(bytes / 1048576).toFixed(1)} MB`;

  if (DRY || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.log(`${plan} ready to upload.`);
    for (const f of files.slice(0, 5)) console.log("  " + path.relative(ROOT, f));
    if (files.length > 5) console.log(`  … ${files.length - 5} more`);
    if (!DRY) {
      console.log(
        "\nNo R2 credentials, so nothing was sent. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID\n" +
          "and R2_SECRET_ACCESS_KEY in .env.local, then re-run. Point\n" +
          "NEXT_PUBLIC_MEDIA_BASE at the bucket's public URL to serve from it."
      );
    }
    return;
  }

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });

  let done = 0;
  for (const f of files) {
    const key = path.relative(ROOT, f).split(path.sep).join("/");
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: await readFile(f),
        ContentType: TYPES[path.extname(f).toLowerCase()] ?? "application/octet-stream",
        /* Not `immutable`. A preview key like <slug>/card.webp is stable, so
           promising the bytes never change meant a replaced render never
           reached a returning visitor — the same bug fixed for the Pages
           _headers in 708cbb6. Five minutes in the browser, a year at the
           edge. */
        CacheControl: "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400",
      })
    );
    done++;
    if (done % 10 === 0 || done === files.length) process.stdout.write(`\r  ${done}/${files.length}`);
  }
  console.log(`\nUploaded ${plan} to ${R2_BUCKET}.`);
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
