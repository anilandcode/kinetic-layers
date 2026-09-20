# Kinetic Layers — Product Design System

**Version:** 3.0 · rebuild authority

**Status:** approved implementation specification

**Updated:** 20 September 2026
**Applies to:** every new or rebuilt Kinetic Layers route and component

## 0. Purpose and reference boundary

Kinetic Layers is a dark-first library for **original AI design bundles**. It
helps people discover, inspect, buy, download, save and reuse practical creative
work. A separate, attributed reference library helps research patterns but is not
for sale and must never imply ownership or reuse rights.

This document is inspired by a public product-pattern audit of Mobbin, whose
product model combines broad discovery, pattern taxonomy, flows, media inspection,
collections, notes and progressive access. Mobbin publicly describes discovery
across screens, UI elements, flows and text in screenshots; flows can be viewed
as video/prototypes; people can save references and leave notes. [Mobbin home](https://mobbin.com/)
and [Mobbin changelog](https://mobbin.com/changelog) are the research sources.

This is **not** a Mobbin clone. Do not copy its source, protected imagery, copy,
font files, brand elements, layout measurements or authentication-gated product
behaviour. Use only Kinetic Layers branding and the owner-supplied, licensed
Maison Neue font files.

## 1. Product rules

1. **Two content classes are never visually or commercially ambiguous.**
   - `original_bundle`: Kinetic Layers work, with exact contents, licence,
     compatibility, price/access and download state.
   - `reference`: third-party visual research, with source, attribution and
     "reference only" status; no price, download or prompt-ownership language.
2. **The product is a library, not a gallery.** Discovery, context, saving and
   retrieval are first-class tasks.
3. **A paid item is a complete bundle.** The detail page names its real files,
   prompts, implementation notes and compatibility before purchase.
4. **Work is the visual identity.** Media gets the large visual area. Application
   chrome stays calm and only appears when it helps a decision.
5. **Dark-only at launch.** Tokens remain semantic so a future light theme can
   be introduced without rewriting components.

## 2. Design principles

| Principle | Required design decision |
| --- | --- |
| Search before browsing | Search and filter are persistent, fast, understandable and reversible. |
| Inspect before acting | Detail and quick view show large truthful media and exact bundle facts before a commercial action. |
| One action at a time | Each local surface has one high-contrast primary action; supporting actions are quiet. |
| Media leads, UI frames | Preview proportions are intrinsic; never put a small image inside a large empty, fixed-ratio frame. |
| Structure before decoration | Alignment, spacing, type and tonal surfaces create hierarchy before borders, gradients or shadows. |
| Status is explicit | Original, reference, saved, premium, unavailable, loading and error states are visible in text, not colour alone. |
| Motion proves response | Motion confirms a state change; it never becomes a visual trick or blocks access to content. |

## 3. System architecture

The codebase must converge on this structure. A route may not mix a legacy and
new version of the same component.

```text
Foundations → primitives → patterns → route templates → page instances

Foundations: color, type, spacing, elevation, motion, breakpoints
Primitives: button, icon-button, input, badge, divider, media frame
Patterns: header, search, filter bar, card, dialog, detail panel, empty state
Templates: discovery, item detail, account, marketing, reference research
Pages: Home, Library, Item, Pricing, Account, Inspiration
```

### 3.1 Ownership

| Layer | Canonical location | Rule |
| --- | --- | --- |
| Tokens | `styles/kl-foundations.css` | Semantic tokens only; no route selectors. |
| Primitives/patterns | `components/kl/` | Own markup, accessibility, states and testable interaction. |
| Route layout | `app/**/page.tsx` | Assemble patterns; no repeated visual inline styles. |
| Visual reference | `/design-system` and this document | A state is approved here before public migration. |
| Legacy code | `components/legacy/`, old route CSS | Freeze; replace, do not extend. |

## 4. Foundations

### 4.1 Colour tokens

The palette is near-black charcoal, not pure black. Tonal separation is the
default grouping mechanism; borders are reserved for controls, dense data and
keyboard focus.

```css
:root[data-theme="dark"] {
  /* canvas and surfaces */
  --kl-canvas: #101114;
  --kl-surface-1: #17181c;
  --kl-surface-2: #202126;
  --kl-surface-raised: #282a30;
  --kl-surface-inverse: #f3f1ed;
  --kl-overlay: rgb(5 6 8 / 78%);

  /* content */
  --kl-text-primary: #f5f4f1;
  --kl-text-secondary: #b8b8b7;
  --kl-text-muted: #85868a;
  --kl-text-inverse: #17181a;

  /* boundaries and action */
  --kl-border-subtle: rgb(255 255 255 / 9%);
  --kl-border-default: rgb(255 255 255 / 16%);
  --kl-border-strong: rgb(255 255 255 / 28%);
  --kl-action-primary: #f3f1ed;
  --kl-action-primary-hover: #ffffff;
  --kl-action-secondary-hover: rgb(255 255 255 / 8%);
  --kl-focus-ring: #6abaff;

  /* status */
  --kl-status-positive: #65c69a;
  --kl-status-warning: #e7b96e;
  --kl-status-danger: #ed8585;
  --kl-status-info: #6abaff;
}
```

Implementation aliases may keep existing names (`--canvas`, `--surface-1`,
etc.), but must resolve to the semantic roles above. A component must not use a
raw hex value unless it renders user-provided media.

**Contrast requirements:** normal text 4.5:1 minimum; large text 3:1 minimum;
focus indicator 3:1 against adjacent colours; disabled appearance is never the
only explanation of unavailable access.

### 4.2 Typography

Use the supplied licensed Maison Neue files only. The sans does the product work;
Maison Neue Mono is metadata, counts, filters, key/value facts and short system
labels only. It must never become paragraph copy.

```css
--kl-font-ui: "Maison Neue", ui-sans-serif, system-ui, sans-serif;
--kl-font-mono: "Maison Neue Mono", ui-monospace, SFMono-Regular, monospace;
```

| Token | Desktop | Compact | Use |
| --- | ---: | ---: | --- |
| `display` | 64/1.0/-0.045em | 42/1.04/-0.04em | marketing identity only |
| `page-title` | 44/1.06/-0.035em | 32/1.1/-0.03em | major route title |
| `section-title` | 30/1.15/-0.025em | 24/1.18/-0.02em | section heading |
| `card-title` | 16/1.3/-0.012em | same | asset, collection and panel titles |
| `body` | 15/1.55/0 | 15/1.55/0 | explanatory text |
| `body-small` | 13/1.5/0 | same | support text |
| `label` | 12/1.25/0 | same | controls and compact UI |
| `meta` | 11/1.3/0.02em | same | mono facts; optional uppercase |

Rules:

- Sentence case by default. Uppercase is allowed only for short mono metadata.
- Do not use a display size inside an app workspace.
- No meaningful text under 11px.
- Line length: 45–75 characters for reading copy; never use text size to fix a
  layout problem.

### 4.3 Spacing, layout and shape

```css
--kl-space-1: 4px;  --kl-space-2: 8px;  --kl-space-3: 12px;
--kl-space-4: 16px; --kl-space-5: 20px; --kl-space-6: 24px;
--kl-space-8: 32px; --kl-space-10: 40px; --kl-space-12: 48px;
--kl-space-16: 64px; --kl-space-20: 80px; --kl-space-24: 96px;

--kl-radius-control: 10px;
--kl-radius-card: 16px;
--kl-radius-media: 20px;
--kl-radius-dialog: 24px;
--kl-radius-pill: 999px;
```

| Token | Value | Use |
| --- | --- | --- |
| `reading` | 720px | articles, licences, long descriptions |
| `form` | 520px | authentication, profile, billing forms |
| `content` | 1240px | normal product pages |
| `gallery` | 1600px | library and media-forward discovery |
| `gutter` | 16 / 24 / 32 / 48px | 320 / 768 / 1024 / 1440px+ |

Use 4 columns at compact, 8 at tablet and 12 at desktop. Test at 320, 390, 768,
1024, 1280 and 1440px. There must be no horizontal overflow or hover-only
information at any size.

### 4.4 Elevation and borders

| Level | Treatment | Use |
| --- | --- | --- |
| `flat` | canvas, no shadow | page regions |
| `tonal` | surface fill, no border | cards, rails, quiet groupings |
| `raised` | raised fill + 1 soft shadow | popovers and anchored controls |
| `modal` | raised fill + dialog shadow + overlay | dialogs, drawers, lightbox |

Use a border only for input boundaries, segmented-control separation, list rows,
dense facts, selected state or focus. A card should not have both a hard border
and a heavy shadow.

## 5. Primitive components

Every primitive must show: default, hover, focus-visible, active, disabled,
loading and long-label behaviour where relevant.

| Primitive | Contract |
| --- | --- |
| Button | 44px target minimum; one visual primary per local area; text never loses contrast on hover. |
| Icon button | Accessible name; 40–44px target; tooltip only supplements the label. |
| Text input | Persistent visible label; help/error/status text follows input in DOM order. |
| Search | Debounced only when needed; current query survives result-mode changes; clear action is visible. |
| Badge | Status/metadata only, not a button disguised as a pill. |
| Chip/filter | Selected state uses text + fill/indicator; removable selection has an accessible remove label. |
| Divider | One `border-subtle` line; no decorative double rules. |
| Media frame | Reserves intrinsic ratio; `contain` for inspection, `cover` only for intentional card crops. |
| Skeleton | Mirrors final geometry; no generic large grey blocks where layout is known. |

## 6. Product patterns

### 6.1 Application shell and navigation

- Desktop: compact fixed/sticky top bar, brand, primary routes, search trigger,
  account/action group. It is one quiet surface, not a marketing header.
- Mobile: menu closes on link activation, outside press and Escape. Never leave
  multiple disclosures open accidentally.
- Current route is textually and visually marked; icons are supplementary.
- The page title belongs in page content, not in a large navigation bar.

### 6.2 Discovery system

The public audit shows Mobbin treats discovery as a taxonomy plus multiple search
modes (screens, elements, flows and text). Kinetic Layers adopts that principle
with its own content model:

| Mode | Current launch purpose | Future extension |
| --- | --- | --- |
| Bundles | original items by category, use case, tool, format, access | semantic/AI search |
| References | attributed research by source, pattern, platform | visual search |
| Collections | user-saved bundles/references | team collections and notes |
| Flows | connected examples within a bundle | interactive prototype/video sequence |

- One search input and one URL-backed filter model.
- Category, format, access and sort use a single exclusive-popover contract:
  opening one closes the rest; Escape/outside press closes it and restores focus.
- Filters show applied count, are removable individually, and preserve the query.
- Results show an honest count plus `loading`, `empty`, `no match` and `error`
  states with useful recovery action.
- Desktop result grids use media-led cards; mobile remains a normal one-column
  scroll with no forced masonry gaps.

### 6.3 Cards

Cards represent navigation to content; they do not begin a multi-step operation.
This follows the public Mobbin glossary distinction between cards, action tiles
and dialogs. [Card guidance](https://mobbin.com/glossary/card)

**Original bundle card**

1. true-ratio thumbnail;
2. optional compact `Original bundle` status;
3. title and concise type/use case;
4. access signal (`Free`, `Premium`, `Owned`) as text;
5. whole card links to the item.

**Reference card**

1. true-ratio thumbnail;
2. `Reference` label and named source;
3. no price/download/prompt language;
4. whole card opens the reference inspection view.

Use tonal hover or maximum 2px translation. On touch/reduced motion, required
metadata remains visible without hover. Do not put a repeated button in every
library card.

### 6.4 Item detail and quick view

The quick view must be a real inspection workspace:

- Overlay closes with Escape and the explicit close button; focus stays within
  while open and returns to its trigger on close.
- Desktop grid: `minmax(0, media) 320–380px facts panel`; width comes from
  actual media ratio and viewport height, never a fixed media box.
- The media stage uses the item’s intrinsic aspect ratio. Blank bands may exist
  only inside `contain` media, never because the stage assumes a wrong ratio.
- Panel order: type/status → name → key facts → description → valid actions.
- Mobile becomes a full-height document: media first, panel below, no squeezed
  side panel.
- Reference panels end with source attribution and a source link. Original
  bundle panels show actual availability and bundle contents.

### 6.5 Collections and notes

Saving is a core library action, not an account afterthought:

- Save/unsave must be immediate with an accessible status update.
- A saved item can enter one or more collections.
- Collection list view shows title, item count, owner/privacy state and most
  recent activity.
- Notes are attached to a saved item and explain *why it was saved*.
- Launch can keep collections personal; shared collections/comments are later
  expansion, not fake controls.

### 6.6 Pricing and account

Mobbin’s public pricing separates individual, team and enterprise plans and
ties each feature to an access level. Kinetic Layers must use the same clarity
principle, not its copy or pricing. [Pricing structure](https://mobbin.com/pricing)

- Pricing compares actual bundle/access benefits; do not promise source files
  or future features that are not published.
- Account shows entitlement, downloads, saved items, profile and keys as a
  workspace—not marketing cards.
- Download history uses a list: bundle name, file, version, date, recovery.
- Empty account states point to a valid next step.

## 7. Motion and feedback

Use Framer Motion for compositional UI transitions and CSS for small property
changes. Do not add GSAP/WebGL to product chrome.

| Event | Duration | Movement | Reduced motion |
| --- | ---: | ---: | --- |
| Button/filter feedback | 120–160ms | 0–1px | colour/opacity only |
| Card feedback | 160–200ms | max 2px | no translation |
| Popover | 160–200ms | max 4px | opacity only |
| Dialog/drawer | 200–240ms | max 8px | opacity only |
| Page/section reveal | 240–320ms, once | max 12px | visible immediately |
| Video preview | only after user intent | none required | stable poster + play |

Shared easing: `cubic-bezier(0.22, 1, 0.36, 1)`. Never autoplay a grid of
media. Never delay essential content behind an animation.

## 8. Accessibility, responsive and performance gates

Release target: WCAG 2.2 AA.

- Semantics first: links navigate; buttons act; native `dialog`, `details`,
  `search`, headings, lists and form controls are used when appropriate.
- Keyboard: every interactive element is reachable; popovers/dialogs obey
  Escape and focus restoration; no focus is lost behind an overlay.
- Reflow: 200% zoom works; targets are 44×44px minimum on touch interfaces.
- Preferences: `prefers-reduced-motion`, colour contrast and visible focus are
  designed states, not afterthoughts.
- Images/videos reserve dimensions. Only the LCP media receives priority;
  off-screen media is lazy-loaded and poster-first.
- Field targets: p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.

## 9. Route blueprints and build order

| Phase | Route/template | Required outcome |
| --- | --- | --- |
| 1 | Foundations + app shell | one token file, one type system, no legacy shell styles |
| 2 | Library discovery | search, filter rail, media-led original/reference cards, true empty states |
| 3 | Item + quick view | intrinsic media, truthful facts/actions, consistent modal behavior |
| 4 | Home | calm value proposition, featured original bundles, reference edit separated |
| 5 | Pricing + account | clear entitlement, bundle value, download/saved workflows |
| 6 | Collections + notes | retrieval and research loop |
| 7 | TypeSafe pilot | reviewed server-side classification/ranking only; never visual rendering |

## 10. Migration rules

1. Freeze `components/legacy` and legacy global overrides. No new features or
   fixes land there except critical production recovery.
2. Replace a complete route or pattern, then remove its old CSS/imports. Do not
   stack a third visual layer on top of it.
3. A rebuilt route may use only foundation tokens and `components/kl` patterns.
4. Build every new pattern on `/design-system` with all required states before
   adding it to a route.
5. Validate at 320, 390, 768, 1024, 1280 and 1440px; test mouse, keyboard,
   touch and reduced motion.
6. Before merge, review a Vercel preview with real catalogue media and complete
   the checklist below.

## 11. Definition of done

For every rebuilt route:

- [ ] No inline visual styles or legacy component import.
- [ ] Uses only semantic tokens and documented components.
- [ ] Supports default, hover, focus, active, disabled, loading, empty and
      error states where applicable.
- [ ] Original bundles and references are impossible to confuse.
- [ ] Media uses intrinsic ratio and is visually dominant where inspection is
      the main task.
- [ ] All menus and dialogs close predictably and return focus.
- [ ] Touch, keyboard, reduced motion, long content and missing media work.
- [ ] Production build passes and preview has been reviewed with real data.

## 12. Governance

- Token changes require an entry in this document and a specimen update.
- New components require an explicit purpose, accessibility contract and state
  matrix before implementation.
- Do not reproduce Mobbin’s visual assets, implementation or exact typography.
- `docs/design.md` is the design authority. Older audit/spec files are context
  only and must not override it.
