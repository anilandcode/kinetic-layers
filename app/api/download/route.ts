import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { getViewer, canDownload } from "@/lib/kl/viewer";
import { consumeQuota, quotaRefusal, refund, subjectFor } from "@/lib/kl/quota";
import { getAsset, getAssetFiles } from "@/lib/sanity/queries";
import { signedDownloadUrl } from "@/lib/kl/storage";
import { getWebsite, getWebsiteDeliverable } from "@/lib/sanity/websites";
import { websiteKey } from "@/lib/kl/slug";

/**
 * The gate.
 *
 * Entitlement is re-checked here, server-side, every time. The item page hides
 * the button when it should — but a hidden button is not a paywall, and this
 * route is what actually stops a paid asset walking out. It never trusts
 * anything the client sent beyond the slug and the file name.
 *
 * The signed URL is short-lived and issued only after the check passes.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_URL_TTL = 60; // seconds

export async function POST(request: NextRequest) {
  let body: { slug?: string; file?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.slice(0, 120) : "";
  if (!slug) return NextResponse.json({ ok: false, message: "Which asset?" }, { status: 400 });
  if (body.type === "website") return websiteZip(request, slug);

  const asset = await getAsset(slug);
  if (!asset) return NextResponse.json({ ok: false, message: "No such asset." }, { status: 404 });

  const viewer = await getViewer();

  if (!canDownload(viewer, asset)) {
    /* 401 when there is no session at all, 403 when there is one but it does
       not reach far enough — the client shows a different prompt for each. */
    return NextResponse.json(
      {
        ok: false,
        reason: viewer ? "needs-premium" : "needs-account",
        message: viewer
          ? "This one is included with Premium."
          : "Create a free account to download this.",
      },
      { status: viewer ? 403 : 401 }
    );
  }

  /* Entitlement is settled; this only decides how often. Anonymous never
     reaches here — canDownload has already refused them — so the zero
     allowance in LIMITS is a belt to that braces. */
  const subject = await subjectFor(viewer, request);
  const quota = await consumeQuota(subject, "download", slug);
  if (!quota.allowed) {
    const { body: refusal, retryAfter } = quotaRefusal("download", quota);
    return NextResponse.json(refusal, {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    });
  }

  const files = await getAssetFiles(slug);
  const wanted = typeof body.file === "string" ? body.file : "";
  const file = wanted ? files.find((f) => f.name === wanted) : files[0];

  if (!file?.storagePath) {
    await refund(quota.usageId);
    return NextResponse.json(
      { ok: false, message: "That file has not been uploaded yet." },
      { status: 409 }
    );
  }

  /* Which backend holds the bytes is lib/kl/storage.ts's problem, not this
     route's. What stays here is the part that matters: the URL is minted only
     after the gate passed and a unit was spent, and it expires in a minute. */
  let signedUrl: string;
  try {
    signedUrl = await signedDownloadUrl(file.storagePath, file.name, SIGNED_URL_TTL);
  } catch (err) {
    console.error("signing failed:", err instanceof Error ? err.message : err);
    /* No URL went out, so the unit goes back. */
    await refund(quota.usageId);
    return NextResponse.json(
      { ok: false, message: "Could not prepare that download. Try again in a moment." },
      { status: 500 }
    );
  }

  const db = admin();

  /* Logged after the URL is issued, so a failed signing does not show up in
     someone's history as a download they never got. */
  await db.from("downloads").insert({
    user_id: viewer!.id,
    asset_slug: slug,
    asset_name: asset.name,
    file_name: file.name,
    bytes: file.bytes ?? null,
  });

  return NextResponse.json({
    ok: true,
    url: signedUrl,
    name: file.name,
    expiresIn: SIGNED_URL_TTL,
    remaining: quota.remaining,
    limit: quota.limit,
  });
}

/**
 * A website's project ZIP. Same gate, allowance and private bucket as a kit's
 * files: the key lives in the website's private paid document, and the URL
 * handed back is a one-minute signed link, minted only after the gate passed
 * and a unit was spent.
 */
async function websiteZip(request: NextRequest, slug: string) {
  const site = await getWebsite(slug);
  if (!site) return NextResponse.json({ ok: false, message: "No such website." }, { status: 404 });

  const viewer = await getViewer();
  if (!canDownload(viewer, site)) {
    return NextResponse.json(
      {
        ok: false,
        reason: viewer ? "needs-premium" : "needs-account",
        message: viewer ? "This one is included with Premium." : "Create a free account to download this.",
      },
      { status: viewer ? 403 : 401 }
    );
  }

  const key = websiteKey(slug);
  const subject = await subjectFor(viewer, request);
  const quota = await consumeQuota(subject, "download", key);
  if (!quota.allowed) {
    const { body: refusal, retryAfter } = quotaRefusal("download", quota);
    return NextResponse.json(refusal, {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    });
  }

  const zip = (await getWebsiteDeliverable(slug))?.zip;
  if (!zip) {
    await refund(quota.usageId);
    return NextResponse.json({ ok: false, message: "The project ZIP has not been uploaded yet." }, { status: 409 });
  }

  const name = `${slug}.zip`;
  let url: string;
  try {
    url = await signedDownloadUrl(zip.storagePath, name, SIGNED_URL_TTL);
  } catch (err) {
    console.error("signing failed:", err instanceof Error ? err.message : err);
    await refund(quota.usageId);
    return NextResponse.json(
      { ok: false, message: "Could not prepare that download. Try again in a moment." },
      { status: 500 }
    );
  }

  await admin().from("downloads").insert({
    user_id: viewer!.id,
    asset_slug: key,
    asset_name: site.name,
    file_name: name,
    bytes: zip.bytes ?? null,
  });

  return NextResponse.json({ ok: true, url, name, expiresIn: SIGNED_URL_TTL, remaining: quota.remaining, limit: quota.limit });
}
