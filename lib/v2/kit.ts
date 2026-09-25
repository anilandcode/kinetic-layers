import type { Asset, Palette } from "@/lib/kl/types";
import { img, frame, CARD_W } from "@/lib/kl/media";

/**
 * Pure helpers the v2 screens share. No React, no data fetching — safe on
 * both sides of the server boundary.
 */

/** "TEMPLATE" → "Template". The query uppercases `type` so the library groups it. */
export function typeLabel(type: string): string {
  const t = type.trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Kit";
}

export function tierLabel(kit: Pick<Asset, "free">): string {
  return kit.free ? "Free" : "Premium";
}

/**
 * The still to paint for a kit at a given width.
 *
 * Samples are hotlinked GIFs on someone else's host, so they skip the media
 * pipeline: a /cdn-cgi/ transform would both fail on a foreign origin and
 * flatten the animation. Real kits go through lib/kl/media.ts as before, with
 * a frame cut from the clip for video-only kits.
 */
/**
 * Whether an image URL animates (a GIF, or Mux's animated WebP). Several
 * preview samples are hotlinked animated GIFs; left in an <img> they repaint
 * on every frame, so components show their first frame and animate on intent.
 */
export function isAnimatedImage(url?: string | null): boolean {
  return Boolean(url && (/\.gif(\?|#|$)/i.test(url) || /\/animated\.webp/i.test(url)));
}

export function stillFor(kit: Asset, width = CARD_W): string | undefined {
  if (kit.sample) return kit.poster;
  if (kit.poster) return img(kit.poster, width);
  if (kit.clip) return frame(kit.clip, width);
  return undefined;
}

/** Aura stops from the kit's own swatches, or nothing — see components/v2/Aura. */
export function auraStops(palette?: Palette | null): [string, string, string] | null {
  if (!palette) return null;
  const a = palette.vibrant ?? palette.dominant;
  const b = palette.muted ?? palette.lightVibrant ?? palette.dominant;
  const c = palette.darkMuted ?? palette.dominant;
  return a && b && c ? [a, b, c] : null;
}

export function formatBytes(bytes?: number): string | null {
  if (!bytes) return null;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(bytes >= 10485760 ? 0 : 1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const words = (text?: string) => (text ? text.trim().split(/\s+/).filter(Boolean).length : 0);

/* ---------------------------------------------------------------------------
   The kit graph.

   Six possible parts, and a kit shows only the ones it has:

     reference ─▶ spec ─▶ reconstruction ─▶ output
                    └──▶ adaptation ─────▶ your brand

   "output" exists only when there is a verification record — it is the
   rebuilt result, and there is no result without a test. "your brand" exists
   only when there is an adaptation prompt to produce it.
   ------------------------------------------------------------------------- */

export type NodeId = "reference" | "spec" | "reconstruction" | "output" | "adaptation" | "brand";

export type KitNode = {
  id: NodeId;
  title: string;
  /** One honest line: what this part is, measured from the data. */
  meta: string;
  /** Whether it carries a confirmed, current state (the chartreuse dot). */
  signal?: boolean;
};

export type KitGraph = {
  main: KitNode[];
  branch: KitNode[];
  /** Index in `main` the branch leaves from. */
  branchFrom: number;
  /** Parts a finished kit has and this one does not yet, in words. */
  missing: string[];
  verified: boolean;
};

export function kitGraph(kit: Asset): KitGraph {
  const main: KitNode[] = [];
  const branch: KitNode[] = [];
  const missing: string[] = [];

  const hasMedia = Boolean(kit.poster || kit.clip);
  if (hasMedia) {
    const size = kit.width && kit.height ? `${kit.width}×${kit.height}` : null;
    main.push({
      id: "reference",
      title: "Reference",
      meta: [kit.clip && !kit.poster ? "Video" : "Image", size].filter(Boolean).join(" · "),
    });
  }

  const specWords = words(kit.notes);
  if (specWords) main.push({ id: "spec", title: "Design spec", meta: `${specWords.toLocaleString("en")} words` });
  else missing.push("design spec");

  if (kit.promptLength) {
    main.push({
      id: "reconstruction",
      title: "Reconstruction prompt",
      meta: `${kit.promptLength.toLocaleString("en")} characters`,
    });
  } else missing.push("reconstruction prompt");

  const records = kit.verifications ?? [];
  const passes = records.filter((r) => r.result === "Pass").length;
  if (records.length) {
    main.push({
      id: "output",
      title: "Output",
      meta: `${passes} of ${records.length} rebuilds passed`,
      signal: passes > 0,
    });
  }

  if (kit.adaptationLength) {
    branch.push({
      id: "adaptation",
      title: "Adaptation prompt",
      meta: `${kit.adaptationLength.toLocaleString("en")} characters`,
    });
    branch.push({ id: "brand", title: "Your brand", meta: "The kit, in your palette, type and copy" });
  } else missing.push("adaptation prompt");

  const specIndex = main.findIndex((n) => n.id === "spec");
  return {
    main,
    branch,
    branchFrom: specIndex >= 0 ? specIndex : 0,
    missing,
    verified: passes > 0,
  };
}
