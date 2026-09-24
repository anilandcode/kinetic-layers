# Kinetic Layers — design direction v2 (canvas brief)

Status: **brief for the design canvas, not yet approved.** Once the canvas is
approved, this replaces §6 (visual language) and the motion values in §10 of
[DESIGN-REBUILD-SPEC.md](DESIGN-REBUILD-SPEC.md). Everything else in that spec
stands: information architecture, original kits vs inspiration, honest content
states, WCAG 2.2 AA, performance budgets, and no new global override stylesheet.

Written 2026-09-24. Owner's decisions: design first; light and dark each take one
strand of the references; the kit page's signature is a node graph; Maison Neue is
replaced by a free commercial typeface.

## Why the current design reads as AI slop

Nothing on it is ownable:

- **One layout everywhere.** Every page is a centred headline, a card grid, tiny
  mono labels and pills. Base text is 13px; some labels are 9–10px.
- **A template palette.** Near-black, white and one blue highlight is the default
  look of every Next.js template — exactly what Kinetic Layers sells an escape
  from.
- **The wrong work up front.** The homepage leads with 20 competitor references
  beside 2 real kits.

## The direction

**Light — the soft studio.** Pale cool-grey canvas, frosted white panels, soft
aura colour fields, very large light numerals.
References: Synthex, superpower, Neka, the two credit dashboards.

**Dark — the cinematic workbench.** Near-black canvas, glass panels over
atmospheric imagery, node graphs.
References: Reticla and the two node editors.

**Both modes share the same components and layout.** Only the atmosphere
changes.

## Five qualities to take from the references

| Quality | Rule for Kinetic Layers |
|---|---|
| **A signature material** | Aura fields and frosted panels, used only where they carry meaning: a kit's identity, one hero figure, dialogs and chrome. Never on every card. |
| **Data drawn as craft** | Dot-matrix numerals and dot sparklines for real figures only: version, tools tested, file count, downloads. The number is also present as text. |
| **Product in context** | Kits are shown running — in a device, over atmosphere, in the graph — not as flat thumbnails in a grid. |
| **Scale contrast** | Very large light numerals and display type against small, *legible* labels. Labels no smaller than 12px. |
| **Human traces** | Named cursors and authorship where they're true, for example who made a kit and when it was last verified. Never fake presence. |

### Banned — the things that read as slop

- a generic purple/blue glow gradient;
- a glowing orb;
- emoji as icons;
- stock 3D blobs;
- "Trusted by" logos you haven't earned;
- invented metrics;
- uniform masonry walls as the homepage;
- tiny all-caps mono text as the main voice;
- a pill on every element;
- an identical card treatment for everything.

## The signature: the kit graph

Every kit page shows how the kit is made and proven, as a live, glassy node
graph:

```
[Reference] ──▶ [Design spec] ──▶ [Reconstruction prompt] ──▶ [Output]
                      └──────────▶ [Adaptation prompt] ──────▶ [Your brand]
   tested with: <tool> · <model> · <date>      version <x.y>
```

- **Each node exists only if the kit has that part.** `verdro` today has a
  reference image and nothing else; its graph is one node plus an honest *Not yet
  verified* state.
- **Verification figures come only from real test records** — tool, model, date,
  result. No kit has any today, so the canvas shows a complete kit **labelled
  "Illustrative — not a real kit"**.
- **Nodes open panels** in the same material: the prompt, the spec, the file
  manifest.
- **Mobile** stacks the graph vertically, with the connectors as a spine.
- **Data source (Phase 1):** the kit release fields proposed in the master plan —
  version, release status, tested tools with dates, reconstruction and adaptation
  prompts, and spec.

## Starting values — to be tuned on the canvas

**Colour.** Aura comes from each kit's own media via Sanity's palette metadata.
Beyond that, one small signal accent for focus, selection and the primary action.
The canvas compares two candidates.

| Token | Light — soft studio | Dark — workbench |
|---|---|---|
| canvas | `#E9EBEE` | `#0B0C0E` |
| surface (frosted) | `rgba(255,255,255,.64)` + blur 24px | `rgba(255,255,255,.06)` + blur 24px |
| surface solid | `#F6F7F8` | `#141518` |
| border | `rgba(17,19,22,.08)` | `rgba(255,255,255,.10)` |
| text primary | `#111316` | `#ECEDEF` |
| text secondary | `#5B6068` | `#9A9EA6` |
| accent candidate A | chartreuse `#C9EE4F` (signal dots, as in Neka and superpower) | same |
| accent candidate B | ember `#FF6B35` (as in Reticla and the video editor) | same |

Text on frosted surfaces must reach AA contrast in both modes. Measure it rather
than assume it.

**Type.** Compare **Geist**, **General Sans** and **Satoshi** on the same
headline, body and label. All three are free for commercial use.

- Sizes follow spec §6.1.
- Body 16px; labels at least 12px.
- Mono is for metadata only.
- Dot-matrix numerals are drawn as SVG, so no font is needed.

**Shape.** Radius 10 (controls) / 16 (panels) / 24 (cards) / 32 (media stages and
dialogs), plus full pills for navigation and filters only.

**Motion.** As spec §10: Framer Motion, 120–320ms, curve `[0.22,1,0.36,1]`,
dialogs move at most 8px, no staggered walls, and full reduced-motion support.

## Screens for the canvas

| Screen | Modes | Content |
|---|---|---|
| Foundations | both | Tokens, the type comparison, dot-matrix numerals, dot sparkline, aura, glass, radius and spacing, buttons, inputs, pills, tags |
| Home | both | An outcome headline (e.g. "Original websites and motion kits you can recreate, adapt and ship"), one kit shown running, how a kit works (the graph, simplified), free starters, footer. **No reference wall** |
| Kit page | both | Media stage, **the graph**, access state, file manifest, version, licence. Show `verdro` as the real state and one illustrative complete kit |
| Kit quick view | both | Opened over a blurred Library: media, condensed graph, primary action, "Open full kit" |
| Library | both | Type row, Category / Sort / Pricing controls, kit cards carrying their own aura, count ("2 kits") |
| Pricing | light | Early access: free now. Founding Membership: a future, non-binding $24/month **proposal** with an interest list, never a checkout. Allowances: free 5 prompts and 3 downloads a day; premium 50 and 30 |
| Account dashboard | dark | Dot-matrix stats (downloaded, this month, saved, plan, today's allowance), recent downloads, saved |
| Join / sign in | light | Email and password plus magic link. No Google or GitHub buttons: both providers are off |
| Mobile 390px | dark | Home, the navigation drawer, and the kit page with the graph stacked vertically |

## Real content to use

| Kit | Facts |
|---|---|
| **verdro** | Template · Free · image 2400×1800 · palette dominant `#59851c`, vibrant `#64a422`, muted `#599c94`, dark muted `#4a4829`, light vibrant `#e5f8f7` · no tagline, tags, files or prompt yet · image: `https://cdn.sanity.io/images/8vxxthrc/production/0568c8ae593e491c87e7825469512f215107fb27-2400x1800.png` |
| **"Asset"** | Video · Premium · 16 MB clip, no image, so no palette · no tagline, tags, files or prompt. The name is the default and should be renamed in the Studio before it appears anywhere |

- **Navigation:** Library, Pricing. Search, Theme and Account are utilities.
  Contact, Docs, MCP, Changelog, License, Privacy and Terms go in the footer.
- **The 15 seeded assets are placeholders** and must not appear as real kits.

## Canvas constraints

- **Fonts.** A published canvas can load fonts from Google Fonts only. Geist is
  there; General Sans and Satoshi are on fontshare.com and would have to be
  embedded, which means downloading them first. Ask the owner before
  downloading.
- **Imagery.** Use the owner's own kit media and abstract SVG/CSS atmosphere.
  Nothing taken from the reference shots or from competitors.

## What happens after approval

1. Record the approved decisions here and mark this file approved. Replace spec
   §6 and §10.
2. Phase 1 foundations:
   - one token source in `styles/kl-foundations.css`;
   - the chosen typeface through `next/font`;
   - remove the Maison Neue files;
   - build the `Aura`, `Glass`, `DotNumber`, `DotSpark` and `NodeGraph`
     primitives;
   - add the kit release fields in Sanity.
3. Then the shell, the screens (signature first), and removal of the dead
   stylesheets and GSAP.
