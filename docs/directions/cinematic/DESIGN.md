# Direction B — Cinematic workbench (chosen)

**Status:** chosen by the owner on 2026-09-24. There are two takes to compare:

- **`/`, the deck take:**
  - a short centred hero over the dither field, and the four-card deck;
  - the library;
  - **the workbench** (`components/v2/workbench/`) in the "How a kit works"
    slot — the owner placed it there;
  - the dithered call to action.
- **`/direction/cinematic`, the clean take** (previews only). This is the
  first cinematic version the owner liked, refined:
  - the kit's smoke with SVG-displaced stone at the edges and light from
    above;
  - a centred headline whose second clause fades into the smoke;
  - the glass product window: a light-catching edge, one light sweep, a rail,
    and working Preview · Anatomy · Prompt tabs;
  - two glass cards drifting over its edges with the pointer (no tilt);
  - a row of facts (real figures only);
  - calm smoke wells on the cards (`data-cine="clean"`);
  - the node canvas;
  - glass over smoke to close.
  - Code: `components/v2/cinematic/CleanHome.tsx`, `ProductWindow.tsx`.

Kinetic Layers as a dark, atmospheric workbench. It is near-black, and the
featured kit's own picture is blurred into smoke behind everything. Frosted
glass floats over that imagery, and "how a kit works" is drawn as a node
editor. It is moody, precise and tool-like.

## References

| Image | What we take |
|---|---|
| 1 — Reticla | The floating glass capsule header. The centred headline over dramatic imagery, with dark masses at the edges. The product shown in a glass window under the hero. White pill buttons, and one warm micro-accent. |
| 2 — Node editor (fox) | The dotted canvas. Glass nodes with coloured port dots. Curved wires. The bottom legend chip. |
| 5 — Node editor (orange figure) | The warm, low-lit glass. Node fields as dark inset rows. |
| 4 — Dark gradient dashboard | Luminous gradient cards on black, with the same cards as the soft direction lit from within. |

## Principles

1. **Imagery is the atmosphere.** Backdrops are the kits' own pictures,
   blurred, darkened and vignetted. Nothing is stock and nothing is invented.
2. **Glass over imagery, never glass over nothing.** Frosted panels only sit
   where there is something behind them to frost.
3. **White is the action.** The primary action is a white pill; secondary
   actions are glass pills.
4. **One ember.** A single warm accent (`#E8834A`) marks live and current
   things: the badge dot, section kickers, node ports and the wire pulse.
   Never a fill, never a button.
5. **Short hero, then the product.** The hero is a centred line, two pills
   and the product under glass. The library follows immediately.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--v-canvas` | `#0A0A0B` | Page |
| `--v-surface` | `#141416` | Cards (a vertical gradient `#19191C` → `#121214`) |
| `--v-surface-2` / `-3` | `#1B1B1E` / `#242428` | Counts, inputs, pressed state |
| `--v-text` | `#F2F2F0` | Primary — 17.7:1 on canvas, 16.4:1 on cards |
| `--v-text-2` | `#A1A1A6` | Secondary — 7.7:1 / 7.2:1 |
| `--v-text-3` | `#8A8A90` | Tertiary — 5.8:1 / 5.4:1 |
| `--v-primary` | `#F2F2F0` | White pill, with `--v-on-primary` near-black |
| `--v-ember` | `#E8834A` | The one accent |
| `--v-glass` | `rgba(255,255,255,.06)` + 20–30px blur | Nodes, chips, capsule |
| `--v-glass-edge` | `rgba(255,255,255,.12)` | Glass hairline |

**Gradient stops** (from `lib/v2/gradient.ts`) are luminous here: lightness
30–52% and saturation 60–78%, behind a blurred copy of the kit's image. That
copy uses blur 34px, saturation 1.25 and brightness 0.62, with a vignette.

## Type

- **General Sans**, as in Direction A.
- The headline is centred, weight 500, `clamp(38px → 64px)`, tracking −3.5%,
  balanced.
- Section kickers are ember at 13px/500, above white titles.
- Node fields use Geist Mono at 12px, in dark inset rows.

## Shape

- The capsule header has radius 20.
- Nodes are radius 18. The canvas and the call-to-action are radius 28–32.
- Cards are radius 26 with a 1px inner hairline instead of a shadow edge.

## Signature effects

| Effect | Where | How |
|---|---|---|
| **Dither field** | Behind the hero deck; the call to action | `components/v2/fx/DitherField.tsx` — a WebGL shader: domain-warped noise in three colours, cut by an 8×8 Bayer matrix into round dots. The dots follow the pointer, pause off-screen, and draw one still frame under reduced motion. |
| **Luminous dithered wells** | Every kit card; the deck's rose and cobalt cards | `Gradient` in the cinematic look: the kit's hue lit from within (`luminousVars`), its picture faint underneath, and a halftone dot screen that shows in the shadow. |
| **Fluted glass** | The featured-kit deck card | `components/v2/fx/Fluted.tsx` — the image in vertical ribs, each one magnified about its centre with a lit and a shaded edge. |
| **Dotted canvas and spotlight** | Behind the whole page | `components/v2/fx/Spotlight.tsx` — a 22px dot grid; dots within 260px of the pointer warm up. |
| **Dot data** | Deck and cards | `DotGrid` (one dot per published kit), `DotNumber` (5×7 dot figures), and six anatomy dots on every card (one per part the kit really has). |
| **Light-catching edges** | Kit cards and deck cards | A 1px masked border whose highlight follows the pointer. |
| **Magnetic actions** | The primary pills | `components/v2/fx/Magnetic.tsx` — GSAP `quickTo`, with an elastic release. |

## The hero deck (from the dark dashboard reference)

Four cards, each saying something true:

1. **The library.** Rose, luminous. One dot per published kit: free kits are
   solid, premium kits are ringed. Shows free out of total.
2. **The featured kit, behind fluted glass.** A glass name plate, and the
   parts the kit really has ("Published" / "Not yet").
3. **In your editor.** A smoky card with the MCP orbit: Claude Code, Cursor,
   any MCP client (the clients the MCP page names).
4. **Early access.** Cobalt, with concentric rings. Price today: $0.

## Components

- **Header:** a floating glass capsule inset from the viewport. Plain nav
  links; the active link gets a faint glass ground. Search, "Sign in", and a
  white pill "Join free".
- **Hero:**
  - the dither field (the featured kit's hue) glowing behind the deck and
    faded out under the words;
  - a centred headline with a dimmed second clause;
  - a glass badge with the ember dot;
  - a magnetic white pill and a glass pill;
  - the four-card deck (above).
- **Kit card:** the same card as Direction A. In this look:
  - the well is the kit's hue lit from within, with a halftone dither;
  - the edge catches the light under the pointer;
  - six ember anatomy dots show which parts the kit has.
- **Node canvas:**
  - a dotted dark canvas with six glass nodes (Reference → Design spec →
    Reconstruction prompt → Verified output; Design spec → Adaptation prompt
    → Your brand);
  - coloured ports (sand, sage, sky, ember), bezier wires measured from the
    nodes, and a legend chip;
  - field names only, with no values, because it describes the shape of every
    kit rather than one kit.
- **Call to action:** smoke card, a glass panel with the pitch and pills, and
  dot-matrix figures in ember (real counts only).

## Motion (GSAP 3.15)

- **Hero:** the headline clauses rise, and the product window lifts 28px on
  load (CSS, so it works before hydration).
- **Cards:** the same glow, lift, ↗ turn and Flip filtering as Direction A.
- **Node canvas:**
  - the wires draw themselves in when the canvas scrolls into view
    (ScrollTrigger, dash offset);
  - then a small warm pulse runs along each wire forever (a linear dash-offset
    loop).
- **Reduced motion:** there are no pulses, no draw-in, and content is instant.

## Do and don't

- **Do:**
  - let the imagery carry the mood;
  - keep glass over imagery;
  - use the ember as a single dot or line.
- **Don't:**
  - put colour on the page chrome (rose and cobalt live only inside cards;
    the dither field takes the kit's own hue);
  - use orbs;
  - use ember fills or ember buttons;
  - use glass on flat black;
  - invent presence (no fake cursors);
  - use invented metrics.
