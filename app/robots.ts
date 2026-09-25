import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/kl/site";

/**
 * The disallow list mirrors the pages that already carry `robots: noindex`
 * in their own metadata. Saying it in both places is deliberate: noindex asks
 * a crawler not to list a page it has already fetched, robots.txt asks it not
 * to fetch at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/join", "/reset-password", "/api/", "/plan"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
