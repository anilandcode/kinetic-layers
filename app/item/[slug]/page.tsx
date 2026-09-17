import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAsset, getAssetSlugs, getRelated } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
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
  const [asset, viewer] = await Promise.all([getAsset(slug), getViewer()]);
  if (!asset) notFound();

  const related = await getRelated(slug);

  return (
    <ItemView
      asset={asset}
      related={related.assets}
      relatedReason={related.reason}
      viewer={viewer}
    />
  );
}
