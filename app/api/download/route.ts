import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { getViewer, canDownload } from "@/lib/kiln/viewer";
import { checkQuota, quotaRefusal, recordUse, subjectFor } from "@/lib/kiln/quota";
import { getAsset, getAssetFiles } from "@/lib/sanity/queries";

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
  let body: { slug?: string; file?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.slice(0, 120) : "";
  if (!slug) return NextResponse.json({ ok: false, message: "Which asset?" }, { status: 400 });

  const asset = await getAsset(slug);
  if (!asset) return NextResponse.json({ ok: false, message: "No such asset." }, { status: 404 });

  const viewer = await getViewer();

  if (!canDownload(viewer, asset)) {
    /* 401 when there is no session at all, 403 when there is one but it does
       not reach far enough — the client shows a different prompt for each. */
    return NextResponse.json(
      {
        ok: false,
        reason: viewer ? "needs-unlimited" : "needs-account",
        message: viewer
          ? "This one is included with unlimited."
          : "Create a free account to download this.",
      },
      { status: viewer ? 403 : 401 }
    );
  }

  /* Entitlement is settled; this only decides how often. Anonymous never
     reaches here — canDownload has already refused them — so the zero
     allowance in LIMITS is a belt to that braces. */
  const subject = await subjectFor(viewer, request);
  const quota = await checkQuota(subject, "download");
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
    return NextResponse.json(
      { ok: false, message: "That file has not been uploaded yet." },
      { status: 409 }
    );
  }

  const db = admin();
  const { data, error } = await db.storage
    .from("assets")
    .createSignedUrl(file.storagePath, SIGNED_URL_TTL, { download: file.name });

  if (error || !data?.signedUrl) {
    console.error("signing failed:", error?.message);
    return NextResponse.json(
      { ok: false, message: "Could not prepare that download. Try again in a moment." },
      { status: 500 }
    );
  }

  /* Logged after the URL is issued, so a failed signing does not show up in
     someone's history as a download they never got. */
  await db.from("downloads").insert({
    user_id: viewer!.id,
    asset_slug: slug,
    asset_name: asset.name,
    file_name: file.name,
    bytes: file.bytes ?? null,
  });

  /* Two tables on purpose: `downloads` is the receipt a user reads on their
     account page, `usage` is the meter. Deriving one from the other would tie
     a history feature to a rate limit, and the meter also has to hold rows
     with no user at all. */
  await recordUse(subject, "download", slug);

  return NextResponse.json({
    ok: true,
    url: data.signedUrl,
    name: file.name,
    expiresIn: SIGNED_URL_TTL,
    remaining: Math.max(0, quota.remaining - 1),
    limit: quota.limit,
  });
}
