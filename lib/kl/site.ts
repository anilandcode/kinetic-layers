/**
 * Where this site lives.
 *
 * Metadata needs an absolute origin: `openGraph.images` and canonical URLs
 * cannot be relative, and Next needs `metadataBase` to resolve them.
 *
 * This is also the origin used for every auth email link. It is deliberately
 * NOT derived from request headers: `x-forwarded-host` is attacker-controlled,
 * and a password-reset link built from it can be pointed at another domain.
 */
function resolveSiteUrl(): string {
  /* Explicit wins. The only value that is right on every host, and the only
     one that survives a move off Vercel. Set it in production. */
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  /* Vercel-only. It names the production deployment even on a preview, which
     is what we want for links that outlive the preview that sent them. */
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  /* Reaching localhost in production is silent poison: it lands in canonical
     tags, the sitemap, OG image URLs, Stripe's success_url and every auth
     email link. Say so on the server rather than shipping broken links. */
  if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    console.error(
      "SITE_URL fell back to http://localhost:3000 in production. " +
        "Set NEXT_PUBLIC_SITE_URL (for example https://kineticlayers.com). " +
        "Canonical URLs, the sitemap, OG images, Stripe redirects and auth email links are wrong until you do."
    );
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/**
 * The address people are told to write to.
 *
 * One definition, because the placeholder fallback used to be copied into four
 * files and a wrong support address is worse than none: it silently swallows
 * the messages from exactly the people who are already stuck.
 */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@kineticlayers.com";

export const SITE_NAME = "Kinetic Layers";
export const SITE_TAGLINE = "a library worth stealing from";
export const SITE_DESCRIPTION =
  "Prompts, templates, scenes and workflows built in one studio and shipped weekly. Every item comes with the output, the source, and one site already running on it.";
