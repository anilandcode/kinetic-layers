# Bench redesign implementation

## Authority and scope

The finished `Kinetic Layers Bench.dc.html` and its locked `Handoff.md` in the
supplied AI Marketplace Website Planning folder are the visual authority. Older
design exports are historical context. This implementation is local in
`/Users/apple/Projects/direction-kit`; it has not been deployed.

## Current implementation — 2026-09-17

- The public header and footer now use Library, Pricing, and Contact. Process is
  archived and `/how` returns a true 404.
- Collections and collection detail routes remain available in local development
  for future work. Production middleware returns a true 404 for both route
  forms, and production navigation, sitemap, not-found UI, and saved-collection
  UI do not link to them.
- The homepage card wall contains 20 attributed MotionSites visual references
  alongside the two Kinetic Layers items with real previews. Every reference is
  visibly labeled, has a MotionSites source link, and handles remote media
  failure with a clear unavailable state. References never affect catalogue
  data, search, filters, counts, entitlements, downloads, or Premium actions.
- Real items and references now share the same compact two-panel popup: media
  stage on the left and details/actions on the right. Real-item access rules,
  downloads, direct item routes, Escape, Back behavior, and focus return are
  retained. Portrait and long media can scroll inside the stage without growing
  the modal.
- Process is no longer a public page. Pricing uses an honest early-access state:
  access is free now, while Founding Membership is a future $24/month proposal.
  The confirmation-based interest list creates neither billing nor entitlement;
  checkout is unavailable during early access.
- Maison Neue supplies supporting UI typography. The supplied neutral layered
  mark is used for the logo and site icons, light-mode contrast is corrected,
  and orange UI/effects have been removed.
- Framer Motion is the public motion layer for page, section, card, and modal
  transitions. It uses opacity and transforms only, respects
  `prefers-reduced-motion`, and replaces the old GSAP-driven visual runner on
  redesigned public routes. Theme changes stay instant.

## Development-only preview route

`/bench-preview` retains the 22-card reference wall for local review and
returns HTTP 404 outside development. It is an isolated visual review route;
the public homepage uses the same attributed references without importing them
into the catalogue.

## Validation status

- TypeScript, `git diff --check`, and the optimized production build pass.
- The build currently warns that `NEXT_PUBLIC_SITE_URL` falls back to
  `http://localhost:3000`; set the deployed value before release.
- Local browser review confirmed the homepage, reference popup, real-item popup,
  22-card wall, and the local Collections route. The final design review should
  still repeat desktop, tablet, and 390px checks in both themes after any media
  or copy changes.
- The membership-interest SQL migration exists but has not been independently
  applied and smoke-tested against the release database. Confirmation email
  delivery must be verified before opening the list publicly.

## Release decisions still required

1. Approve a production deployment only after `NEXT_PUBLIC_SITE_URL`, interest
   migration, and email confirmation have been verified.
2. Review the two real downloadable packages and their previews before enabling
   any paid offer.
3. Keep Collections behind its production gate until its next visual and content
   review is complete.
