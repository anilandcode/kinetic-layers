import { NextResponse, type NextRequest } from "next/server";
import { getViewer, canDownload } from "@/lib/kiln/viewer";
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

  if (!canDownload(viewer, asset)) {
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

  /* Only fetched after the check passes. getPromptBody is the one query that
     selects promptBody at all — every other projection omits it, so the text
     cannot leak through a card or a listing by accident. */
  const prompt = await getPromptBody(slug);

  if (!prompt) {
    return NextResponse.json(
      { ok: false, message: "This asset has no prompt attached." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, prompt });
}
