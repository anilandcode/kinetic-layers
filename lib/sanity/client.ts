import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-08-25";

/**
 * Read client.
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

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: Image) {
  return builder.image(source);
}
