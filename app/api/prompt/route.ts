import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/kl/viewer";
import { canReadPrompt } from "@/lib/kl/gate";
import { consumeQuota, quotaRefusal, refund, subjectFor } from "@/lib/kl/quota";
import { getAsset, getPromptBody } from "@/lib/sanity/queries";

/**
 * The other half of the gate.
 *
 * `/api/download` proves the gate refuses. This one proves it grants. The
 * prompt text is the product for a large part of the catalogue, and until this
 * existed no entitled visitor could ever read past the two-line preview — the
 * gate blocked everyone equally, which is a paywall that only takes.
 *
 * It asks the same question, with the same function, as the download route:
 * `canDownload`. There is deliberately no second copy of the rule here. If the
 * two ever disagree about who may read a prompt versus who may download its
 * files, that is a bug, and sharing the function makes it impossible.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { slug?: string };
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

  /* canReadPrompt, not canDownload: an anonymous visitor may read a free
     asset's prompt but still may not take its files. */
  if (!canReadPrompt(viewer, asset)) {
    return NextResponse.json(
      {
        ok: false,
        reason: viewer ? "needs-unlimited" : "needs-account",
        message: viewer
          ? "This one is included with unlimited."
          : "Create a free account to read this.",
      },
      { status: viewer ? 403 : 401 }
    );
  }

  /* Entitled, but possibly not right now. The order matters: a paid asset must
     refuse a free account with 403 whatever their remaining allowance is, so
     eligibility is settled before frequency. */
  const subject = await subjectFor(viewer, request);
  const quota = await consumeQuota(subject, "prompt", slug);
  if (!quota.allowed) {
    const { body: refusal, retryAfter } = quotaRefusal("prompt", quota);
    return NextResponse.json(refusal, {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    });
  }

  /* Only fetched after the check passes. getPromptBody is the one query that
     selects promptBody at all — every other projection omits it, so the text
     cannot leak through a card or a listing by accident. */
  const prompt = await getPromptBody(slug);

  if (!prompt) {
    /* Nothing was delivered, so nothing should have been charged. */
    await refund(quota.usageId);
    return NextResponse.json(
      { ok: false, message: "This asset has no prompt attached." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    prompt,
    /* The client shows what is left; it is already spending the unit, so it
       may as well be told rather than made to guess. */
    remaining: quota.remaining,
    limit: quota.limit,
  });
}
