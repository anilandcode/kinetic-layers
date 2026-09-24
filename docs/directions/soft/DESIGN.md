# Direction A — Soft gradient studio

**Preview:** `/direction/soft` (local dev and Vercel previews only; 404 in
production).

Kinetic Layers as a calm, product-like studio. The page is a warm grey canvas.
Everything sits on white rounded cards, and colour lives *inside* cards as soft
pastel gradients. Each gradient is built from that kit's own image, so the
library reads as a set of distinct objects rather than one repeated treatment.

## References

| Image | What we take |
|---|---|
| 7 — Credit Karma, "Hey, Stewart!" | Two-tone headline (black line, grey line). The big gradient card with a glass panel on it. Black pill actions. |
| 8 — Credit Karma, "Health Karma" | White tiles, each with a round icon and title top-left, a thin large figure bottom-left and a small data mark bottom-right. The warm haze behind the top of the page. |
| 9 — Superpower | Pastel gradient cards (green → orange). Dot-matrix figures. White pills on a pale grey canvas. |
| 10 — Neka | Restraint. Large light numerals, and gradient tiles sitting beside white space. |
| 3 — Synthex | Frosted surfaces and the pale, cool calm. |

## Principles

1. **Colour lives inside cards.** The canvas is neutral. Gradients belong to
   kits, never to the page chrome.
2. **Every kit brings its own colour.** Hues come from the kit's image. Sanity
   extracts the swatches, and the samples' hues were measured by hand. A
   greyscale kit gets silver, never an invented hue.
3. **Black is the action.** One black pill per view is the primary action.
   There is no accent colour.
4. **Thin figures, small labels.** Large numbers in Light 300; labels at 13px
   in medium weight.
5. **Short hero, then the product.** The library starts inside the first
   screen.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--v-canvas` | `#EDEDEB` | Page |
| `--v-surface` | `#FFFFFF` | Cards |
| `--v-surface-2` | `#F5F5F3` | Wells, counts, inputs |
| `--v-text` | `#0E0F10` | Primary text — 16.4:1 on canvas, 19.2:1 on white |
| `--v-text-2` | `#5F6267` | Secondary — 5.2:1 / 6.1:1 |
| `--v-text-3` | `#66696E` | Tertiary — 4.7:1 / 5.5:1 |
| `--v-primary` | `#0E0F10` | Black pill, with `--v-on-primary` white |
| `--v-glass` | `rgba(255,255,255,.6)` + 16–28px blur | Chips, nav, search |
| `--v-shade` | two soft, long shadows | Cards (no borders) |

**Gradient stops** come from `lib/v2/gradient.ts`. The hue is taken from the
kit; lightness is fixed at 76–86% and saturation at 55–70%. A single hue gets
two neighbours (+34° and −26°), for the green → yellow drift of the
references. On a pastel gradient, only primary text is used: it stays at 11:1
or better, while secondary text drops to about 4:1.

## Type

- **General Sans** (ITF Free Font License), self-hosted, fetched at build
  time; see [docs/FONTS.md](../../FONTS.md).
- Headline: 500, `clamp(40px → 72px)`, tracking −3.8%, line height 1.02. The
  second clause is set in `--v-text-2` at weight 400.
- Section title: 500, `clamp(24px → 36px)`.
- Figures: 300, `clamp(44px → 72px)`, tabular, tracking −5%.
- Body: 15–17px, 400. Labels: 13px, 500.
- Geist Mono is used for tiny metadata only.

## Shape

- Cards have radius 26 and 7px padding.
- The inner well has radius 18.
- Feature cards and the call-to-action use radius 30–32.
- Pills are fully round.
- Round icon buttons are 36–40px.
- No card has a border. Separation comes from the canvas contrast and the
  shadow.

## Components

- **Header:**
  - brand on the left;
  - a centred glass pill nav, with the active item as a black pill;
  - search and "Join free" (a black pill) on the right.
  - It floats on the canvas and frosts once content scrolls under it.
- **Kit card:**
  - a white card, then a gradient well;
  - the kit's page rises out of the well like a browser window, cut at the
    bottom;
  - name, then "Type · Free", then a black round ↗.
- **Feature card:** a large gradient card, a glass chip "Featured kit", the
  window, and a glass name plate at the bottom left.
- **Library toolbar:**
  - type pills with count chips (the active pill is black);
  - a filter field, an Any/Free/Premium segmented control and a sort pill.
- **Tiles:** the "How a kit works" row, as the Credit Karma tiles. The last
  tile is a gradient card.
- **Call to action:** a gradient card with the pitch and two pills, and
  dot-matrix figures (real counts only).

## Motion (GSAP 3.15: Flip, ScrollTrigger, quickTo)

- **Hero:** each headline clause rises inside its own clip. This is CSS, so it
  runs before hydration and never leaves text hidden.
- **Card glow:** a soft white highlight follows the pointer inside the well,
  using GSAP `quickTo` on `--mx` and `--my`.
- **Card hover:**
  - the window lifts 8px;
  - the ↗ turns 45°;
  - the shadow deepens;
  - **no tilt**.
- **Filtering:** cards glide to their new places with Flip, and new ones fade
  up.
- **Scroll:** cards below the fold rise as they arrive (ScrollTrigger.batch).
  Cards already on screen are never touched.
- **Reduced motion:** everything is gated by `gsap.matchMedia`, and content is
  instant.

## Do and don't

- **Do:**
  - put colour in a card;
  - keep one black action per view;
  - write figures in Light 300;
  - let the white space breathe.
- **Don't:**
  - use neon or any accent fill;
  - put gradients on the page chrome;
  - use borders on cards;
  - use more than two pill styles in a row;
  - use invented metrics;
  - use a masonry wall.
