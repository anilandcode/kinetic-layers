import { notFound } from "next/navigation";
import { getAsset, getRelated } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import ItemModal from "@/components/kl/ItemModal";
import ItemView from "@/components/kl/ItemView";

/**
 * The asset popup the design specifies, as an interception of the real route.
 *
 * Deliberately the same reads as app/item/[slug]/page.tsx — one gate decides
 * both, so the overlay and the page can never disagree about what a viewer may
 * have. No generateStaticParams and no metadata: an interception is always a
 * client-side navigation, and the page it intercepts owns the canonical and the
 * OG card.
 */
export default async function ItemModalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [asset, viewer] = await Promise.all([getAsset(slug), getViewer()]);
  if (!asset) notFound();

  const related = await getRelated(slug);
  return (
    <ItemModal shelf={asset.tags?.[0] ?? asset.type} name={asset.name}>
      <ItemView
        asset={asset}
        related={related.assets}
        relatedReason={related.reason}
        viewer={viewer}
        variant="modal"
      />
    </ItemModal>
  );
}
