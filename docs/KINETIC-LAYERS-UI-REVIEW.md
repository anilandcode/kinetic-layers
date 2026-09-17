# Kinetic Layers: live UI review and proposed design direction

Reviewed: 2026-09-10/11. Saved: 2026-09-11.

Status: design diagnosis and proposed changes. No application changes or deployments were made. This review complements the [master plan](KINETIC-LAYERS-MASTER-PLAN.md).

## Implementation update — 2026-09-17

This review remains a historical diagnosis of the prior live site. A Bench-led
public-site refinement has since been implemented locally, without deployment.
The current local implementation uses Maison Neue supporting UI type, a neutral
layered mark, restrained Framer Motion, a compact media-led homepage wall, and
a unified two-panel item popup.

The public navigation is now Library, Pricing, and Contact. Process is archived
at a true 404. Collections remain available locally but are intentionally hidden
behind production 404 guards while their future release is prepared. The
homepage now includes 20 explicitly attributed MotionSites visual references
beside two real Kinetic Layers previews; references have no product actions and
do not affect catalogue data.

The original bronze, Collections-navigation, Process-navigation, and proposed
homepage details below should therefore be read as evidence of the old visual
state, not as current implementation requirements. `HANDOFF.md` and
`BENCH-REDESIGN.md` record current local status and release boundaries.

## Evidence and limits

Inspected the live [homepage](https://kineticlayers.com/), [library](https://kineticlayers.com/library), the Verdro modal reached from the library, and the [standalone Verdro page](https://kineticlayers.com/item/verdro). Reviewed screenshots at the browser's desktop width (1,680px) and the homepage/library at 390 × 844px. The rendered theme was dark. Light theme, authenticated screens, checkout, and full accessibility/performance testing are outside this visual review.

The site showed 17 assets and five free items. Those are observations from this visit, not hardcoded content recommendations. Screenshots were inspected in-session; this document does not claim a separate screenshot archive exists.

## Diagnosis

The visual identity is coherent, but the composition and content do not yet deliver the same level of confidence. Bronze accents, charcoal surfaces, precise borders, and restrained typography establish a studio character. The visitor then encounters mostly pale, indistinct previews, little differentiation between items, and repeated calls to access the library.

The missing qualities are a strong focal point, editorial selection, visual rhythm, and specificity about the product. More decoration alone would leave these problems intact.

## What works and should carry forward

- The warm bronze accent gives the site a recognizable character.
- The charcoal base lets colorful work stand out.
- The restrained wordmark, fine rules, and occasional monospaced labels support the studio identity.
- The serif supporting line adds contrast to the main sans-serif typography.
- The Verdro artwork demonstrates how much stronger the site feels when a card contains an actual designed result.
- Opening an item over the library keeps browsing context available; retain both modal and direct page entry.

## Findings and proposed remedies

### 1. The hero occupies the main visual space without displaying the product

Observed: the desktop opening is mostly a centered headline, supporting line, two buttons, and subtle grid/ring decoration. The actual work begins near the bottom of the first viewport. The headline emphasizes the catalogue count.

Effect: visitors receive atmosphere before they receive a compelling visual reason to explore. The count gives a small library more emphasis than its quality.

Proposed: a shorter, left-aligned introduction beside one large featured design. Put a small live-example label and a direct preview action beside the work. Use the existing hero typography at a scale that supports the composition. Make the first featured design visible immediately on mobile, below the copy and primary action.

Suggested copy direction: “Original websites and motion kits you can make your own.” This is a draft, not published copy.

### 2. Most previews do not communicate distinct products

Observed: six of the eight homepage asset images looked like pale gradient fields. Image inspection confirmed that all eight images had completed loading with nonzero natural widths; several associated videos also had playback data. The empty-looking impression was therefore not simply eight missing image requests. The two visually specific examples were “Asset” and “verdro.”

Effect: the gallery reads as unfinished even though the surrounding UI is polished. An editorial template, prompt, and 3D scene should not look interchangeable.

Proposed: feature only real, recognizable outputs on the homepage. Until more are ready, use two excellent examples at generous size. Standardize preview framing, crop intent, and captions while preserving each design's own palette. Name every item clearly. Keep placeholders out of marketing positions; do not delete existing content or URLs as part of this review.

### 3. The homepage repeats a small number of layouts and messages

Observed: large centered hero → masonry with embedded access/newsletter promotions → another large centered access CTA. Full-page screenshots show uneven column endings and long areas with little information.

Effect: whitespace lacks a clear purpose, and the page has no sequence of discovery, explanation, and proof. The visitor sees requests to browse or sign up more often than demonstrations of value.

Proposed homepage order:

1. Compact navigation and clear offer.
2. Featured project with a large visual and preview action.
3. Four to six curated works, once sufficient real work exists.
4. One visual explanation: reference design → supplied kit → adapted result.
5. One collection presented as a coherent family of sections and motion.
6. Brief studio/process note and newsletter.
7. A small closing action.

Use one full-width featured block, a structured gallery, and one split explanation section. Keep masonry for library exploration where it serves the media; do not require the homepage to repeat that structure. Move newsletter and membership advertisements outside the first product rows.

### 4. The small UI competes with the important information

Observed: card captions contain a name, a bronze Premium badge, a second “Free now” badge, and an uppercase type. Several names truncate on desktop while the metadata retains space. Filters and labels use very small monospaced text; the repeated pill shape appears in navigation, filters, badges, and actions.

Effect: the controls feel carefully styled but visually busy. Many elements have similar emphasis, making the actual design title and primary action harder to distinguish.

Proposed: one access badge reflecting the current state; full titles on their own line; type and one useful descriptive detail below. Reserve strong bronze treatment for the primary action or active selection. Use calmer text links for secondary navigation, flatter chips for filters, and small plain labels for metadata. Increase the legibility of navigation, filters, and supporting copy before adding effects.

This is a visual legibility finding, not a measured contrast-ratio audit.

### 5. The item page is attractive but too generic

Observed on Verdro: a strong artwork preview, account CTA, type, related items, and generic “The output / The source / The receipt” descriptions. No asset-specific description, stack details, visible file manifest, or live-demo link appeared in the inspected signed-out view. The standalone preview left a large unused dark strip on its right, unlike the better-proportioned modal preview.

Effect: the visitor cannot confidently judge what this particular template includes or how to use it. The page describes the idea of a package instead of showing the actual package.

Proposed: put the title and one-sentence use case before the preview. Align the preview frame with the media's real aspect ratio; center contained media when containment is necessary. Offer Preview and Get kit as distinct actions only when the demo and package exist. Show actual included files, supported stack, customization possibilities, and a short setup path. Show desktop/mobile examples when available. Move related work below the primary explanation.

Do not invent files, proof, compatibility badges, or shipped-project claims to fill this layout.

### 6. Mobile navigation needs a functional redesign

Observed at 390px: document width was 417px. The right edge of the Go Premium link was approximately 416.84px, visibly clipping the button. The desktop navigation and search disappeared; the visible header had only the logo, theme toggle, and Premium link, with no replacement menu. Rechecked on the library during the resumed review with the same width result.

Effect: the header looks unfinished and visitors lose direct access to navigation. This is a reproduced layout defect, separate from aesthetic preferences.

Proposed: compact mobile header with brand, search, and menu. Put theme and account/access controls inside the menu. Provide Library, Collections, Process, and access information there. Keep type filtering in an intentional horizontal rail and expose a clearly visible Filters/Sort action rather than making users discover all controls through sideways scrolling.

At 320, 375, 390, 430, and 768px, the page must have no unintended horizontal overflow. Scrollable rails must remain contained. Menu actions need readable labels, visible keyboard focus, Escape dismissal, and focus return.

## Recommended visual direction

Evolve the existing identity into a curated design studio with a practical library underneath it.

- Keep bronze, charcoal, warm text, and the restrained typographic pairing.
- Use composition, media scale, and differences between real projects to create richness.
- Let one featured work dominate the opening view.
- Reduce decorative grids, nested frames, badge duplication, and repeated glass highlights.
- Give headings, supporting copy, metadata, and actions clearly different visual weights.
- Keep motion tied to previews and useful feedback; essential text should be readable immediately and must not depend on animation completing.

Do not choose a new font family, accent color, or animation system until the existing composition has been tested with real content. The current identity can support a much stronger page.

## Order of work

| Priority | Work                                                                                          | Completion evidence                                                            |
| -------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| First    | Fix mobile header overflow and restore navigation access                                      | Screenshots and keyboard checks at the listed widths                           |
| First    | Remove placeholder previews from featured positions; fix item naming and contradictory labels | Homepage visibly showcases only identifiable real work                         |
| Next     | Produce one desktop and mobile homepage composition using existing real previews              | Visual review of the composition before application implementation             |
| Next     | Simplify card metadata and refine gallery rhythm                                              | Long names remain readable; promotions do not interrupt the first product rows |
| Next     | Rework one real item page with factual package details                                        | Visitor can identify what it is, what it includes, and how to start            |
| Then     | Roll the selected direction into the site and verify both themes                              | Browser validation across homepage, library, modal, and standalone page        |

## Acceptance checks for a later implementation

- Essential text and navigation remain visible when animation is disabled or interrupted.
- Homepage and library have distinct roles and hierarchy.
- Actual images decode; videos start only when appropriate and have a visible still/fallback.
- Both light and dark themes receive visual and contrast checks.
- No global horizontal overflow on the tested mobile widths.
- Card titles and primary actions are legible without hover.
- Mobile users can reach search and each main navigation destination.
- Modal open/close, Escape, browser Back, focus return, and direct item links work.
- Preview framing respects the media rather than stretching or arbitrarily cropping it.
- Access labels accurately describe the visitor's current options.
- No claim of new files, results, or integrations is introduced without supporting content.

## Scope boundary

This recommendation concerns visual hierarchy, content presentation, and browsing UI. It does not authorize a rebrand, a new payment model, asset deletion, database changes, or production deployment. The master plan covers the broader product and business roadmap.
