/** Exclude the synthetic card pairs authored by tools/seed-sanity.mjs.
 * Uploading either real preview in Sanity replaces this pair automatically.
 */
export function hasRealPreview(asset: { slug: string; poster?: string; clip?: string }): boolean {
  if (!asset.poster && !asset.clip) return false;
  const prefix = `${asset.slug}/card.`;
  const isSeed = asset.poster === `${prefix}webp` && asset.clip === `${prefix}mp4`;
  const isCollectionSeed = asset.poster === `collections/${prefix}webp` && asset.clip === `collections/${prefix}mp4`;
  return !isSeed && !isCollectionSeed;
}

/** Exclude the four fixed drops authored by tools/seed-sanity.mjs — the same
 * signature-matching idea as hasRealPreview, but keyed on `_id` since a drop
 * has no media field to check. The seed script sets `_id` to exactly
 * `drop-${slug}`; a Studio-authored drop gets Sanity's own random id.
 */
export function hasRealId(drop: { _id: string; slug: string }): boolean {
  return drop._id !== `drop-${drop.slug}`;
}
