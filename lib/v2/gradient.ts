import type { CSSProperties } from "react";
import type { Palette } from "@/lib/kl/types";

/**
 * A kit's gradient: the soft, heavily blurred colour field inside its card.
 *
 * The references (Credit Karma, Superpower, Neka) put colour inside cards as
 * pastel meshes on light and luminous ones on dark. Here the hues come from
 * the kit's own image — Sanity's extracted swatches for real kits, a one-off
 * hue extraction for the preview samples — so every card carries its own
 * colour and no two kits look alike by accident.
 *
 * Only the hue is taken from the kit. Lightness and saturation are set here,
 * per theme, so a muddy screenshot still yields a clean pastel and a pale one
 * still glows on black. A kit with no chromatic colour at all gets the silver
 * mesh rather than an invented hue.
 */

type HSL = [h: number, s: number, l: number];

function toHsl(hex: string): HSL | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

const css = ([h, s, l]: HSL) => `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Up to three distinct, genuinely coloured hues from a palette. */
export function kitHues(palette?: Palette | null): number[] {
  if (!palette) return [];
  const candidates = [
    ...(palette.hues ?? []),
    palette.vibrant,
    palette.muted,
    palette.lightVibrant,
    palette.dominant,
    palette.darkMuted,
  ].filter((c): c is string => Boolean(c));
  const hues: number[] = [];
  for (const c of candidates) {
    const hsl = toHsl(c);
    if (!hsl || hsl[1] < 0.16 || hsl[2] < 0.08 || hsl[2] > 0.96) continue;
    if (hues.every((h) => hueGap(h, hsl[0]) >= 18)) hues.push(hsl[0]);
    if (hues.length === 3) break;
  }
  return hues;
}

/**
 * Three stops for each theme, as CSS custom properties for Gradient.module.css.
 * One hue gets two neighbours (warmer and cooler), the way the references
 * drift green → yellow → orange across a single card.
 */
export function gradientVars(palette?: Palette | null): CSSProperties | undefined {
  const hues = kitHues(palette);
  if (!hues.length) return undefined;
  const [a, b = a + 34, c = a - 26] = hues;
  const light: HSL[] = [
    [a, 0.62, 0.76],
    [b, 0.7, 0.82],
    [c, 0.55, 0.86],
  ];
  const dark: HSL[] = [
    [a, 0.72, 0.46],
    [b, 0.78, 0.52],
    [c, 0.6, 0.3],
  ];
  const norm = (x: HSL): HSL => [((x[0] % 360) + 360) % 360, clamp(x[1], 0, 1), clamp(x[2], 0, 1)];
  return {
    "--g1": css(norm(light[0])),
    "--g2": css(norm(light[1])),
    "--g3": css(norm(light[2])),
    "--gd1": css(norm(dark[0])),
    "--gd2": css(norm(dark[1])),
    "--gd3": css(norm(dark[2])),
  } as CSSProperties;
}

/* ---------------------------------------------------------------------------
   Luminous colour for the cinematic look: the dark dashboard's glowing cards
   and the dithered fields. Same rule as above — hue from the kit, light and
   saturation set here — but pitched to glow on near-black.
   ------------------------------------------------------------------------- */

type RGB = [number, number, number];

function hslToRgb([h, s, l]: HSL): RGB {
  const hh = (((h % 360) + 360) % 360) / 360;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const t = (x: number) => {
    let v = x;
    if (v < 0) v += 1;
    if (v > 1) v -= 1;
    if (v < 1 / 6) return p + (q - p) * 6 * v;
    if (v < 1 / 2) return q;
    if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
    return p;
  };
  return [t(hh + 1 / 3), t(hh), t(hh - 1 / 3)];
}

/** Named hues for surfaces that belong to no kit: ember (warm) and cobalt (cool). */
export const HUES = { ember: 18, rose: 342, cobalt: 226, violet: 262 } as const;

/** Three dither colours (0–1 RGB): highlight, glow, shadow. */
export function ditherColors(hue: number, second?: number): [RGB, RGB, RGB] {
  const b = second ?? hue + 38;
  return [hslToRgb([hue, 0.9, 0.58]), hslToRgb([b, 0.95, 0.74]), hslToRgb([hue - 24, 0.75, 0.16])];
}

/** The first chromatic hue of a kit, or a fallback. */
export function kitHue(palette: Palette | null | undefined, fallback: number = HUES.ember): number {
  return kitHues(palette)[0] ?? fallback;
}

/** CSS stops for a luminous card: --l1 bright, --l2 mid, --l3 deep. */
export function luminousVars(hue: number, second?: number): CSSProperties {
  const b = second ?? hue + 30;
  return {
    "--l1": css([b, 0.92, 0.66]),
    "--l2": css([hue, 0.82, 0.46]),
    "--l3": css([hue - 18, 0.7, 0.12]),
  } as CSSProperties;
}
