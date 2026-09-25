import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssetSlugs } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import { getKit, getKitRelated, getSavedSlugs } from "@/lib/v2/data";
import KitView from "@/components/v2/KitView";

export async function generateStaticParams() {
  const slugs = await getAssetSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kit = await getKit(slug);
  if (!kit) return { title: "Not found" };
  return {
    title: kit.name,
    description: kit.tagline,
    alternates: { canonical: `/item/${slug}` },
    /* Samples exist only on preview deployments; keep them out of any index. */
    robots: kit.sample ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: kit.name,
      description: kit.tagline,
      url: `/item/${slug}`,
    },
    twitter: { card: "summary_large_image", title: kit.name, description: kit.tagline },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [kit, viewer] = await Promise.all([getKit(slug), getViewer()]);
  if (!kit) notFound();

  const [related, saved] = await Promise.all([getKitRelated(kit), getSavedSlugs(viewer)]);
  return (
    <KitView
      kit={kit}
      related={related.assets}
      relatedReason={related.reason}
      viewer={viewer}
      saved={saved.includes(kit.slug)}
    />
  );
}
