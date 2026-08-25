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

/**
 * Every read goes through here.
 *
 * When NEXT_PUBLIC_SANITY_PROJECT_ID is missing, `sanity` is null and each
 * caller gets the empty value its own signature promises — an empty list, or
 * null for a single document. The pages already have honest empty states for
 * exactly that, so an unconfigured deployment renders a working site with
 * nothing in it instead of a stack trace.
 */
async function ask<T>(fallback: T, query: string, params: Record<string, unknown> = {}, options = {}): Promise<T> {
  if (!sanity) return fallback;
  return sanity.fetch<T>(query, params, options);
}

export async function getAssets(): Promise<Asset[]> {
  return ask<Asset[]>(
    [],
    groq`*[_type == "asset"] | order(publishedAt desc) ${ASSET_CARD}`,
    {},
    opts(["asset"])
  );
}

export async function getAsset(slug: string): Promise<Asset | null> {
  return ask<Asset | null>(
    null,
    groq`*[_type == "asset" && slug.current == $slug][0] ${ASSET_FULL}`,
    { slug },
    opts(["asset", `asset:${slug}`])
  );
}

export async function getAssetSlugs(): Promise<string[]> {
  return ask<string[]>([], groq`*[_type == "asset" && defined(slug.current)].slug.current`, {}, opts(["asset"]));
}

export async function getRelated(slug: string, limit = 4): Promise<Asset[]> {
  return ask<Asset[]>(
    [],
    groq`*[_type == "asset" && slug.current != $slug] | order(publishedAt desc) [0...$limit] ${ASSET_CARD}`,
    { slug, limit },
    opts(["asset"])
  );
}

export async function getCollections(): Promise<Collection[]> {
  return ask<Collection[]>(
    [],
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
  return ask<(Collection & { assets: Asset[] }) | null>(
    null,
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
  return ask<string[]>(
    [],
    groq`*[_type == "collection" && defined(slug.current)].slug.current`,
    {},
    opts(["collection"])
  );
}

export async function getDrops(): Promise<Drop[]> {
  return ask<Drop[]>(
    [],
    groq`*[_type == "drop"] | order(shippedAt desc) { title, "slug": slug.current, meta, tag }`,
    {},
    opts(["drop"])
  );
}

/**
 * Site-wide numbers.
 *
 * The counts are COUNTED, not stored. A settings document holding "240 assets"
 * is a number that starts out aspirational and stays wrong forever — the hero
 * claimed 240 while the dataset held 15, which is the loudest way for a real
 * site to read as a mockup. Only the things that genuinely are settings —
 * prices, the drop label — come from the document.
 */
export async function getSettings(): Promise<Settings> {
  const s = await ask<Settings | null>(
    null,
    groq`{
      "doc": *[_type == "settings"][0]{ monthlyPrice, annualPrice, currentDrop },
      "totalAssets": count(*[_type == "asset"]),
      "freeThisMonth": count(*[_type == "asset" && free == true]),
      "collectionCount": count(*[_type == "collection"]),
      "addedThisWeek": count(*[_type == "asset" && publishedAt > $weekAgo])
    }{
      "monthlyPrice": doc.monthlyPrice,
      "annualPrice": doc.annualPrice,
      "currentDrop": doc.currentDrop,
      totalAssets, freeThisMonth, collectionCount, addedThisWeek
    }`,
    { weekAgo: new Date(Date.now() - 7 * 864e5).toISOString() },
    opts(["settings", "asset", "collection"])
  );
  /* Counts fall back to 0, not to a flattering guess: an honest empty shelf
     beats an invented full one, and an empty dataset should still render a
     site rather than a stack trace. */
  return {
    totalAssets: s?.totalAssets ?? 0,
    freeThisMonth: s?.freeThisMonth ?? 0,
    addedThisWeek: s?.addedThisWeek ?? 0,
    monthlyPrice: s?.monthlyPrice ?? 24,
    annualPrice: s?.annualPrice ?? 240,
    currentDrop: s?.currentDrop ?? "001",
    collectionCount: s?.collectionCount ?? 0,
  };
}

export async function searchAssets(q: string, limit = 8): Promise<Asset[]> {
  if (!q.trim()) return [];
  return ask<Asset[]>(
    [],
    groq`*[_type == "asset" && (name match $m || type match $m || stack match $m || mood match $m)]
      | order(publishedAt desc) [0...$limit] ${ASSET_CARD}`,
    { m: `${q.trim()}*`, limit },
    { next: { revalidate: 60 } }
  );
}

/** The one place a gated prompt is read in full. Callers must check entitlement. */
export async function getPromptBody(slug: string): Promise<string> {
  const r = await ask<{ promptBody?: string } | null>(
    null,
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
  const r = await ask<{ files?: Array<{ name: string; storagePath?: string; bytes?: number }> } | null>(
    null,
    groq`*[_type == "asset" && slug.current == $slug][0]{ files[]{ name, storagePath, bytes } }`,
    { slug },
    { next: { tags: [`asset:${slug}`] } }
  );
  return r?.files ?? [];
}
