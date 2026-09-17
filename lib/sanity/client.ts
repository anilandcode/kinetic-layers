import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-08-25";

/**
 * Whether the catalogue is wired up.
 *
 * This line used to be `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!` — an
 * assertion that the value exists, which on Vercel it did not. `createClient`
 * throws at module load, Next hit it while collecting page data for
 * /api/download, and the *build* died with "Configuration must contain
 * `projectId`" — naming neither the variable nor the environment missing it.
 * Four production deploys failed that way before anyone read the log.
 *
 * So it degrades instead, exactly as auth already does in
 * lib/supabase/config.ts: queries return empty, pages render the honest empty
 * states they already have, and the server logs once, loudly, naming the
 * variable. A missing key should cost a page, never a build.
 */
export const sanityConfigured = Boolean(projectId);

if (!sanityConfigured && typeof window === "undefined") {
  console.error(
    "[kinetic-layers] NEXT_PUBLIC_SANITY_PROJECT_ID is not set — the catalogue will be empty. " +
      "Set it locally in .env.local, or on Vercel under Settings → Environment Variables."
  );
}

/**
 * Read client, or null when unconfigured.
 *
 * No image-url builder here: preview media is not uploaded to Sanity at all.
 * It lives on the media host and is resolved by lib/kl/media.ts.
 *
 * The dataset is public and holds catalogue metadata only — no token, and
 * nothing here is gated. What IS gated (the source files) lives in a private
 * Supabase bucket and never appears in this content.
 *
 * `useCdn: false` because pages are cached by Next with tag revalidation; a
 * second cache in front of it would only delay edits.
 */
/**
 * A read token, when one is set — and it has to be, for anything new.
 *
 * The dataset's aclMode is "public" and this client sent no token for months,
 * which worked because every document type predated the problem. It does not
 * hold for new types: `tag` documents are returned to an authenticated query
 * and not to an anonymous one, and so is a throwaway type created purely to
 * test it. Anonymous `array::unique(*[]._type)` lists exactly the four original
 * types. Deploying the schema does not change it.
 *
 * Whatever the underlying rule is, it is not diagnosable from the API with an
 * Editor token, and a reference that will not dereference is not a half-working
 * feature — `tags[]->title` comes back empty for everyone. So the token is the
 * fix, and it costs nothing when absent: without it this behaves exactly as it
 * did before.
 *
 * Server-only, deliberately. It is never NEXT_PUBLIC_, and the guard below
 * means that even if this module were pulled into a client bundle the token
 * would not travel with it. `perspective: "published"` still applies, so a
 * token cannot surface drafts either.
 */
const readToken =
  typeof window === "undefined" ? process.env.SANITY_API_READ_TOKEN : undefined;

if (sanityConfigured && !readToken && typeof window === "undefined") {
  console.warn(
    "[kinetic-layers] SANITY_API_READ_TOKEN is not set — catalogue documents may load, " +
      "but tag and uploaded-media references can resolve empty on this dataset."
  );
}

export const sanity = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
      ...(readToken ? { token: readToken } : {}),
    })
  : null;
