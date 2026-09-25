import "server-only";
import { groq } from "next-sanity";
import { sanity } from "./client";
import type { Asset, Collection, Drop, Settings } from "@/lib/kl/types";

/**
 * Every read the site makes.
 *
 * Cached by tag so a Studio edit invalidates exactly what it touched — see
 * app/api/revalidate/route.ts. Nothing here selects `promptBody` or a file's
 * `storagePath`: those are gated, and the gate is enforced where the download
 * happens, not by hoping a component forgets to render them.
 */

/**
 * Card projection.
 *
 * `promptLength` is the length ONLY, so a card knows whether it has a prompt
 * to offer without the text itself ever leaving Sanity — length() evaluates
 * server-side and what ships is a number. (Comments live out here because GROQ
 * has no block-comment syntax; one inside the template is a parse error.)
 */
/* Media, name and height all have to survive two shapes at once. Anything
   uploaded in the Studio has a `media` image asset, whose url and dimensions
   Sanity records for us; rows that predate that still carry a `poster` path
   string. Both are handed to lib/kl/media.ts, which resolves a path against
   NEXT_PUBLIC_MEDIA_BASE and rewrites a cdn.sanity.io URL onto the same host,
   so one field serves both and neither is fetched from the CMS.

   The height is the real aspect ratio scaled into the band the masonry wants,
   which is why nobody types a number any more. Clamped, because a very tall
   image should not own the column.

   The name falls back to the uploaded filename with its extension stripped,
   so an asset published with the name left empty still reads as something.

   `type` is uppercased on the way out. The seed and the import script write
   "TEMPLATE"; the Studio's dropdown writes "Template". Left alone that is two
   tabs on /library for one type, and a filter that matches half the assets.

   `free` uses select() rather than coalesce() on purpose. GROQ evaluates
   `null == "Free"` to false rather than null, so a coalesce would stop at the
   first branch and never reach the legacy boolean — quietly paywalling every
   free asset that predates `tier`. Caught by a query returning free:false for
   an asset that is free. */
const MEDIA = groq`
  "poster": coalesce(media.asset->url, poster),
  "clip": coalesce(clip.asset->url, clip),
  "aspect": coalesce(media.asset->metadata.dimensions.aspectRatio, aspect),
  "h": coalesce(
    round(math::min([420, math::max([170, 300 / coalesce(media.asset->metadata.dimensions.aspectRatio, 1.4)])])),
    previewHeight,
    220
  ),
  "name": coalesce(name, string::split(media.asset->originalFilename, ".")[0], string::split(clip.asset->originalFilename, ".")[0], "Untitled"),
  "tags": coalesce(tags[defined(@->title)]->title, []),
  "free": select(defined(tier) => tier == "Free", coalesce(free, false)),
  "palette": media.asset->metadata.palette{
    "dominant": dominant.background, "vibrant": vibrant.background, "muted": muted.background,
    "darkMuted": darkMuted.background, "lightVibrant": lightVibrant.background
  }
`;

const ASSET_CARD = groq`{
  "slug": slug.current,
  "type": upper(coalesce(type, "")), tagline,
  "featured": coalesce(featured, false), priority,
  ${MEDIA},
  "promptLength": length(coalesce(prompt, promptBody, ""))
}`;

const ASSET_FULL = groq`{
  "slug": slug.current,
  "type": upper(coalesce(type, "")), tagline,
  "featured": coalesce(featured, false), priority,
  "notes": coalesce(notes, ""),
  ${MEDIA},
  "files": coalesce(files[]{ name, meta, tag, bytes }, []),
  "promptLength": length(coalesce(prompt, promptBody, "")),
  "promptPreview": array::join(string::split(coalesce(prompt, promptBody, ""), "\\n")[0..1], "\\n"),
  "drop": drop->{ title, "slug": slug.current, meta, tag },
  "width": media.asset->metadata.dimensions.width,
  "height": media.asset->metadata.dimensions.height,
  publishedAt, version, releaseStatus,
  "adaptationLength": length(coalesce(adaptationPrompt, "")),
  "adaptationPreview": array::join(string::split(coalesce(adaptationPrompt, ""), "\\n")[0..1], "\\n"),
  "verifications": verifications[defined(tool) && defined(result)]{
    tool, model, date, result, note, "comparison": comparison.asset->url
  }
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

export type Related = { assets: Asset[]; reason: "drop" | "tag" | "newest" };

/**
 * Genuinely related assets.
 *
 * This used to be `*[slug.current != $slug] | order(publishedAt desc)[0...4]` —
 * the four newest others, ignoring drop, collection, shelf and mood entirely,
 * while the item page headed them "From the same drop". The query was fine; the
 * claim was false.
 *
 * Now it prefers the same drop, falls back to sharing a tag, and only then to
 * newest — and reports WHICH, so the heading can say what is actually true
 * rather than asserting a relationship that may not exist. One round trip:
 * all three candidate sets come back together and the choice happens here.
 */
export async function getRelated(slug: string, limit = 4): Promise<Related> {
  const r = await ask<{ drop: Asset[]; tag: Asset[]; newest: Asset[] } | null>(
    null,
    groq`*[_type == "asset" && slug.current == $slug][0] {
      "drop": *[_type == "asset" && slug.current != $slug && drop._ref == ^.drop._ref]
        | order(publishedAt desc) [0...$limit] ${ASSET_CARD},
      "tag": *[_type == "asset" && slug.current != $slug && count(tags[@._ref in ^.^.tags[]._ref]) > 0]
        | order(publishedAt desc) [0...$limit] ${ASSET_CARD},
      "newest": *[_type == "asset" && slug.current != $slug]
        | order(publishedAt desc) [0...$limit] ${ASSET_CARD}
    }`,
    { slug, limit },
    opts(["asset", `asset:${slug}`])
  );
  if (!r) return { assets: [], reason: "newest" };

  /* A single sibling is a thin claim to make a heading out of, so a drop or a
     shared tag has to offer at least two before it earns the label. */
  if (r.drop?.length >= 2) return { assets: r.drop, reason: "drop" };
  if (r.tag?.length >= 2) return { assets: r.tag, reason: "tag" };
  return { assets: r.newest ?? [], reason: "newest" };
}

/* A collection borrows its cover from an asset it already contains — the one
   named in `cover`, else the first in the list. Uploading a second copy of an
   image that is already in the catalogue is a copy to keep in step, which is
   why there is no upload field on a collection at all. */
const COLLECTION_COVER = groq`
  "poster": coalesce(cover->media.asset->url, assets[0]->media.asset->url, cover->poster, assets[0]->poster),
  "clip": coalesce(cover->clip.asset->url, assets[0]->clip.asset->url),
  "aspect": coalesce(cover->media.asset->metadata.dimensions.aspectRatio, assets[0]->media.asset->metadata.dimensions.aspectRatio),
  "h": coalesce(
    round(math::min([420, math::max([170, 300 / coalesce(cover->media.asset->metadata.dimensions.aspectRatio, assets[0]->media.asset->metadata.dimensions.aspectRatio, 1.4)])])),
    230
  )
`;

export async function getCollections(): Promise<Collection[]> {
  return ask<Collection[]>(
    [],
    groq`*[_type == "collection"] | order(name asc) {
      "slug": slug.current, name, blurb,
      "tags": coalesce(tags[defined(@->title)]->title, []),
      ${COLLECTION_COVER},
      "items": count(assets),
      "free": count(assets[]->[select(defined(tier) => tier == "Free", coalesce(free, false)) == true])
    }`,
    {},
    opts(["collection"])
  );
}

export async function getCollection(slug: string): Promise<(Collection & { assets: Asset[] }) | null> {
  return ask<(Collection & { assets: Asset[] }) | null>(
    null,
    groq`*[_type == "collection" && slug.current == $slug][0] {
      "slug": slug.current, name, blurb,
      "tags": coalesce(tags[defined(@->title)]->title, []),
      ${COLLECTION_COVER},
      "items": count(assets),
      "free": count(assets[]->[select(defined(tier) => tier == "Free", coalesce(free, false)) == true]),
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
    /* The name is matched through the same fallback the cards display. An
       asset published with `name` empty — verdro, today — is named after its
       uploaded file, and matching the raw field made it unsearchable. */
    groq`*[_type == "asset" && (
        coalesce(name, media.asset->originalFilename, clip.asset->originalFilename, "") match $m ||
        slug.current match $m || type match $m || tagline match $m || count(tags[@->title match $m]) > 0
      )]
      | order(publishedAt desc) [0...$limit] ${ASSET_CARD}`,
    { m: `${q.trim()}*`, limit },
    { next: { revalidate: 60 } }
  );
}

/**
 * The one place a gated prompt is read in full — the reconstruction prompt
 * by default, or the adaptation prompt. Callers must check entitlement.
 */
export async function getPromptBody(
  slug: string,
  kind: "reconstruction" | "adaptation" = "reconstruction"
): Promise<string> {
  const r = await ask<{ body?: string } | null>(
    null,
    kind === "adaptation"
      ? groq`*[_type == "asset" && slug.current == $slug][0]{ "body": adaptationPrompt }`
      : groq`*[_type == "asset" && slug.current == $slug][0]{ "body": promptBody }`,
    { slug },
    { next: { tags: [`asset:${slug}`] } }
  );
  return r?.body ?? "";
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

/**
 * The tag vocabulary the library offers as filters.
 *
 * Only `featured` ones. Every tag is still available for tagging an asset — the
 * chip row had grown to ~35 because it listed whatever the catalogue contained,
 * which is a vocabulary nobody chose. This is the curated subset, ordered by
 * `order` then alphabetically.
 */
export async function getFilterTags(): Promise<string[]> {
  const rows = await ask<Array<{ title: string }>>(
    [],
    groq`*[_type == "tag" && featured == true] | order(order asc, title asc) { title }`,
    {},
    opts(["tags"])
  );
  return rows.map((r) => r.title).filter(Boolean);
}
