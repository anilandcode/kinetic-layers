import { notFound } from "next/navigation";
import { getViewer } from "@/lib/kl/viewer";
import { decodeParam } from "@/lib/kl/slug";
import { getKit } from "@/lib/v2/data";
import KitDialog from "@/components/v2/KitDialog";
import KitQuickView from "@/components/v2/KitQuickView";

/**
 * The quick view, as an interception of the real route.
 *
 * Same reads and the same gate as app/item/[slug]/page.tsx, so the dialog and
 * the page can never disagree about what a viewer may have. No
 * generateStaticParams and no metadata: an interception is always a
 * client-side navigation, and the page it intercepts owns the canonical.
 */
export default async function KitModalPage({ params }: { params: Promise<{ slug: string }> }) {
  /* Decoded, never redirected: a redirect from inside an interception is the
     fragile path, and every in-app link is already canonical. */
  const slug = decodeParam((await params).slug);
  const [kit, viewer] = await Promise.all([getKit(slug), getViewer()]);
  if (!kit) notFound();

  return (
    <KitDialog name={kit.name}>
      <KitQuickView kit={kit} viewer={viewer} />
    </KitDialog>
  );
}
