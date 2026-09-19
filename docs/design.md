# Kinetic Layers design system

**Version:** 2.0 (dark launch)  
**Status:** implementation authority  
**Updated:** 18 September 2026

This is the single source of truth for all new Kinetic Layers interface work.
It supersedes conflicting visual rules in older design notes. Historical CSS can
remain while a route is being migrated, but it cannot define a new component.

## 1. Product truth

Kinetic Layers sells **full bundles** of original AI design work. A paid item
must identify its actual included files, prompt(s), guide, version,
compatibility and licence before purchase or download.

The product also contains attributed external visual references. A reference is
research material only: it must show its source and must never receive a price,
download action, prompt claim or ownership language.

## 2. Design principles

1. **Media first, chrome second.** Work gets space; UI supports inspection.
2. **Dark, calm, legible.** Dark is the launch experience, not a light theme
   with inverted colours.
3. **Boundaries are earned.** Use alignment, gap and tonal elevation before a
   permanent border. Controls, focused items and dense data may use one.
4. **Typography carries hierarchy.** Maison Neue is the primary sans; Maison
   Neue Mono is compact metadata only.
5. **One clear product role.** Original bundle and external reference must be
   distinguishable at a glance.
6. **Motion explains state.** It never hides content or becomes decoration.

## 3. Foundations

### 3.1 Colour and elevation

Use semantic roles, never raw colours in a component. The code token file is
`styles/kl-foundations.css`.

| Role | Use |
| --- | --- |
| `--canvas` | page background |
| `--surface-1` | quiet region or card background |
| `--surface-2` | nested selected/hovered region |
| `--surface-raised` | menus, drawers and dialogs |
| `--text-primary` | headings, values and actions |
| `--text-secondary` | body text |
| `--text-muted` | supporting metadata only |
| `--border-subtle` | data separation only |
| `--border-default` | controls and input boundaries |
| `--focus-ring` | keyboard focus only |
| `--action-primary` | the single leading action in a local context |

Elevation levels are `none`, `surface`, `raised` and `modal`. A component can
use a tonal background plus a shadow, but it must not add a border just because
it is a card. A visible focus outline is mandatory even for borderless cards.

### 3.2 Typography

The licensed webfont is Maison Neue. Use the files in `public/fonts` through
the shared font declaration; do not source fonts from another website.

| Role | Use | Rule |
| --- | --- | --- |
| Display | landing identity only | 38–72px, tight leading |
| Page title | route identity | 32–56px |
| Section title | major grouping | 24–40px |
| Card title | item name | 16–22px, never clipped without an accessible full name |
| Body | explanation | 14–16px, 1.55–1.7 leading |
| Label | short supporting label | 11–13px |
| Mono metadata | version, file, source, count | 11–13px, never body copy |

Sentence case is the default. Uppercase mono is allowed only for short,
non-essential metadata. No meaningful text may be smaller than 11px.

### 3.3 Layout and spacing

- 4px base spacing scale: `1, 2, 3, 4, 6, 8, 12, 16, 24`.
- Containers: reading 720px; form 520px; content 1200px; gallery 1440px.
- Gutters: 20px compact; 28px tablet; 40px desktop; 56px wide.
- Grid: 4 compact/mobile columns; 8 tablet; 12 desktop.
- Radius: controls 10px; cards 16px; media/dialog 24px. Pills are only for
  filters, statuses and segmented options.

Test at 320, 390, 768, 1024 and 1440px. No public route may have horizontal
overflow at those widths.

## 4. Shared interaction rules

### Buttons and forms

- Primary controls have a 44px minimum target and a readable label in every
  state.
- `hover` may alter background/opacity; it must not make text low contrast.
- `focus-visible` has a 3px focus ring with offset.
- `pressed` uses a maximum `scale(0.99)`; reduced motion removes the scale.
- Disabled controls explain unavailable actions where the reason is not clear.
- Inputs retain labels, help, error and success state in normal reading order.

### Search, filters and popovers

- Search, tabs, filters, sort and result count form one discovery system.
- Opening a filter closes any other open filter.
- Escape closes the topmost popover and restores focus to its trigger.
- Pointer interaction outside an open popover closes it without changing a
  selection.
- Filter selections are URL-backed and visibly removable.

### Cards

- Original bundle card: preview, title, type, one access/status signal and
  optional use-case. The whole card is a link.
- External reference card: explicit `Reference` label and source; no commercial
  actions.
- Card hover is tonal or a maximum 2px lift. Touch and reduced motion show the
  same required information without hover.

### Media and quick view

- Reserve the media's intrinsic aspect ratio before it loads.
- Use `contain` for inspection; use `cover` only for deliberate thumbnail crops.
- Desktop quick view has an adaptive media column and stable details column.
  Media fills available space while retaining its true ratio.
- Mobile quick view is a full-screen document, not a squeezed desktop panel.
- Escape, outside click where safe, focus trap, focus return, loading, missing
  media and reduced motion are required behaviour.

## 5. Motion

Framer Motion is the shared UI motion tool. CSS handles simple colour and
opacity feedback. Do not introduce GSAP/WebGL outside self-contained creative
previews.

| Interaction | Timing | Reduced motion |
| --- | --- | --- |
| control feedback | 140ms | colour/opacity only |
| card feedback | 180ms | no translation |
| popover | 180ms; maximum 4px movement | immediate/opacity |
| dialog/drawer | 220ms; maximum 8px movement | opacity only |
| editorial reveal | 280ms once | visible without animation |
| media preview | user intent only | stable poster plus play control |

Shared ease: `cubic-bezier(0.22, 1, 0.36, 1)`.

## 6. Accessibility and performance

The release target is WCAG 2.2 AA. Every component needs keyboard operation,
visible focus, semantic labelling, 200% reflow, sufficient contrast and a
reduced-motion equivalent. Dialogs/drawers manage focus and page scroll.

Reserve image/video dimensions. Prioritize the first meaningful preview only;
defer offscreen media and never autoplay multiple previews. Target p75 LCP
≤2.5s, INP ≤200ms and CLS ≤0.1 once field data is available.

## 7. Page blueprints

| Route | Job |
| --- | --- |
| Home | establish original-bundle value; feature real work; then label the inspiration edit separately |
| Library | discover original bundles with search, tabs, filters and honest state messages |
| Item | inspect preview, contents, compatibility, licence and access before action |
| Quick view | inspect without losing library context |
| Pricing | describe current offers and full-bundle inclusion facts |
| Account/downloads | show useful actions, entitlement, files/version and recovery |
| Inspiration (future) | research credited references with provenance, saving and notes |

## 8. Component completion checklist

Before a component ships, verify default, hover, focus-visible, pressed,
selected, disabled, loading, empty and error states where applicable; long text;
missing media; 320–1440px reflow; keyboard flow; and reduced motion.

## 9. Governance

1. Add/change a token only in `kl-foundations.css` and document its semantic
   usage here.
2. Build or update the component in the design-system route before rolling it
   into a public page.
3. Migrate one route at a time; do not mix old and new versions of the same
   component in a migrated route.
4. Do not create a new global override to fix a route-specific problem.
5. TypeSafe stays out of rendering and visual tokens. It may later assist
   catalogue taxonomy/re-ranking through server-side, reviewed typed judgments.
