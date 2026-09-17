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
