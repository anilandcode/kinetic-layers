import "server-only";
import { groq } from "next-sanity";
import { sanity } from "./client";
import type { Asset, Collection, Drop, Settings } from "@/lib/kiln/types";

/**
 * Every read the site makes.
 *
 * Cached by tag so a Studio edit invalidates exactly what it touched — see
 * app/api/revalidate/route.ts. Nothing here selects `promptBody` or a file's
 * `storagePath`: those are gated, and the gate is enforced where the download
 * happens, not by hoping a component forgets to render them.
 */

const ASSET_CARD = groq`{
  "slug": slug.current,
  name, type, stack, shelf, mood, free, tagline,
  "h": coalesce(previewHeight, 220),
  "g": coalesce(gradient, "linear-gradient(155deg,#1D2410,#0F0F0D 65%)"),
  poster, clip, aspect
}`;

const ASSET_FULL = groq`{
  "slug": slug.current,
  name, type, stack, shelf, mood, free, tagline, body,
  "h": coalesce(previewHeight, 220),
  "g": coalesce(gradient, "linear-gradient(155deg,#1D2410,#0F0F0D 65%)"),
  poster, clip, aspect,
  "shots": coalesce(shots[]{ label, gradient, poster, clip }, []),
  "specs": coalesce(specs[]{ k, v }, []),
  "files": coalesce(files[]{ name, meta, tag, bytes }, []),
  "promptLength": length(coalesce(promptBody, "")),
  "promptPreview": array::join(string::split(coalesce(promptBody, ""), "\\n")[0..1], "\\n"),
  "drop": drop->{ title, "slug": slug.current, meta, tag }
}`;

const opts = (tags: string[]) => ({ next: { tags, revalidate: 3600 } });

export async function getAssets(): Promise<Asset[]> {
  return sanity.fetch(
    groq`*[_type == "asset"] | order(publishedAt desc) ${ASSET_CARD}`,
    {},
    opts(["asset"])
  );
}

export async function getAsset(slug: string): Promise<Asset | null> {
  return sanity.fetch(
    groq`*[_type == "asset" && slug.current == $slug][0] ${ASSET_FULL}`,
    { slug },
    opts(["asset", `asset:${slug}`])
  );
}

export async function getAssetSlugs(): Promise<string[]> {
  return sanity.fetch(groq`*[_type == "asset" && defined(slug.current)].slug.current`, {}, opts(["asset"]));
}

export async function getRelated(slug: string, limit = 4): Promise<Asset[]> {
  return sanity.fetch(
    groq`*[_type == "asset" && slug.current != $slug] | order(publishedAt desc) [0...$limit] ${ASSET_CARD}`,
    { slug, limit },
    opts(["asset"])
  );
}

export async function getCollections(): Promise<Collection[]> {
  return sanity.fetch(
    groq`*[_type == "collection"] | order(name asc) {
      "slug": slug.current, name, blurb, shelf,
      "tags": coalesce(tags, []),
      "h": coalesce(previewHeight, 230),
      "g": coalesce(gradient, "linear-gradient(150deg,#242014,#0F0F0D 62%)"),
      poster, clip, aspect,
      "items": count(assets),
      "free": count(assets[]->[free == true])
    }`,
    {},
    opts(["collection"])
  );
}

export async function getCollection(slug: string): Promise<(Collection & { assets: Asset[] }) | null> {
  return sanity.fetch(
    groq`*[_type == "collection" && slug.current == $slug][0] {
      "slug": slug.current, name, blurb, shelf,
      "tags": coalesce(tags, []),
      "h": coalesce(previewHeight, 230),
      "g": coalesce(gradient, "linear-gradient(150deg,#242014,#0F0F0D 62%)"),
      poster, clip, aspect,
      "items": count(assets),
      "free": count(assets[]->[free == true]),
      "assets": coalesce(assets[]-> ${ASSET_CARD}, [])
    }`,
    { slug },
    opts(["collection", `collection:${slug}`])
  );
}

export async function getCollectionSlugs(): Promise<string[]> {
  return sanity.fetch(
    groq`*[_type == "collection" && defined(slug.current)].slug.current`,
    {},
    opts(["collection"])
  );
}

export async function getDrops(): Promise<Drop[]> {
  return sanity.fetch(
    groq`*[_type == "drop"] | order(shippedAt desc) { title, "slug": slug.current, meta, tag }`,
    {},
    opts(["drop"])
  );
}

export async function getSettings(): Promise<Settings> {
  const s = await sanity.fetch<Settings | null>(
    groq`*[_type == "settings"][0] {
      totalAssets, freeThisMonth, addedThisWeek, monthlyPrice, annualPrice, currentDrop, collectionCount
    }`,
    {},
    opts(["settings"])
  );
  /* Falls back rather than throwing: an empty dataset should still render a
     site, not a stack trace. */
  return {
    totalAssets: s?.totalAssets ?? 240,
    freeThisMonth: s?.freeThisMonth ?? 12,
    addedThisWeek: s?.addedThisWeek ?? 9,
    monthlyPrice: s?.monthlyPrice ?? 24,
    annualPrice: s?.annualPrice ?? 240,
    currentDrop: s?.currentDrop ?? "019",
    collectionCount: s?.collectionCount ?? 18,
  };
}

export async function searchAssets(q: string, limit = 8): Promise<Asset[]> {
  if (!q.trim()) return [];
  return sanity.fetch(
    groq`*[_type == "asset" && (name match $m || type match $m || stack match $m || mood match $m)]
      | order(publishedAt desc) [0...$limit] ${ASSET_CARD}`,
    { m: `${q.trim()}*`, limit },
    { next: { revalidate: 60 } }
  );
}

/** The one place a gated prompt is read in full. Callers must check entitlement. */
export async function getPromptBody(slug: string): Promise<string> {
  const r = await sanity.fetch<{ promptBody?: string } | null>(
    groq`*[_type == "asset" && slug.current == $slug][0]{ promptBody }`,
    { slug },
    { next: { tags: [`asset:${slug}`] } }
  );
  return r?.promptBody ?? "";
}

/** File storage paths, for the download route only. */
export async function getAssetFiles(
  slug: string
): Promise<Array<{ name: string; storagePath?: string; bytes?: number }>> {
  const r = await sanity.fetch<{ files?: Array<{ name: string; storagePath?: string; bytes?: number }> } | null>(
    groq`*[_type == "asset" && slug.current == $slug][0]{ files[]{ name, storagePath, bytes } }`,
    { slug },
    { next: { tags: [`asset:${slug}`] } }
  );
  return r?.files ?? [];
}
