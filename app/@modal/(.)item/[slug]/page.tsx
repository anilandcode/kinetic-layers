import { notFound } from "next/navigation";
import { getAsset, getRelated, getSettings } from "@/lib/sanity/queries";
import { getViewer, gateReason } from "@/lib/kiln/viewer";
import { createClient } from "@/lib/supabase/server";
import ItemView from "@/components/kiln/ItemView";
import Modal from "@/components/kiln/Modal";

/**
 * An asset, opened over the library.
 *
 * `(.)item/[slug]` intercepts a same-level navigation to /item/[slug], so a
 * card click opens this while the URL still changes. A refresh, a shared link,
 * a crawler or anything arriving cold gets app/item/[slug]/page.tsx instead —
 * which matters, because that URL is emitted by the sitemap, by the MCP tool
 * and by every ?next=/item/… redirect.
 *
 * Deliberately NOT force-dynamic: it reads cookies through getViewer, which
 * makes it dynamic anyway, and saying so twice invites the two to disagree.
 */
export default async function ItemModal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [asset, viewer, settings] = await Promise.all([getAsset(slug), getViewer(), getSettings()]);
  if (!asset) notFound();

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

  return (
    <Modal label={asset.name}>
      {/* chrome={false}: no second Nav, no breadcrumb, no Footer inside a
          dialog — and the prompt moves to the top, since reading and copying
          it is the reason to open a popup rather than a page. Related assets
          are dropped too; browsing onward is what the library behind is for. */}
      <ItemView
        asset={asset}
        related={[]}
        viewer={viewer}
        gate={gateReason(viewer, asset)}
        saved={saved}
        monthlyPrice={settings.monthlyPrice}
        chrome={false}
      />
    </Modal>
  );
}
