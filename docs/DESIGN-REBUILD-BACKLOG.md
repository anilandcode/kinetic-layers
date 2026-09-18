# Kinetic Layers design rebuild backlog

Version 1.0 · 18 September 2026 · Status: implementation-ready plan

Implementation update: DR-001 is complete. DR-002, DR-003 and DR-005 are
captured in [DESIGN-FOUNDATIONS-AUDIT.md](DESIGN-FOUNDATIONS-AUDIT.md) and
[VISUAL-REGRESSION-CHECKLIST.md](VISUAL-REGRESSION-CHECKLIST.md). DR-004
(Vercel Preview data) and DR-006 (Maison Neue licence/removal) remain open.
The isolated DR-1 review route is in progress; no broad migration has started.

This backlog executes [DESIGN-REBUILD-SPEC.md](DESIGN-REBUILD-SPEC.md). It is
ordered by dependency and risk. “Done” means the acceptance evidence exists;
it does not mean a component merely renders.

Sizes are relative planning units: S is narrow, M is a component or simple
page, L is a core journey, and XL must be split before implementation.

## 1. Milestone map

| Milestone | Outcome | Gate |
| --- | --- | --- |
| DR-0 — design truth | One authority, route inventory and preview environment | Real catalogue content renders in PR previews |
| DR-1 — foundations | Approved tokens, typography, grid, motion and accessibility rules | Foundation sheet approved in both themes |
| DR-2 — components | Reusable navigation, controls, discovery, cards, media and system states | Component gallery passes keyboard and responsive review |
| DR-3 — core references | Approved Homepage, Library, Product and mobile-navigation designs | 1440/768/390 references accepted before broad code migration |
| DR-4 — public platform | Core public routes rebuilt | Home → Library → Product journey passes |
| DR-5 — identity and account | Auth, account and recovery routes rebuilt | Signup-return and download-history journeys pass |
| DR-6 — support and trust | Pricing, Learn, Contact, legal and system pages rebuilt | Claims, recovery and legal status are consistent |
| DR-7 — collections | Editorial collections return only when useful | Two complete collections and all release checks pass |
| DR-8 — expansion | Inspiration, Boards, teams and creators after demand | Separate product/rights approval for each capability |

## 2. DR-0 — reconcile the design surface

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-001 | Make this spec and backlog the current design authority; label previous UI documents historical where they conflict | S | None | README and old UI review point here |
| DR-002 | Inventory every routed page, overlay, loading boundary and system state | M | None | Route matrix covers public, auth, account, legal and gated routes |
| DR-003 | Inventory tokens and selectors across legacy, Kinetic and Bench styles | M | None | Mapping identifies duplicates, consumers and proposed semantic roles |
| DR-004 | Configure non-secret Sanity project/dataset variables for Vercel Preview | S | None | A branch preview opens both real item routes instead of returning 404 |
| DR-005 | Establish visual regression capture widths and naming | S | None | Repeatable 390/768/1024/1440 light/dark capture checklist exists |
| DR-006 | Confirm Maison Neue web licensing and fallback decision | S | None | Written decision records permitted deployment or replacement |

**Gate:** do not start a broad visual migration until DR-004 is complete. A
preview that cannot render real content cannot approve a gallery design.

## 3. DR-1 — foundations

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-101 | Create semantic light/dark color tokens and map existing aliases | M | DR-003 | Token sheet and contrast results for text, controls and focus |
| DR-102 | Define typography roles and load strategy | S | DR-006 | No meaningful text below 11px; fallback has acceptable metrics |
| DR-103 | Implement container, grid, gutter and spacing primitives | M | DR-101 | Example layouts at all five responsive ranges without overflow |
| DR-104 | Define radius, border, elevation, icon and z-index roles | S | DR-101 | Component examples use only named roles |
| DR-105 | Centralize motion timing, easing and reduced-motion policy | M | None | Side-by-side standard/reduced-motion prototype |
| DR-106 | Create focus, skip-link and route-focus behavior | M | DR-101 | Keyboard review records visible and unobscured focus |
| DR-107 | Create the design-system review route | M | DR-101–106 | Foundations and component states are inspectable without production content changes |

**Gate:** approve the foundation sheet in both themes at 390 and 1440 pixels.

## 4. DR-2 — shared components

### Navigation and actions

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-201 | Desktop header and account states | M | DR-1 | Anonymous/account variants align and remain stable during loading |
| DR-202 | Mobile header and drawer | L | DR-201 | All destinations reachable; trap, Escape and focus return pass |
| DR-203 | Footer and contextual support links | S | DR-1 | Legal, contact, newsletter and product links have one hierarchy |
| DR-204 | Button and icon-button family | M | DR-1 | Default/hover/focus/pressed/loading/disabled/destructive examples |
| DR-205 | Breadcrumbs, tabs and account sub-navigation | M | DR-1 | Long labels and narrow widths do not overflow |

### Forms and feedback

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-211 | Inputs, password, textarea, select, checkbox and radio | L | DR-1 | Labels, help, errors, autofill and touch sizes pass |
| DR-212 | Form-level pending, success, failure and rate-limit patterns | M | DR-211 | Status announced and submit state cannot duplicate requests |
| DR-213 | Toast, inline notice and confirmation dialog | M | DR-204 | Keyboard and screen-reader behavior recorded |

### Discovery and content

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-221 | Search input and command palette | L | DR-204, DR-211 | Empty/loading/results/error, focus trap and return pass |
| DR-222 | Type tabs, filter trigger/panel, applied chips, sort and count | L | DR-204 | URL state, mobile sheet and zero-result recovery pass |
| DR-223 | Original-kit card | M | DR-1 | Long title, motion, no poster, access states and focus pass |
| DR-224 | Inspiration/reference card | M | DR-223 | Source attribution visible; no product action or inventory count |
| DR-225 | Collection and editorial-feature cards | M | DR-223 | Purpose, count and missing-media variants documented |
| DR-226 | Metadata list, actual file manifest and licence/version block | M | DR-1 | Unknown fields omit cleanly; no fabricated rows |

### Media, overlays and system states

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-231 | Shared image/video stage and fallback | L | DR-105 | Poster, play/pause, failed media, reduced motion and fit modes pass |
| DR-232 | Gallery/comparison viewer | L | DR-231 | Keyboard, swipe, captions and responsive containment pass |
| DR-233 | Dialog, sheet, popover and menu primitives | L | DR-106 | Focus trap/return, Escape, Back and nested-scroll policy pass |
| DR-234 | Skeleton, empty, no-results, error, offline and permission states | L | DR-204 | Each state has distinct copy and recovery action |

**Gate:** component gallery passes keyboard, light/dark and 390/768/1440 review.

## 5. DR-3 — reference screens before migration

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-301 | Homepage reference at 1440, 768 and 390 | L | DR-2 | Original work leads; inspiration is a separate section |
| DR-302 | Library populated reference | L | DR-2 | Search/filter hierarchy and regular grid are approved |
| DR-303 | Library no-results, no-inventory and service-error references | M | DR-234, DR-302 | States are visually and verbally distinct |
| DR-304 | Product reference using `verdro` | L | DR-226, DR-231 | Title/access visible before oversized media; factual empty manifest |
| DR-305 | Video-product reference using `Asset` | M | DR-231, DR-304 | Motion, poster/fallback and related thumbnail behavior approved |
| DR-306 | Item quick-view reference | L | DR-233–305 | Desktop dialog and mobile full-screen sheet approved |
| DR-307 | Mobile navigation prototype | M | DR-202 | Search, destinations, account and theme all reachable |
| DR-308 | Authentication and account representative screens | L | DR-211–213 | The system extends beyond marketing pages without a second style |

**Gate:** founder approves hierarchy and direction before DR-4 implementation.
Feedback is applied to shared foundations first, not patched independently into
each page.

## 6. DR-4 — core public platform

| ID | Route | Work | Size | Acceptance evidence |
| --- | --- | --- | ---: | --- |
| DR-401 | `/` | Replace mixed wall with approved original-first narrative and separate inspiration edit | L | First viewport shows real original work; no interrupted product rows |
| DR-402 | `/library` | Add approved search/filter/grid/state system | XL → split | URL filters, counts, loading, no-results and failure states pass |
| DR-403 | `/item/[slug]` | Migrate product identity, media, manifest, metadata, licence and related items | L | Both live items pass desktop/mobile/media/access checks |
| DR-404 | `/(.)item/[slug]` | Rebuild quick view on dialog/sheet primitive | L | Back/Escape/focus/scroll/direct-route tests pass |
| DR-405 | Shared shell | Replace page-specific header/footer dependencies | M | Home, Library and Product use the same responsive shell |
| DR-406 | Public motion | Replace page-local reveal assumptions with approved variants | M | Content remains visible without JS and in reduced motion |
| DR-407 | Core visual regression | Capture both themes and target widths | M | Approved screenshots and issue list attached to milestone |

**Gate:** an anonymous visitor can move from Home to Library to either Product,
understand what exists and reach a truthful next step at every width.

## 7. DR-5 — authentication and account

| ID | Route | Work | Size | Acceptance evidence |
| --- | --- | --- | ---: | --- |
| DR-501 | `/join` | Replace inline/legacy layout with shared form and focused shell | L | Sign-up/sign-in, enabled providers, errors and safe return URL pass |
| DR-502 | Confirm/reset routes | Create consistent pending/success/expired/failure recovery | M | Every email-link outcome has a next action |
| DR-503 | `/account` | Replace inline styles; prioritize saved/recent/usage actions | L | New, active and service-slow states pass |
| DR-504 | `/account/downloads` | Design versioned download history and retry states | L | Available, missing, expired/signing error and empty history pass |
| DR-505 | `/account/profile` | Migrate to shared form components | M | Validation, pending, success and service failure pass |
| DR-506 | `/account/billing` | Design current/future/active billing states | L | No checkout is implied while billing is inactive |
| DR-507 | Account responsive/keyboard QA | Review account journey | M | 390/768/1440, zoom, focus and reduced motion pass |

## 8. DR-6 — support, trust and system pages

| ID | Route | Work | Size | Acceptance evidence |
| --- | --- | --- | ---: | --- |
| DR-601 | `/pricing` | Simplify current versus future offer and comparison | L | No future offer appears purchasable; all claims match flags/data |
| DR-602 | `/docs` | Turn into Learn landing and article pattern | L | Getting started, use paths and troubleshooting are findable |
| DR-603 | `/mcp` | Apply technical-doc pattern and key/error states | M | Setup, scope, quotas and recovery are explicit |
| DR-604 | `/contact` | Add question context, expectations and failure alternative | M | Works without account; failed submission has recovery |
| DR-605 | `/license`, `/terms`, `/privacy` | Migrate to legal reading template | M | Effective date, contents navigation and draft status are clear |
| DR-606 | `/changelog` | Add version-linked changelog pattern | M | Entries link to products/versions and support empty state |
| DR-607 | 404/error/loading/maintenance | Implement shared system states | L | Route context remains visible; recovery actions are relevant |
| DR-608 | Newsletter/membership confirmations | Apply confirmation state pattern | M | Pending/success/expired/unsubscribe states pass |

## 9. DR-7 — editorial collections

| ID | Task | Size | Depends on | Acceptance evidence |
| --- | --- | ---: | --- | --- |
| DR-701 | Define collection purpose and content minimum | S | DR-4 | Each collection has a use case and at least two real items |
| DR-702 | Rebuild `/collections` | L | DR-225, DR-701 | Populated, empty and gated states pass |
| DR-703 | Rebuild `/collections/[slug]` | L | DR-226, DR-232, DR-701 | Story, compatibility and item relationships are clear |
| DR-704 | Restore navigation/sitemap only after approval | S | DR-702–703 | Production gate lifted with route and regression evidence |

## 10. DR-8 — later platform expansion

Create separate product specifications before implementing these epics:

| Epic | Required before design starts |
| --- | --- |
| Inspiration and reference detail | Rights/provenance policy, capture/update workflow, distinct taxonomy |
| Boards | Saved-item entity, private notes, ordering and deletion behavior |
| Flows | Ordered-step data model and stale-capture policy |
| Teams/workspaces | Roles, invitations, billing owner and audit requirements |
| Creator submissions | Review, rights, rejection, versioning, moderation and payout policy |
| Integrated builder | Evidence gates from the product plan and a separately scoped editing model |

Do not allow these epics to delay the launch-quality original-kit journey.

## 11. Route matrix

| Surface | Current disposition | Target milestone |
| --- | --- | --- |
| Homepage | Live; mixed products/references/promotions | DR-4 |
| Library | Live; catalogue and filters | DR-4 |
| Product direct + quick view | Live; truthful preview states | DR-4 |
| Pricing | Live; future membership messaging | DR-6 |
| Contact | Live | DR-6 |
| Join/reset/confirm | Live, partially legacy | DR-5 |
| Account/dashboard/downloads/profile/billing | Live, inline-style heavy | DR-5 |
| Docs/MCP/changelog | Live | DR-6 |
| Legal | Live drafts | DR-6 |
| 404/error/loading | Live, inconsistent patterns | DR-6 |
| Collections | Implemented but production-gated | DR-7 |
| Process `/how` | Archived/404 | Remain archived unless product need returns |
| Plan and design-system routes | Internal/historical | Replace with DR-107 review surface |
| Bench preview | Development-only | Retire after DR-3 approval |
| Inspiration/Boards/Flows/Teams/Creators | Not launch scope | DR-8 |

## 12. Work rules

- One milestone branch or a small sequence of focused branches; never a
  site-wide unreviewable CSS rewrite.
- Preserve direct item URLs, access gates, media delivery and current data
  behavior during visual migration.
- Use real catalogue records and representative long/empty/error content in
  previews.
- Review each core page in a Vercel Preview deployment before merging.
- Keep `NEXT_PUBLIC_EARLY_ACCESS` and checkout unchanged unless separately
  approved.
- Do not delete old styles until `rg` confirms no consumers and route checks
  pass.
- Record any intentional deviation from the specification in the PR and update
  the spec if the decision is permanent.

## 13. First implementation batch

Start with this exact sequence:

1. DR-001 through DR-006;
2. DR-101 through DR-107;
3. DR-201, DR-202, DR-204, DR-211, DR-223, DR-224, DR-231, DR-234;
4. DR-301 through DR-308;
5. founder visual approval;
6. DR-401 through DR-407.

Do not begin the account or future-platform redesign while the core reference
screens are unsettled. The fastest route to a coherent complete platform is to
make the shared system and three core browsing screens correct first.

## 14. Milestone completion record

For every completed milestone record:

- decision and owner;
- issue/PR links;
- source commit and deployment;
- widths and themes reviewed;
- keyboard/accessibility evidence;
- performance/media checks;
- content or access risks left open;
- next gate.

This record belongs in the PR description or a dated appendix, not as an
unsupported “complete” statement in product copy.
