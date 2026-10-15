/**
 * The filter pills on /websites, shared by the Studio schema and the app —
 * which is why this file imports nothing. A closed list, like the library's
 * types, so the pills cannot sprout typos.
 */
export const WEBSITE_CATEGORIES = [
  "Landing",
  "SaaS",
  "Portfolio",
  "Agency",
  "Ecommerce",
  "Blog",
  "Pricing",
  "Product page",
  "Other",
] as const;

export type WebsiteCategory = (typeof WEBSITE_CATEGORIES)[number];
