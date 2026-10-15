import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getViewer } from "@/lib/kl/viewer";
import { cropTop } from "@/lib/kl/media";
import { decodeParam, toSlug, websiteHref } from "@/lib/kl/slug";
import { getWebsite, getWebsiteRelated } from "@/lib/sanity/websites";
import WebsiteView from "@/components/v2/WebsiteView";

/* Website slugs are canonical from the start (the Studio enforces it), and
   middleware 308s a non-canonical link, so this only has to try the one form. */
async function find(param: string) {
  const raw = decodeParam(param);
  return { raw, site: await getWebsite(toSlug(raw) || raw) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { site } = await find((await params).slug);
  if (!site) return { title: "Not found" };
  const href = websiteHref(site.slug);
  const image = cropTop(site.screenshot, 1200, 630);
  return {
    title: site.name,
    description: site.tagline ?? `${site.name} — a complete ${site.category.toLowerCase()} website with its code and design system.`,
    alternates: { canonical: href },
    openGraph: { type: "article", title: site.name, description: site.tagline, url: href, images: image ? [{ url: image, width: 1200, height: 630 }] : undefined },
    twitter: { card: "summary_large_image", title: site.name, description: site.tagline },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const [{ raw, site }, viewer] = await Promise.all([find((await params).slug), getViewer()]);
  if (!site) notFound();
  if (site.slug !== raw) permanentRedirect(websiteHref(site.slug));
  const related = await getWebsiteRelated(site);
  return <WebsiteView site={site} related={related} viewer={viewer} />;
}
