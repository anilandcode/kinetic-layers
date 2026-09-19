# Kinetic Layers design rebuild specification

Version 1.0 · 18 September 2026 · Status: approved planning baseline

This is the historical rebuild baseline. The current visual and experience
authority is [`design.md`](design.md). This document remains useful for its
route inventory and migration context, but where its theme, font, component or
token rules conflict with `design.md`, `design.md` wins.

The execution order and acceptance checklist live in
[DESIGN-REBUILD-BACKLOG.md](DESIGN-REBUILD-BACKLOG.md).

## 1. Product experience to design

Kinetic Layers helps a designer or developer discover a distinctive design,
understand what it contains, adapt it, and ship it. The interface must support
two clearly separated content domains:

1. **Original kits** — Kinetic Layers products with truthful previews,
   manifests, instructions, prompts, source files when included, version and
   licence information.
2. **Inspiration** — attributed external references used for research. A
   reference is never counted or presented as a downloadable product.

Original kits are the primary business. Inspiration becomes a Mobbin-like
research product later, after its provenance, taxonomy, search and collection
workflows are ready. The current mixed homepage wall is a temporary state, not
the target information architecture.

The core journey is:

> Discover → compare → inspect → understand access → use → save or return → get help

Every launch page must support a real step in that journey. Pages that only
repeat marketing language or decorate an unavailable feature should not ship.

## 2. Design diagnosis

The current site contains useful pieces, but it is not one coherent system.
The rebuild must resolve the following structural issues before adding more
visual effects.

### 2.1 Competing design layers

`app/globals.css` currently imports seven global layers: legacy, Kinetic
tokens, Kinetic components, Bench, item overlay, header and page overrides.
The imported files total more than 3,600 lines. `kl-tokens.css` and `bench.css`
both redefine semantic colors, typography and surfaces. Later selectors often
win because of source order rather than a deliberate component contract.

The target system has:

- one semantic token source;
- one shared component layer;
- one page-layout layer;
- isolated asset-demo styles that cannot restyle the platform shell;
- no new global override stylesheet.

Legacy styles may remain temporarily for unmigrated routes, but each migrated
component stops depending on them. Removal happens only after route-level
visual regression checks.

### 2.2 Weak product hierarchy

The homepage currently mixes two original products, twenty third-party
references and promotional cards in one masonry wall. References visually
outnumber the product and make the business proposition ambiguous.

The rebuilt homepage leads with one original result, explains what a kit
contains, shows a small curated original collection, then presents inspiration
as a separately labelled editorial section. Promotions never interrupt the
first product results.

### 2.3 Inconsistent page construction

Public pages use shared classes, while authentication and account screens rely
heavily on inline styles and legacy components. Headers, panels, form fields,
empty states and responsive behavior therefore vary by route.

All routes must use the same page shell, container widths, typography roles,
controls, surface rules and system states. Authentication can have a focused
layout without becoming a second brand.

### 2.4 Preview and media problems

Large preview stages can dominate item pages before the visitor sees the title
or access state. Video-only items depend on their playback state to feel
complete. External references and original kits share visual treatment more
closely than their legal and product roles justify.

Media must always have a stable aspect box, a deliberate fit mode, a useful
poster or painted fallback, visible context, and a motion-safe path. Broken or
missing media is a designed state, not an empty black rectangle.

### 2.5 Incomplete responsive navigation

The platform needs a designed mobile navigation model rather than a reduced
desktop header. Search, Library, Pricing, Contact, account access and theme
controls must remain reachable. At 320, 375, 390, 430 and 768 pixels there must
be no global horizontal overflow.

### 2.6 Small, repetitive UI

Many labels use tiny mono text, many controls use the same pill shape, and
multiple badges compete with item titles. The product should feel precise, not
miniaturized.

Use mono typography for compact metadata only. Use one access/status badge per
context. Titles, product purpose and the primary action must dominate labels,
counts and decoration.

## 3. Reference principles

The design direction combines useful principles from the reviewed products
without copying their layouts.

| Reference | Adopt | Do not copy |
| --- | --- | --- |
| Bencho | Quiet shell, generous media, restrained controls, content as visual identity | A small-gallery architecture that cannot support accounts, commerce or research |
| Mobbin | Scalable navigation, search/filter hierarchy, saved research workflows, clear metadata | Its ingestion scale, dense taxonomy or mobile-app focus at launch |
| MotionSites | Motion-led previews and a short path from inspiration to prompt or kit | A wall where reference volume obscures original ownership |
| GetLayers | Clear contents, editable layers, setup information and source expectations | Unsupported fidelity claims across every AI tool |
| HorizonX | Premium presentation and explicit asset/source formats | Broad catalogue expansion before production capacity exists |
| Temlis | Outcome- and industry-led discovery with complete-site context | Presenting a prompt-only entry as a complete editable website |

The resulting character is **an editorial design studio with a dependable
product library underneath it**: calm chrome, large credible work, strong
information hierarchy, and motion used to explain behavior.

## 4. Information architecture

### 4.1 Launch navigation

Desktop primary navigation:

- Library
- Collections, only after the current production gate is lifted
- Learn, once useful guidance exists
- Pricing

Desktop utility navigation:

- Search
- Theme
- Sign in or Account

Contact belongs in the footer and contextual support areas. It may stay in the
header until Learn or Collections is ready, but the header must not grow beyond
four primary destinations.

Mobile navigation:

- brand;
- search action;
- menu action;
- full destination list inside a drawer;
- account and theme controls inside the drawer;
- visible close control, Escape handling, focus trap and focus return.

### 4.2 Future navigation

Add Inspiration only when it has a separate route, source/provenance model and
search experience. Add workspace switching only when shared boards exist. Do
not use “Collections” for both editorial product groups and personal saved
folders; call the latter Boards.

## 5. Layout system

### 5.1 Containers and grid

Use four shared container roles:

| Role | Maximum width | Use |
| --- | ---: | --- |
| Reading | 720px | Legal, documentation, long descriptions |
| Form | 520px | Auth, profile and compact settings |
| Content | 1,200px | Pricing, account and editorial sections |
| Gallery | 1,440px | Homepage work, Library and large previews |

Recommended gutters: 20px mobile, 28px tablet, 40px desktop and 56px on very
wide screens. Use a 12-column desktop grid, 8-column tablet grid and 4-column
mobile grid. Components align to the grid; they do not invent local page
widths.

### 5.2 Breakpoint behavior

Design and test these ranges instead of targeting named devices:

- compact: 320–479px;
- mobile: 480–767px;
- tablet: 768–1023px;
- desktop: 1024–1439px;
- wide: 1440px and above.

Library cards: one column compact/mobile, two tablet, three desktop, and four
only when the resulting card remains at least 280px wide. Product pages use a
two-column preview/detail composition from 1024px and one continuous document
below it. Sticky details must become static before they crowd the media.

### 5.3 Spacing

Adopt a 4px base with the named scale `1, 2, 3, 4, 6, 8, 12, 16, 24` mapping
to `4, 8, 12, 16, 24, 32, 48, 64, 96` pixels. Page sections primarily use 64
or 96px vertical spacing; compact panels use 16–32px. Avoid isolated arbitrary
values unless media proportions require them.

## 6. Visual foundations

### 6.1 Typography

Retain Maison Neue only if its web licence is confirmed. Use the system sans
fallback otherwise. Keep one mono face for code, compact metadata, version and
file information.

Required roles:

| Role | Desktop guidance | Mobile guidance |
| --- | --- | --- |
| Display | 56–72px / 0.98–1.05 | 38–48px / 1.02–1.08 |
| Page title | 40–56px | 32–40px |
| Section title | 28–40px | 24–32px |
| Card title | 16–22px | 16–20px |
| Body large | 17–19px / 1.55 | 16–18px |
| Body | 14–16px / 1.55–1.7 | 14–16px |
| Label/meta | 11–13px | 11–13px |

Do not use text below 11px for meaningful information. Use sentence case for
controls and headings; reserve uppercase for short metadata only.

### 6.2 Color

Preserve a warm light theme and charcoal dark theme. Replace historical color
names such as `amber`, `moss`, `pane` and `board` in new components with
semantic roles:

- `canvas`, `surface-1`, `surface-2`, `surface-raised`;
- `text-primary`, `text-secondary`, `text-muted`, `text-inverse`;
- `border-subtle`, `border-default`, `border-strong`;
- `action-primary`, `action-primary-hover`, `action-secondary`;
- `status-success`, `status-warning`, `status-danger`, `status-info`;
- `focus-ring`, `overlay`.

Product media supplies most color. The platform accent is used for active
selection, focus and one primary action—not every badge and link. Both themes
must pass WCAG 2.2 AA contrast checks, including control boundaries.

### 6.3 Shape, borders and elevation

Use three radius roles: 8px controls, 12px cards, 16px large media/dialogs.
Pills are reserved for filters, compact statuses and segmented choices.
Surfaces use borders before shadows. Use one subtle card elevation and one
dialog elevation; remove decorative glass effects where they do not communicate
layering or focus.

### 6.4 Icons

Adopt one outlined icon set with consistent 1.5–2px stroke. Icons supplement
labels; they do not replace important navigation labels. Define 16, 20 and
24px sizes. Do not mix emoji, filled symbols and unrelated SVG styles in the
same surface.

## 7. Core components

The rebuild requires documented variants and states for:

| Family | Required components and states |
| --- | --- |
| Navigation | Desktop header, mobile drawer, footer, breadcrumbs, account menu |
| Actions | Primary, secondary, quiet and destructive buttons; icon buttons; loading and disabled states |
| Forms | Text, email, password, textarea, select, checkbox, radio, validation, help and submission feedback |
| Discovery | Search input/palette, type tabs, filter trigger, filter panel, applied-filter chips, sort and count |
| Content | Original-kit card, inspiration card, collection card, editorial feature, metadata list and file manifest |
| Media | Image, video, comparison, gallery, poster/fallback, unavailable and reduced-motion states |
| Overlays | Item quick view, mobile drawer, menu/popover, confirmation dialog and toast |
| System | Skeleton, empty, no-results, service-error, offline, permission-denied, 404 and maintenance states |
| Account | Stat, usage meter, saved row, download row, entitlement status and billing status |

Every interactive component documents default, hover, focus-visible, pressed,
disabled, loading and error behavior. Every content component documents missing
media, long title, missing metadata and narrow-width behavior.

## 8. Content and card rules

### 8.1 Original-kit card

Required information:

- recognizable preview;
- complete title;
- product type;
- at most one access/status badge;
- optional short compatibility or use-case detail;
- whole-card link with visible focus.

The card may preview motion on hover/focus where appropriate. On touch and
reduced-motion devices it shows a stable poster and never hides required text
behind hover.

### 8.2 Inspiration card

Required information:

- `Inspiration` or `External reference` label;
- source/creator name;
- source link in its details view;
- no Premium, download, prompt or ownership action;
- visually related but unambiguously different card treatment.

### 8.3 Media behavior

- Reserve the real aspect ratio before loading.
- Use `cover` only for deliberate thumbnail crops; use `contain` for product
  inspection.
- Paint a branded neutral fallback before media loads.
- Check decoded images, not only request success.
- Attach grid video only on intent; pause and detach it offscreen.
- Provide an explicit play/pause control on important motion demos.
- Never render an MP4 URL as an image poster.
- Keep captions and preview controls outside the artwork when possible.

## 9. Page specifications

### 9.1 Homepage `/`

Purpose: explain the offer and prove its visual quality.

Order:

1. compact header;
2. outcome-led copy beside one featured original kit;
3. “what a kit contains” summary;
4. 3–6 curated original kits;
5. three ways to use a kit: source, recreate, adapt;
6. one factual reconstruction/adaptation example when evidence exists;
7. separately labelled inspiration edit;
8. Learn or newsletter block;
9. restrained final action and footer.

The first viewport must contain identifiable original work. Do not lead with a
catalogue count, masonry wall or membership promotion.

### 9.2 Library `/library`

Purpose: browse and narrow original products.

Required modules: page title, persistent search, type tabs, filter/sort action,
applied filters, result count, regular card grid, pagination/load-more strategy
and URL-backed state. Promotions stay outside result rows.

Required states: loading, populated, no results, no published inventory,
catalogue unavailable and failed preview. These states must have different copy
and recovery actions.

### 9.3 Product `/item/[slug]`

Purpose: let a visitor judge and use one kit confidently.

Required order: breadcrumb → product identity and availability → preview/gallery
→ use case and description → actual contents → compatibility/setup → licence
and version → primary action → related original kits.

Desktop keeps identity and action visible beside the preview without letting a
huge stage hide the title. Mobile becomes one document with no nested scrolling.
Render only factual fields; omit unknown compatibility, files or proof.

### 9.4 Item quick view

Purpose: inspect an item without losing Library position.

Use the same data and access rules as the full page. Desktop uses a preview and
compact detail panel; mobile becomes a full-screen sheet. Support Back, Escape,
outside click, focus trap, focus return, slow loading, missing item and “open
full page.” The modal cannot contain a second scrolling region for essential
content.

### 9.5 Collections

`/collections` explains editorial groups of original kits. A collection detail
page shows its purpose, included items, compatibility and a coherent visual
story. Keep the current production gate until at least two useful collections
have real items and the responsive design passes review.

### 9.6 Pricing `/pricing`

Show current access and future offers as different states. The page needs one
primary comparison, concise inclusions, licensing summary, FAQ and a factual
next action. It must not present a future price as a current checkout. When
payment opens, add billing cadence, taxes/currency notes, cancellation, updates
and support scope before activating checkout.

### 9.7 Authentication

Routes: `/join`, confirmation, reset password and recovery/error states.

Use a centered form or balanced two-column layout with the same header, form
components and typography as the platform. Show only enabled providers. Explain
whether the visitor is signing in or creating an account, why an account is
needed, and where they will return. Include validation, show/hide password,
pending, rate-limit, expired-link, resend and service-error states.

### 9.8 Account

Routes: `/account`, `/account/downloads`, `/account/profile`,
`/account/billing`.

Use a compact account sub-navigation and consistent cards/tables. Dashboard
shows useful next actions rather than decorative numbers. Downloads show item,
file/version, date, licence snapshot and a working retry action. Profile uses
standard form patterns. Billing accurately reflects no plan, early access,
active, cancellation scheduled, overdue and payment-processing states.

### 9.9 Learn and technical documentation

`/docs` becomes the Learn landing page once content exists: getting started,
using source, reconstructing, adapting, motion guidance, troubleshooting and
licensing. `/mcp` remains a technical integration page with setup, permissions,
allowances, key states and recovery. Changelog entries link to affected kit
versions.

### 9.10 Contact and support

`/contact` provides clear question categories, response expectations and an
alternative channel if submission fails. Add item/version context where the
visitor arrived from a product page. Do not force account creation for basic
support.

### 9.11 Legal

`/license`, `/terms` and `/privacy` use the Reading layout, table of contents,
clear effective date and item-specific exceptions where required. Draft status
must remain visible until professional review is complete.

### 9.12 System pages

Design `loading`, error, not found, unavailable, confirmation success/failure,
unsubscribe and maintenance states as part of the system. Each state says what
happened, whether user work is safe, and the best next action. Avoid generic
“something went wrong” pages with no recovery.

### 9.13 Expansion pages

Do not build these into the launch navigation yet, but reserve the patterns:

- Inspiration index and reference detail;
- Boards and saved research;
- ordered flows;
- workspace/team administration;
- creator submission/review;
- internal publishing/support tools.

Each requires its own permissions and empty/error states. Third-party content
cannot reuse product purchase/download components.

## 10. Motion system

Framer Motion is the shared interface motion layer. CSS handles simple color,
border and opacity feedback. GSAP or WebGL may exist inside an isolated demo,
not in platform navigation or route visibility.

| Interaction | Timing and behavior | Reduced motion |
| --- | --- | --- |
| Control feedback | 120–160ms color/opacity; optional 0.99 press | Color only |
| Card feedback | 160–200ms border or maximum 2px lift | No translation |
| Menu/popover | 140–180ms opacity and maximum 4px movement | Immediate or opacity only |
| Filter results | 120–180ms opacity; preserve scroll and focus | Immediate |
| Dialog/sheet | 200–240ms opacity and maximum 8px movement | No spatial movement |
| Toast | 160–200ms; never blocks the next action | Simple appearance |
| Editorial reveal | Optional, once, 240–320ms | Content already visible |
| Product motion | Poster first, play on intent, stop offscreen | Poster plus optional play |

Use the shared ease `[0.22, 1, 0.36, 1]`. Do not stagger dozens of cards,
hide essential content until hydration, use scroll hijacking, or add a custom
cursor to the platform shell.

## 11. Accessibility and performance contract

Target WCAG 2.2 AA. Required checks include:

- complete keyboard operation and logical order;
- visible, unobscured focus;
- focus management for dialogs, drawers and route changes;
- 44px target size for primary touch controls;
- correct labels, instructions, error association and live feedback;
- reflow at 320px and 200% zoom;
- normal text contrast 4.5:1, large text 3:1 and necessary UI boundaries 3:1;
- reduced-motion behavior that leaves all essential content visible;
- captions/transcripts for instructional media when required;
- no information conveyed through color or motion alone.

Performance targets: p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 when field data
exists. Reserve media dimensions, prioritize only the first meaningful preview,
defer offscreen media, limit active video and avoid route-wide client
components when server rendering is sufficient.

## 12. Required design states

Every affected page must account for these states before it is marked designed:

| Domain | States |
| --- | --- |
| Session | anonymous, signed in, expired session, unavailable auth |
| Access | preview only, free/account required, entitled, unavailable, retired |
| Data | loading, populated, empty, no results, failed, stale/offline |
| Media | poster, playing, paused, reduced motion, failed, unavailable |
| Form | empty, focused, invalid, submitting, success, server failure, rate limited |
| Download | available, preparing, quota exhausted, file missing, signing failure |
| Billing | not offered, interest only, active, processing, overdue, cancelling, cancelled |

Designs must show real representative copy for each relevant state. Disabled
controls are not a substitute for explaining unavailable functionality.

## 13. Migration and governance

1. Inventory every current token and map it to a semantic role.
2. Build the new foundations and components in an isolated design-system route.
3. Approve reference screens for Homepage, Library, Product and mobile
   navigation before broad implementation.
4. Migrate one route at a time. Do not mix old and new versions of a component
   inside the same route.
5. Remove a legacy dependency only after all consumers are migrated and visual
   checks pass.
6. Record screenshots at 390, 768, 1024 and 1440 pixels in both themes for each
   completed route.
7. Keep copy, access rules and catalogue facts data-driven. The design system
   cannot invent availability.

New components require a documented owner, variants, states and examples.
Page-specific CSS is allowed for composition; reusable visual behavior belongs
to the component system. No new global `!important` rule is accepted without a
documented reason and removal task.

## 14. Design approval gate

Implementation may begin after these artifacts are reviewed together:

- token sheet in light and dark themes;
- desktop and mobile header/drawer;
- buttons, forms, cards, filters, status, media and system-state components;
- Homepage at 1440 and 390 pixels;
- Library populated/no-results/error at 1440 and 390 pixels;
- Product page and quick view using both real catalogue items;
- one authentication screen and one account screen;
- motion prototype with reduced-motion comparison.

Approval means the hierarchy, content, responsive behavior and states are
accepted. It does not require every later page to have a high-fidelity mockup;
the approved system must be specific enough that those pages can be assembled
without inventing a new visual language.

## 15. Definition of done

A page is complete only when:

- it uses approved tokens and shared components;
- its purpose and primary action are clear in the first meaningful viewport;
- all applicable states in section 12 are implemented;
- both themes and required widths pass visual review;
- keyboard, focus, zoom and reduced-motion checks pass;
- real media decodes or shows the designed fallback;
- content and access claims match the underlying data;
- loading does not replace the surrounding page unnecessarily;
- typecheck, production build and route smoke checks pass;
- the result is reviewed in a Vercel preview before production merge.

## 16. Non-goals for the design rebuild

This work does not authorize a new brand name, unlicensed fonts, a new payment
offer, activation of checkout, deletion of catalogue records, fabricated
product proof, third-party media republishing, or simultaneous implementation
of the mature research/team platform. Those require separate product, rights
and operational decisions.
