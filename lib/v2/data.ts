import "server-only";
import { getAsset, getAssets, getRelated } from "@/lib/sanity/queries";
import { hasRealPreview } from "@/lib/kl/preview-ready";
import type { Asset } from "@/lib/kl/types";
import { getSample, getSamples } from "./samples";

/**
 * The v2 screens' reads. Real kits come from Sanity exactly as before; on a
 * preview deployment the owner's samples are appended after them — never
 * mixed in front, never counted, never searchable. In production getSamples()
 * is an empty list, so every function here returns only real kits.
 */

/** Published kits with a real preview, newest first. The 15 seeded placeholders are excluded. */
export async function getKits(): Promise<Asset[]> {
  return (await getAssets()).filter(hasRealPreview);
}

/** Real kits, then samples on a preview. For grids only — not for counts. */
export async function getKitsForDisplay(): Promise<{ real: Asset[]; shown: Asset[] }> {
  const real = await getKits();
  return { real, shown: [...real, ...getSamples()] };
}

export async function getKit(slug: string): Promise<Asset | null> {
  const kit = getSample(slug) ?? (await getAsset(slug));
  if (!kit) return null;
  /* GROQ answers null, not [], for an absent array; normalise once here so no
     component has to remember. */
  return { ...kit, files: kit.files ?? [], tags: kit.tags ?? [], verifications: kit.verifications ?? [] };
}

/**
 * The kits the workbench draws, and which one it opens on.
 *
 * The card projection leaves out the spec and prompt previews the canvas
 * shows, so real kits are read in full — there are few, and each read is
 * cached. Samples follow on a preview. It opens on the illustrative sample
 * where there is one (a preview), so every node is drawn, and on the first
 * real kit with an image otherwise.
 */
export async function getWorkbenchKits(real: Asset[]): Promise<{ kits: Asset[]; initial?: string }> {
  const full = (await Promise.all(real.slice(0, 16).map((k) => getKit(k.slug)))).filter(
    (k): k is Asset => Boolean(k)
  );
  const kits = [...full, ...getSamples()];
  const initial = kits.find((k) => k.illustrative)?.slug ?? (full.find((k) => k.poster) ?? full[0])?.slug;
  return { kits, initial };
}

export async function getKitRelated(kit: Asset): Promise<{ assets: Asset[]; reason: "drop" | "tag" | "newest" }> {
  const samples = getSamples().filter((s) => s.slug !== kit.slug);
  if (kit.sample) return { assets: samples.slice(0, 3), reason: "newest" };
  const related = await getRelated(kit.slug);
  const real = related.assets.filter(hasRealPreview);
  if (real.length >= 3 || !samples.length) return { assets: real, reason: related.reason };
  return { assets: [...real, ...samples].slice(0, 3), reason: real.length ? related.reason : "newest" };
}
