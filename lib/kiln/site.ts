/**
 * Where this site lives.
 *
 * Metadata needs an absolute origin: `openGraph.images` and canonical URLs
 * cannot be relative, and Next needs `metadataBase` to resolve them. Vercel
 * sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, so production and
 * previews each describe themselves correctly without a hardcoded domain to
 * forget about when the domain changes.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Kiln";
export const SITE_TAGLINE = "a library worth stealing from";
export const SITE_DESCRIPTION =
  "Prompts, templates, scenes and workflows built in one studio and shipped weekly. Every item comes with the output, the source, and one site already running on it.";
