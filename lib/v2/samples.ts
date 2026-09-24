import type { Asset } from "@/lib/kl/types";

/**
 * Sample content, for the owner's eyes only.
 *
 * The twenty MotionSites references are how the owner judges what a full
 * library will look like before there are twenty real kits. They render
 * through the real KitCard and the real kit page, marked "Sample", on local
 * dev and on Vercel preview deployments — never on production, never in a
 * count, a search result, a filter or a download.
 *
 * The media stays hotlinked (the owner's decision). Width, height and up to
 * three hues were measured once from those files on 2026-09-24 (saturated
 * pixels only, binned by hue), so each sample's gradient comes from its own
 * pixels rather than from a guess. Greyscale ones get no hues, and so the
 * neutral silver gradient.
 *
 * `KL_SAMPLES=1` turns them on for a local production build, which is how
 * they are checked before a push.
 */
export const SAMPLES_ENABLED =
  process.env.VERCEL_ENV === "preview" ||
  process.env.NODE_ENV === "development" ||
  process.env.KL_SAMPLES === "1";

type Row = [name: string, media: string, w: number, h: number, hues: string[]];

const ROWS: Row[] = [
  ["EMBER.dsgn", "https://image.mux.com/iK2ACd5wEwi7ORN8i16kl59Cck01IREnB3hX6EnnqiUk/animated.webp?fps=15&width=640", 640, 464, []],
  ["Digital Epoch", "https://motionsites.ai/assets/hero-digital-epoch-preview-B85ezqXO.gif", 800, 589, ["#4d7ac4", "#79e5a1", "#f6b28e"]],
  ["RIVR DeFi", "https://motionsites.ai/assets/landing-rivr-defi-preview-BPVSgEtB.gif", 444, 800, ["#51578c", "#eb9965", "#aa636c"]],
  ["Vize Footer", "https://motionsites.ai/assets/footer-vize-poster-BRRRDP-A.png", 1838, 1350, []],
  ["Kresna Footer", "https://motionsites.ai/assets/footer-kresna-preview-BrIYYd2q.gif", 800, 586, ["#2e5da9"]],
  ["NOVA Space Systems", "https://motionsites.ai/assets/hero-nova-space-preview-ej0OOJ0M.gif", 389, 800, ["#4d80aa", "#cbcfe0"]],
  ["Orbit Engineers", "https://motionsites.ai/assets/hero-orbit-engineers-poster-BT1ffUzn.png", 992, 1726, ["#b3724b", "#506c83", "#4d451f"]],
  ["Aetheris Voyage", "https://motionsites.ai/assets/hero-aetheris-voyage-preview-BGJn1z4t.gif", 800, 570, ["#705227", "#143461", "#252144"]],
  ["Digital Reality", "https://motionsites.ai/assets/hero-digital-reality-preview-BogjTXUi.gif", 800, 584, ["#ddc09c", "#324e5b"]],
  ["Zenith Realty", "https://motionsites.ai/assets/landing-zenith-realty-preview-Y1uTjYYl.gif", 454, 800, ["#826f4f", "#aecadf"]],
  ["Glow Features", "https://motionsites.ai/assets/features-glow-poster-CmUBaPAq.png", 1834, 1362, ["#38657c", "#6f3448", "#7a533a"]],
  ["AKOR Security", "https://motionsites.ai/assets/hero-akor-security-preview-hRrwsPNf.gif", 396, 800, ["#2aa926", "#23472e"]],
  ["Finlytic AI Agent", "https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif", 800, 601, ["#7453b3"]],
  ["RIVR", "https://motionsites.ai/assets/hero-rivr-preview-DcS3pjx4.gif", 800, 599, ["#95a6bc", "#957b58"]],
  ["Lumina", "https://motionsites.ai/assets/footer-lumina-preview-CYkr-ACN.gif", 800, 585, ["#2b3f55", "#d7bfb1"]],
  ["Zenith Footer", "https://motionsites.ai/assets/footer-zenith-preview-CYxIE6aF.gif", 800, 588, ["#99c9eb", "#717947", "#cad1e9"]],
  ["Impressive Hero", "https://motionsites.ai/assets/hero-impressive-preview-BCJtlSs2.gif", 800, 592, []],
  ["Nexus IT Solutions", "https://motionsites.ai/assets/hero-nexus-preview-74RfhYpA.gif", 800, 627, ["#76b3db"]],
  ["What Package Fits You", "https://motionsites.ai/assets/hero-package-fits-pricing-preview-Bglk5DXD.gif", 800, 586, ["#ebbb57", "#e6b8c2"]],
  ["Shamoni", "https://motionsites.ai/assets/hero-shamoni-preview-DfbPWZl9.gif", 800, 591, ["#a1793c", "#84a9ca", "#7f8746"]],
];

/** The section type is in the file name the references were published under. */
function typeOf(media: string, name: string): string {
  if (/\/footer-/.test(media) || /footer/i.test(name)) return "FOOTER";
  if (/\/landing-/.test(media)) return "LANDING PAGE";
  if (/\/features-/.test(media)) return "FEATURES";
  return "HERO";
}

const slugOf = (name: string) =>
  "sample-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The one sample that carries a full, made-up release so the whole graph can be judged. */
const ILLUSTRATIVE = "Aetheris Voyage";

const ALL: Asset[] = ROWS.map(([name, media, w, h, hues], index) => {
  const base: Asset = {
    slug: slugOf(name),
    name,
    type: typeOf(media, name),
    tags: [],
    free: index % 3 !== 2,
    h: Math.round(Math.min(420, Math.max(170, 300 / (w / h)))),
    poster: media,
    aspect: w / h,
    width: w,
    height: h,
    palette: hues.length ? { hues } : null,
    sample: true,
  };
  if (name !== ILLUSTRATIVE) return base;
  return {
    ...base,
    illustrative: true,
    free: false,
    tagline: "A cinematic travel hero: slow parallax over dusk light, a single-line headline and a booking bar that stays out of the way.",
    version: "1.2",
    releaseStatus: "Released",
    notes:
      "Canvas: warm near-black #111012, dusk amber #4B2D13 as the only colour.\n\n" +
      "Type: one display face at 96/88, tracking −3%, a single line on desktop, two on mobile. Body at 17/28.\n\n" +
      "Motion: background parallax at 0.2× scroll, headline fades up 12px over 480ms on the shared curve, nothing loops.\n\n" +
      "Layout: 12 columns, 24px gutters, the booking bar docked 32px from the bottom edge and never over the headline.",
    promptLength: 3184,
    promptPreview:
      "Rebuild the Aetheris Voyage hero as a single Next.js component with Tailwind.\nStart from the design spec below; match spacing and type exactly before adding motion.",
    adaptationLength: 1420,
    adaptationPreview:
      "Adapt this hero to the brand described below without changing its structure.\nReplace the palette, the display face and the copy; keep the motion values.",
    files: [
      { name: "design.md", tag: "Source", bytes: 9_800 },
      { name: "reconstruction-prompt.md", tag: "Prompts", bytes: 6_400 },
      { name: "adaptation-prompt.md", tag: "Prompts", bytes: 2_900 },
      { name: "hero.tsx", tag: "Code", bytes: 14_200 },
      { name: "media.zip", tag: "Assets", bytes: 18_400_000 },
    ],
    verifications: [
      { tool: "Claude Code", model: "Claude Sonnet 5", date: "2026-09-20", result: "Pass" },
      { tool: "Cursor", model: "Claude Opus 5.5", date: "2026-09-18", result: "Pass" },
      { tool: "v0", date: "2026-09-12", result: "Partial", note: "Parallax depth flattened on mobile." },
    ],
    publishedAt: "2026-09-12T10:00:00.000Z",
  };
});

/** Samples, or nothing at all outside a preview. */
export function getSamples(): Asset[] {
  return SAMPLES_ENABLED ? ALL : [];
}

export function getSample(slug: string): Asset | null {
  if (!SAMPLES_ENABLED || !slug.startsWith("sample-")) return null;
  return ALL.find((sample) => sample.slug === slug) ?? null;
}
