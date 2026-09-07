import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAsset, getAssets, getAssetSlugs, getRelated, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";
import { canDownload } from "@/lib/kiln/gate";
import { EARLY_ACCESS } from "@/lib/kiln/access";
import ItemView from "@/components/kl/ItemView";

export async function generateStaticParams() {
  const slugs = await getAssetSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset) return { title: "Not found" };
  return {
    title: asset.name,
    description: asset.tagline,
    alternates: { canonical: `/item/${slug}` },
    openGraph: {
      type: "article",
      title: asset.name,
      description: asset.tagline,
      url: `/item/${slug}`,
    },
    twitter: { card: "summary_large_image", title: asset.name, description: asset.tagline },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [asset, viewer, settings, all] = await Promise.all([
    getAsset(slug),
    getViewer(),
    getSettings(),
    getAssets(),
  ]);
  if (!asset) notFound();

  const related = await getRelated(slug);

  /* One rule, one home: canDownload is the same answer /api/download gives,
     so the button and the endpoint cannot disagree. */
  const locked = !EARLY_ACCESS && !canDownload(viewer, asset);

  /* Position in the catalogue picks the thumbnail ground, so an item's colour
     matches the card it was opened from. */
  const index = Math.max(0, all.findIndex((a) => a.slug === slug));

  return (
    <ItemView
      asset={asset}
      related={related.assets}
      relatedReason={related.reason}
      viewer={viewer}
      locked={locked}
      monthlyPrice={settings.monthlyPrice}
      total={settings.totalAssets}
      index={index}
    />
  );
}
