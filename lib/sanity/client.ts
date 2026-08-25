import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-08-25";

/**
 * Read client.
 *
 * No image-url builder here: preview media is not uploaded to Sanity at all.
 * It lives in R2 and is resolved by lib/kiln/media.ts — see the note there.
 *
 * The dataset is public and holds catalogue metadata only — no token, and
 * nothing here is gated. What IS gated (the source files) lives in a private
 * Supabase bucket and never appears in this content.
 *
 * `useCdn: false` because pages are cached by Next with tag revalidation; a
 * second cache in front of it would only delay edits.
 */
export const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
