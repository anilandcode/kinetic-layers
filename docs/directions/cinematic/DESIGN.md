# Direction B — Cinematic workbench

**Preview:** `/direction/cinematic` (local dev and Vercel previews only; 404 in
production).

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

## Components

- **Header:** a floating glass capsule inset from the viewport. Plain nav
  links; the active link gets a faint glass ground. Search, "Sign in", and a
  white pill "Join free".
- **Hero:**
  - a smoke backdrop from the featured kit, with two dark masses at the edges;
  - a centred headline and a glass badge with the ember dot;
  - a glass product window: an icon rail, a search bar, the kit running, and
    a floating glass "Kit anatomy" panel listing the parts the kit really has
    ("Not yet verified" when it is not).
- **Kit card:** the same card as Direction A. The well is the kit's picture
  as smoke over a luminous mesh, and the window floats on it.
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
  - use purple or blue glow gradients;
  - use orbs;
  - use ember fills or ember buttons;
  - use glass on flat black;
  - invent presence (no fake cursors);
  - use invented metrics.
