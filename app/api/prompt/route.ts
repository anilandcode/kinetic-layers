import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/kl/viewer";
import { canReadPrompt } from "@/lib/kl/gate";
import { consumeQuota, quotaRefusal, refund, subjectFor } from "@/lib/kl/quota";
import { getAsset, getPromptBody } from "@/lib/sanity/queries";
import { getWebsite, getWebsiteDeliverable } from "@/lib/sanity/websites";
import { websiteKey } from "@/lib/kl/slug";

/**
 * The other half of the gate.
 *
 * `/api/download` proves the gate refuses. This one proves it grants. The
 * prompt text is the product for a large part of the catalogue, and until this
 * existed no entitled visitor could ever read past the two-line preview — the
 * gate blocked everyone equally, which is a paywall that only takes.
 *
 * It asks `canReadPrompt` from lib/kl/gate.ts — the one rule, shared with the
 * client — so the button and the route cannot disagree about who may read.
 *
 * `type: "website"` serves a website's code or design-system Markdown through
 * the same gate and the same daily allowance; the usage row is keyed
 * `website:<slug>` so it never collides with a kit.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { slug?: string; kind?: string; type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.slice(0, 120) : "";
  if (!slug) return NextResponse.json({ ok: false, message: "Which asset?" }, { status: 400 });
  if (body.type === "website") return websiteText(request, slug, body.kind === "design" ? "design" : "code");

  /* Which prompt: the reconstruction prompt, or the adaptation prompt. Both
     sit behind the same gate and draw on the same daily allowance. */
  const kind = body.kind === "adaptation" ? "adaptation" : "reconstruction";

  const asset = await getAsset(slug);
  if (!asset) return NextResponse.json({ ok: false, message: "No such asset." }, { status: 404 });

  const viewer = await getViewer();

  /* canReadPrompt, not canDownload: an anonymous visitor may read a free
     asset's prompt but still may not take its files. */
  if (!canReadPrompt(viewer, asset)) {
    return NextResponse.json(
      {
        ok: false,
        reason: viewer ? "needs-premium" : "needs-account",
        message: viewer
          ? "This one is included with Premium."
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
  const prompt = await getPromptBody(slug, kind);

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

/** A website's code or design system: same gate, same allowance as a prompt. */
async function websiteText(request: NextRequest, slug: string, kind: "code" | "design") {
  const site = await getWebsite(slug);
  if (!site) return NextResponse.json({ ok: false, message: "No such website." }, { status: 404 });

  const viewer = await getViewer();
  if (!canReadPrompt(viewer, site)) {
    return NextResponse.json(
      {
        ok: false,
        reason: viewer ? "needs-premium" : "needs-account",
        message: viewer ? "This one is included with Premium." : "Create a free account to read this.",
      },
      { status: viewer ? 403 : 401 }
    );
  }

  const subject = await subjectFor(viewer, request);
  const quota = await consumeQuota(subject, "prompt", websiteKey(slug));
  if (!quota.allowed) {
    const { body: refusal, retryAfter } = quotaRefusal("prompt", quota);
    return NextResponse.json(refusal, {
      status: 429,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    });
  }

  const text = (await getWebsiteDeliverable(slug))?.[kind] ?? "";
  if (!text) {
    await refund(quota.usageId);
    return NextResponse.json(
      { ok: false, message: kind === "design" ? "No design system attached yet." : "No code attached yet." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, text, remaining: quota.remaining, limit: quota.limit });
}
