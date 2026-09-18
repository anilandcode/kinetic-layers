# Design foundations audit

Version 1.0 · 18 September 2026 · DR-002, DR-003 and DR-006 working record

This audit supports [DESIGN-REBUILD-SPEC.md](DESIGN-REBUILD-SPEC.md) and the
[implementation backlog](DESIGN-REBUILD-BACKLOG.md). It records what exists;
it does not treat an implemented route as an approved design.

## Route and state inventory

| Surface | Route/files | Current shell | Required states or boundary | Milestone |
| --- | --- | --- | --- | --- |
| Home | `/` | Custom Bench/Kinetic | loading, catalogue empty/failure, original/reference separation | DR-4 |
| Library | `/library` | Custom Bench/Kinetic | loading, populated, no results, no inventory, failure, URL filters | DR-4 |
| Product | `/item/[slug]` | Custom Kinetic | image/video, failed media, preview-only, account-required, entitled, missing | DR-4 |
| Product quick view | `/(.)item/[slug]` | Parallel modal | loading, Back, Escape, outside click, focus return, missing item, mobile sheet | DR-4 |
| Pricing | `/pricing` | Kinetic | current access, future offer, interest success/failure, checkout unavailable | DR-6 |
| Collections | list/detail routes | Kinetic, production-gated | loading, empty, unavailable, missing, media failure | DR-7 |
| Join and recovery | `/join`, `/reset-password`, `/auth/confirm` | Mixed Kinetic/legacy | create/sign in, invalid, pending, rate limit, expired, resend, service failure | DR-5 |
| Account | overview/downloads/profile/billing | Kinetic with legacy/inline rules | empty/active, expired session, download failures, form states, billing lifecycle | DR-5 |
| Learn and MCP | `/docs`, `/mcp` | Kinetic | navigation, setup, key/quota/permission, missing topic, service failure | DR-6 |
| Contact | `/contact` | Kinetic | empty, invalid, pending, sent, rate limit, failure | DR-6 |
| Changelog | `/changelog` | Kinetic with inline layout | populated, empty, linked/unlinked release | DR-6 |
| Legal | `/license`, `/terms`, `/privacy` | Kinetic | draft/effective, contents navigation, item exception | DR-6 |
| Confirmations | newsletter and membership routes | Kinetic notice | pending, success, invalid/expired, already handled, failure | DR-6 |
| System | loading, error and not-found files | Mixed Kinetic | loading, recoverable error, 404, offline/maintenance future states | DR-6 |
| Internal review | `/design-system` | Semantic foundation | both themes, compact/wide, keyboard, reduced motion | DR-1 |
| Historical plan/preview | `/plan`, `/bench-preview` | Isolated historical systems | internal only; retire after reference approval | DR-3 |
| Archived process | `/how` | Archived/404 | remain absent unless product need returns | None |

API routes and authentication callbacks are behavior boundaries, not visual
pages. Their failures must resolve into the visible states listed above.

## Style and token inventory

`app/globals.css` previously imported seven global layers totalling 4,626
lines. The semantic foundation layer is now an eighth isolated layer and does
not change existing public component values.

| Layer | Approx. lines | Purpose | Decision |
| --- | ---: | --- | --- |
| `legacy.css` | 730 | Old pages, reset and legacy controls | Compatibility only; remove by consumer |
| `kl-tokens.css` | 209 | First Kinetic light/dark vocabulary | Compatibility only |
| `kl.css` | 2,423 | First Kinetic components and composition | Migrate component by component |
| `bench.css` | 110 | Bench token override and gallery | Compatibility only; contains font loading |
| `bench-item.css` | 38 | Product override | Fold into approved product composition |
| `bench-header.css` | 56 | Current header/footer | Replace through DR-201–203 |
| `bench-pages.css` | 56 | Pricing/collections overrides | Replace per route |
| `kl-foundations.css` | new | Semantic roles and primitives | Authority for all new work |
| `site.css`, `tokens.css`, `concept.css` | not global | Archived concept work | Keep isolated; never import globally |

The highest collision risk is `--line`, `--surface`, `--card`, `--ink`,
`--muted`, `--font-mono`, `--page-max`, `--gutter` and `--r-*`; each has
different meanings in historical layers.

## Semantic mapping

| New role | Dark | Light | Replaces |
| --- | --- | --- | --- |
| `--canvas` | `#101114` | `#ffffff` | `--bg`/`--ground` |
| `--surface-1` | `#191b1e` | `#f7f7f6` | primary panel |
| `--surface-2` | `#222428` | `#efefed` | nested panel |
| `--surface-raised` | `#2a2c31` | `#ffffff` | menu/dialog surface |
| `--text-primary` | `#eceae5` | `#17181a` | `--ink` |
| `--text-secondary` | `#b8b7b1` | `#3c3b37` | `--ink-2`/`--body` |
| `--text-muted` | `#9d9c96` | `#5c5b56` | `--ink-3`/`--muted` |
| border roles | progressive neutral boundaries | progressive neutral boundaries | line/hairline variants |
| action roles | light ink | dark ink | visual-name CTA tokens |
| `--status-*` | explicit outcomes | explicit outcomes | `moss`/`ok`/`sage` ambiguity |
| `--focus-ring` | blue | blue | keyboard focus only |

New components must not introduce historical color names. Historical aliases
remain until `rg` shows their public consumers have been migrated.

## Typography and licensing

Four Maison Neue TTF files are present under `public/fonts` and loaded by
`bench.css`. No licence record exists in the repository. The new foundation
uses a system sans stack and does not depend on Maison Neue.

DR-006 remains open until the owner records a web-embedding licence or approves
removing the font files and `@font-face` declarations. No new component may add
a Maison Neue dependency in the meantime.

## Open gate

DR-004 remains blocking: Vercel Preview needs the same non-secret public Sanity
project ID and dataset variables as Production. A preview must render both
`/item/verdro` and `/item/Asset` before core reference screens are approved.
