import { admin } from "@/lib/supabase/admin";

/**
 * Where the gated files live.
 *
 * These are the source files people pay for, and they are the reason this
 * module exists at all: previews sit on a public host because they are the
 * marketing, but a paid asset must never be reachable by URL. Both drivers here
 * keep that property — the object is private and a short-lived signed URL is
 * minted per request, after `app/api/download/route.ts` has already checked
 * entitlement and spent a quota unit.
 *
 * Two backends:
 *
 *   supabase  the private `assets` bucket, created with no storage policies at
 *             all, so it is unreachable to anon (see the note in
 *             supabase/migrations/*_kiln_accounts.sql).
 *   r2        a private R2 bucket. R2 charges nothing for egress at any volume,
 *             which is the point — Supabase's free tier allows 5 GB a month,
 *             about sixty downloads of one 84 MB scene.
 *
 * `storagePath` is the key in both. It is already a plain `<slug>/<name>`
 * written by tools/import-asset.mjs and stored in Sanity as a string, so moving
 * providers needs no re-keying and no document rewrite.
 *
 * The driver is an env var rather than a code change so the cutover is
 * reversible without a deploy, and so local and production can disagree while a
 * copy is in flight.
 */

export type StorageDriver = "supabase" | "r2";

export const STORAGE_DRIVER: StorageDriver =
  process.env.STORAGE_DRIVER === "r2" ? "r2" : "supabase";

const SUPABASE_BUCKET = "assets";

/** Thrown rather than returned: the caller refunds the quota unit on failure. */
export class StorageError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "StorageError";
  }
}

/* ---------- R2 ------------------------------------------------------------ */

function r2Config() {
  const {
    R2_ACCOUNT_ID: account,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_ASSETS_BUCKET: bucket,
  } = process.env;

  /* Deliberately not falling back to R2_BUCKET. That one names the *public*
     preview bucket used by tools/upload-r2.mjs, and quietly signing gated files
     out of a public bucket is the exact failure this module exists to prevent. */
  if (!account || !accessKeyId || !secretAccessKey || !bucket) {
    throw new StorageError(
      "STORAGE_DRIVER=r2 but R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY " +
        "and R2_ASSETS_BUCKET are not all set."
    );
  }
  return { account, accessKeyId, secretAccessKey, bucket };
}

async function r2Client() {
  const { account, accessKeyId, secretAccessKey } = r2Config();
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/* ---------- the two operations -------------------------------------------- */

/** Store one object. Overwrites, so a re-import is not an error. */
export async function putObject(
  key: string,
  body: Uint8Array | Buffer,
  contentType = "application/octet-stream"
): Promise<void> {
  if (STORAGE_DRIVER === "r2") {
    const { bucket } = r2Config();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = await r2Client();
    try {
      await s3.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
      );
    } catch (e) {
      throw new StorageError(`R2 upload failed for ${key}`, e);
    }
    return;
  }

  const db = admin();
  if (!db) throw new StorageError("Supabase admin client unavailable.");
  const { error } = await db.storage
    .from(SUPABASE_BUCKET)
    .upload(key, body, { upsert: true, contentType });
  if (error) throw new StorageError(`Supabase upload failed for ${key}: ${error.message}`);
}

/**
 * A URL that downloads this object and then stops working.
 *
 * `filename` becomes a Content-Disposition attachment, so the browser saves the
 * file under its real name instead of rendering it in a tab under a key.
 */
export async function signedDownloadUrl(
  key: string,
  filename: string,
  ttlSeconds: number
): Promise<string> {
  if (STORAGE_DRIVER === "r2") {
    const { bucket } = r2Config();
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const s3 = await r2Client();
    try {
      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          /* Supabase's { download: name } in S3 terms. Without it the file
             opens in the tab and loses its name. */
          ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"`,
        }),
        { expiresIn: ttlSeconds }
      );
    } catch (e) {
      throw new StorageError(`R2 signing failed for ${key}`, e);
    }
  }

  const db = admin();
  if (!db) throw new StorageError("Supabase admin client unavailable.");
  const { data, error } = await db.storage
    .from(SUPABASE_BUCKET)
    .createSignedUrl(key, ttlSeconds, { download: filename });
  if (error || !data?.signedUrl) {
    throw new StorageError(`Supabase signing failed for ${key}: ${error?.message ?? "no URL"}`);
  }
  return data.signedUrl;
}
