import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getViewer } from "@/lib/kl/viewer";
import { decodeParam, itemHref } from "@/lib/kl/slug";
import { getKit, getKitRelated, getSavedSlugs } from "@/lib/v2/data";
import KitView from "@/components/v2/KitView";

/* No generateStaticParams: the shell reads the session, so this route renders
   per request anyway, and a prebuilt list could not include a kit published
   after the build. */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const kit = await getKit(decodeParam((await params).slug));
  if (!kit) return { title: "Not found" };
  const href = itemHref(kit.slug);
  return {
    title: kit.name,
    description: kit.tagline,
    alternates: { canonical: href },
    /* Samples exist only on preview deployments; keep them out of any index. */
    robots: kit.sample ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: kit.name,
      description: kit.tagline,
      url: href,
    },
    twitter: { card: "summary_large_image", title: kit.name, description: kit.tagline },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeParam((await params).slug);
  const [kit, viewer] = await Promise.all([getKit(slug), getViewer()]);
  if (!kit) notFound();
  /* An old link to a non-canonical slug ("Nevoro Studio") lands on the one URL. */
  if (kit.slug !== slug) permanentRedirect(itemHref(kit.slug));

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
