import { NextResponse } from "next/server";
import { getAsset, getSettings } from "@/lib/sanity/queries";
import { getViewer, gateReason } from "@/lib/kiln/viewer";
import { promptGateReason } from "@/lib/kiln/gate";
import { createClient } from "@/lib/supabase/server";

/**
 * Everything the popup needs to draw an asset.
 *
 * The item page assembles this from four server calls and there was no
 * client-facing equivalent, which is why the popup used to be an intercepting
 * route — a navigation that painted a dialog. Since the URL must not change,
 * the popup is now plain state and needs the data over the wire.
 *
 * Nothing gated crosses this boundary. The ASSET_FULL projection does not
 * select `promptBody`, and `files[]` carries name/meta/tag/bytes but never
 * `storagePath`, so this returns exactly what the item page already renders to
 * the same visitor. The gates are computed here, server-side, from this
 * caller's own session — they tell the UI which state to draw and decide
 * nothing: /api/prompt and /api/download each ask again before releasing a
 * single character or byte.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = raw.slice(0, 120);

  const [asset, viewer, settings] = await Promise.all([getAsset(slug), getViewer(), getSettings()]);
  if (!asset) return NextResponse.json({ ok: false, message: "No such asset." }, { status: 404 });

  /* Read through the viewer's own session so RLS decides what comes back,
     rather than this route being trusted to filter correctly. */
  let saved = false;
  if (viewer) {
    const supabase = await createClient();
    const { data } = (await supabase!
      .from("saved_assets")
      .select("asset_slug")
      .eq("asset_slug", slug)
      .maybeSingle()) ?? { data: null };
    saved = Boolean(data);
  }

  return NextResponse.json({
    ok: true,
    asset,
    viewer,
    gate: gateReason(viewer, asset),
    promptGate: promptGateReason(viewer, asset),
    saved,
    monthlyPrice: settings.monthlyPrice,
  });
}
