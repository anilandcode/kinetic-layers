import type { MetadataRoute } from "next";
import { getAssetSlugs, getCollectionSlugs } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/kiln/site";

/**
 * Sitemap, generated from the catalogue rather than maintained by hand.
 *
 * Only public pages. /account, /join and /reset-password are already
 * noindex — listing them here would contradict that, and inviting a crawler
 * to a sign-in form helps nobody.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [assets, collections] = await Promise.all([getAssetSlugs(), getCollectionSlugs()]);
  const now = new Date();

  const still = ["", "/library", "/collections", "/pricing", "/changelog", "/license", "/docs", "/mcp", "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: (path === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...still,
    ...assets.map((slug) => ({
      url: `${SITE_URL}/item/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...collections.map((slug) => ({
      url: `${SITE_URL}/collections/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
