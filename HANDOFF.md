# Kinetic Layers — handoff

This document records operational decisions and known traps. Verify material
implementation details in the current source before acting.

## v2: the owner chose the cinematic direction — 2026-09-24 (branch `redesign/v2`)

`/` now renders the cinematic home, built out to the references with:

- a WebGL dither field;
- luminous, dithered kit wells;
- fluted glass;
- a page-wide dotted spotlight;
- dot-matrix data;
- magnetic actions;
- the four-card hero deck from the dark dashboard reference.

It is documented in
[docs/directions/cinematic/DESIGN.md](docs/directions/cinematic/DESIGN.md).
The shell's default look is `cinematic`. The rest of the platform follows next.

## v2 directions, side by side — 2026-09-24 (branch `redesign/v2`)

The owner rejected the first v2 pass. It was a generic dark landing page with
a neon chartreuse accent. It is replaced by **two complete design directions**
built from their references, to be compared and one chosen.

**The two directions:**

| Direction | Route | Design system | References |
|---|---|---|---|
| A — Soft gradient studio | `/direction/soft` | [docs/directions/soft/DESIGN.md](docs/directions/soft/DESIGN.md) | Synthex, Credit Karma, Superpower, Neka |
| B — Cinematic workbench | `/direction/cinematic` | [docs/directions/cinematic/DESIGN.md](docs/directions/cinematic/DESIGN.md) | Reticla, the node editors, the dark gradient dashboard |

**How they are built:**
- Each is a Home only: a short hero, the library at once (12 kits with a
  "Show all"), and a few sections.
- `/` shows Direction A for now.
- `middleware.ts` answers 404 for `/direction/*` when
  `VERCEL_ENV === "production"`.
- Each look is set by `data-look` on the shell, not by the theme toggle.
  Look-specific CSS is prefixed `:global([data-look="…"])`.
- Kit colour comes from `lib/v2/gradient.ts`: the hue from the kit, and
  lightness and saturation fixed per look.
- GSAP 3.15 is back, used for the pointer glow, Flip filtering, and
  ScrollTrigger reveals and wire draw-in.

**Fonts:** General Sans is fetched at build time and never committed. The
repository is public, and its licence forbids redistribution; see
[docs/FONTS.md](docs/FONTS.md).

## v2 redesign, Stage A — 2026-09-24 (branch `redesign/v2`), superseded above

The whole platform is being rebuilt to [the v2 direction](docs/DESIGN-DIRECTION-V2.md)
on `redesign/v2`, cut from `chore/cleanup-dead-code-and-fonts`. Nothing reaches
kineticlayers.com until the owner says "launch"; pushes create Vercel previews
on the `kinetic-layers` project only.

- **Built so far:**
  - Home (`/`), the kit page (`/item/[slug]`) and its quick-view interception.
  - The v2 shell: header, mobile drawer, search, footer.
  - The primitives in `components/v2/`.
- **Everything else is still v1** (Library, Pricing, Account, Join, content
  pages) until Stage B.
- **Scoping.** v2 renders inside `[data-v2]`, never `[data-kl]`. Its tokens are
  the top block of `styles/kl-foundations.css`. Component styles are CSS Modules
  beside each component.
  - The global resets there are wrapped in `:where()`. Without it,
    `[data-v2] a` outranked every single-class module rule.
- **Kit graph data.** New optional Sanity fields sit in the asset's "Release"
  group:
  - `version`, `releaseStatus`;
  - `adaptationPrompt` — gated like `prompt`: only its length and first two
    lines are queried;
  - `verifications[]`.

  The Studio was redeployed with them. The graph draws only the parts a kit
  has, and "Not yet verified" is said in words.
- **Samples.**
  - The 20 MotionSites references render as marked "Sample" kits on preview
    deployments and local dev only (`lib/v2/samples.ts`).
  - `KL_SAMPLES=1` enables them for a local production build.
  - One of them, Aetheris Voyage, carries made-up release data under an
    "Illustrative — not a real kit" banner.
  - Production renders none of them. Verified by building without the flag.
- **`?theme=light|dark`** shows a theme for one visit without storing it, for
  review links.
- **Fixed on the way:**
  - Search matched the raw `name` field, so verdro (named after its file) was
    unsearchable on the site and over MCP.
  - The header's `backdrop-filter` trapped the fixed-position drawer and search
    dialog. They now portal to the shell.
- **Known, not new:** an unknown `/item/<slug>` streams a `noindex` not-found
  page with HTTP 200, because the route has a loading boundary.

## Current public-site refinement — 2026-09-17

Work is present locally and has **not** been deployed. The local preview runs at
`http://127.0.0.1:3003`.

- The public navigation is Library, Pricing, and Contact. `/how` is archived and
  returns a true 404.
- Collections remain intact for local development, but `/collections` and
  `/collections/[slug]` return a true 404 in production. Saved records remain;
  production account UI no longer links to those routes.
- The homepage wall contains 20 attributed MotionSites visual references beside
  the two Kinetic Layers items with real previews. References have a source link
  and an unavailable state, but never participate in catalogue search, filters,
  counts, downloads, entitlements, or Premium actions.
- Both reference and real-item popups use the same compact two-panel composition.
  Portrait media stays in its stage and can scroll within it; Escape, Back,
  direct item routes, and focus return remain supported.
- Maison Neue is the public UI family outside intentional display headings. The
  layered mark uses the neutral supplied gradient; orange UI and legacy theme
  effects have been removed.
- Framer Motion provides restrained entry, hover, modal, and viewport reveals.
  `prefers-reduced-motion` renders content immediately. The old GSAP visual
  runner is disconnected from redesigned public routes.
- Early access remains free. Founding Membership is a future, non-binding
  $24/month proposal with a confirmation-based interest list; checkout and
  billing remain inactive.

Latest local checks: TypeScript, formatting whitespace, and optimized build
passed. The build still warns that `NEXT_PUBLIC_SITE_URL` falls back to
`http://localhost:3000`; set the production value before a release.

## Planning documents — 2026-09-11

- [Kinetic Layers master plan](docs/KINETIC-LAYERS-MASTER-PLAN.md): the proposed design-kit system, free-adoption strategy, catalogue roadmap, and later paid offers.
- [Live UI review](docs/KINETIC-LAYERS-UI-REVIEW.md): visual findings from the homepage, library, and item experience, including reproduced mobile header overflow.
- [Competitor brief](docs/COMPETITORS.md) (2026-09-24): GetLayers, MotionSites and six adjacent products, with prices read from their live sites. It supersedes the master plan's 09-10 landscape table. It also flags that the unreleased homepage wall hotlinks all 20 references from MotionSites' own servers.

These are saved plans and review findings. The 2026-09-17 refinement above
records the local implementation that supersedes them where they conflict.

## Where things stand — 2026-09-10

**Branding.** The product is **Kinetic Layers**, at **kineticlayers.com**. The
rename is done. What still reads "kiln" is deliberate: applied migration
filenames (renaming one breaks Supabase's ledger), the archived demand test, the
GitHub repo slug, and historical notes about the retired palette.

**Hosting.** Vercel, DNS at Cloudflare. Move to Cloudflare Workers at the first
payment taken — Vercel Hobby forbids commercial use.

**Media is on Cloudflare now, end to end.** This changed; older notes saying
"Pages, not R2" are wrong.

```
media.kineticlayers.com  →  Worker (workers/media)  →  R2 kinetic-layers-preview
                            + /cdn-cgi/ transformations on the zone
```

The Worker is pull-through: the first request for a file fetches it from Sanity,
stores it in R2 and serves it; every request after is R2 plus edge cache. There
is no backfill step and no window where a document points at bytes that are not
there. Transformations are enabled for the zone, so `img()`, `clip()` and
`frame()` in `lib/kl/media.ts` emit `/cdn-cgi/` URLs — which is also how a
video-only asset gets a poster: Cloudflare cuts a still out of the clip
(`mode=frame`), so nobody has to upload one.

Live check on 2026-09-10: 50 `/cdn-cgi/` URLs on `/library`, **zero**
`cdn.sanity.io` references, a 9.4 KB JPEG poster generated from a 16 MB video.

**The catalogue moved to Sanity uploads.** The asset form went from twenty
fields to twelve; five taxonomies collapsed into one `tags` list; `media` and
`clip` are either-or so video-only works. **Tags are `tag` documents now**, not
strings — 33 seeded, 12 marked `featured`, which is what the library offers as
filters. `tools/seed-tags.mjs` plants them and is safe to re-run.

**Email works.** Resend has kineticlayers.com verified (DKIM, SPF and the
feedback MX live in Cloudflare DNS), and Supabase points its SMTP at Resend. That
was the launch blocker and it is cleared — though see Outstanding: nobody has
watched a confirmation arrive end to end.

**OAuth is off, and now says nothing rather than lying.** Google and GitHub are
both disabled on the project. The join page reads Supabase's live settings and
renders only providers that are actually on, so today it shows email alone.

**The account has a door.** `/account` is a layout with four sections —
Dashboard, Downloads, Profile, Billing — and the header carries an avatar menu
when someone is signed in. `profiles.display_name` is settable for the first
time since the column was created.

**Tooling.** `graphify-out/` holds the code graph: 1228 nodes, 2442 edges, 91
communities over 216 files. Rebuild with `graphify update .`.

## What it is

A marketplace for AI design assets — prompts, templates, 3D scenes, workflows.
Free tier plus a Premium subscription. Next.js 15 App Router, TypeScript.

- **Repo** `github.com/anilandcode/direction-kit` (private)
- **Live** https://kineticlayers.com — Vercel project `direction-kit`
- **Local** `~/Projects/direction-kit` — **not** in Google Drive. It was, and the
  Drive mount broke builds with `ECANCELED`. Do not move it back.

## Who owns what

```
Sanity  8vxxthrc/production   the catalogue: assets, collections, drops, tags,
                              prices. Reads need SANITY_API_READ_TOKEN — see
                              trap 20.
Cloudflare R2                 kinetic-layers-preview  public previews, fronted
                              by the Worker at media.kineticlayers.com
                              kinetic-layers-assets   PRIVATE, gated downloads.
                              Must never carry a custom domain — see trap 19.
Supabase ubftlspopkfwwazwsinv auth, profiles, entitlements, downloads, saves,
                              api_keys, usage.
Resend                        transactional mail, and Supabase's SMTP.
```

## The rules, in one place each

Do not write a second copy of any of these.

| Rule                  | Where                                                  |
| --------------------- | ------------------------------------------------------ |
| May they have it      | `lib/kl/gate.ts` — `canDownload`, `canReadPrompt`      |
| How often             | `lib/kl/quota.ts` + `lib/kl/limits.ts`                 |
| Who are they          | `lib/kl/viewer.ts` (cookies), `lib/kl/apikey.ts` (MCP) |
| Where media lives     | `lib/kl/media.ts` — one env var swaps the host         |
| Which providers exist | `lib/supabase/providers.ts` — read, never hardcoded    |

**Prompts and files are different resources.** `canReadPrompt` lets an anonymous
visitor read a free asset's prompt; `canDownload` does not let them take a file.

**Four doors lead to a prompt** and they share one budget: the item page,
`CardCopy` on a library card, `/api/download`, and the MCP `get_prompt` tool.

## Allowances

```
              prompts/day   downloads/day
anonymous          1              0
free               5              3
premium           50             30
```

Rolling 24h, not calendar day. `LIMITS` in `lib/kl/limits.ts` is read by the
routes that enforce it _and_ the pricing page that promises it, so the printed
number and the enforced number cannot drift.

## Traps

Each of these cost real time. They are not hypothetical.

1. **Never let CSS hide content that only JS can restore.** A CSS rule hid
   `[data-hero] > *` at `opacity: 0` for GSAP to reveal. When the motion layer
   did not finish, the entire sign-in form was invisible — permanently.
2. **Contrast audits must cover control boundaries, not just text.** A sweep
   reported "zero failures" on a form whose field borders were 1.24:1.
3. **`/item/[slug]` is load-bearing externally** — sitemap, MCP tool output, OG
   image, every `?next=` redirect. The overlay is an intercepting route at
   `app/@modal/(.)item/[slug]`, so a click inside the app opens a panel and a
   refresh or a crawler gets the real page. The full page must keep working.
4. **The old motion layer is gone.** It intercepted `a[data-nav]` in the capture
   phase and `stopPropagation`d, so a React `onClick` on a card never fired.
5. **Removing a filter leaves links pointing at it.** A link to a param nobody
   reads silently shows everything, which is worse than no link.
6. **`gsap.context().revert()` restores the pre-animation state**, so a badly
   timed cleanup puts elements back to `opacity: 0`.
7. **Test by calling the route, not by reading the code.** The paywall refused
   correctly for weeks while granting nothing — `getPromptBody` had zero callers.
8. **`usage` is a reserved-ish table name** but works through PostgREST. The
   Supabase pooler can take ~7s cold; `/account` looks hung and is not.
9. **A limit read in one statement and written in another is not a limit.** Ten
   concurrent requests on an allowance of one were granted three _in production_.
   Everything that spends an allowance goes through `consume_quota()`.
10. **A limiter must fail closed.** The old code granted access when the count
    query errored.
11. **Two scripts that agree by counting are not in step.** Any pair that must
    agree should share a source, not a number.
12. **Check images actually decoded**, not just that the page rendered.
    `img.complete && img.naturalWidth === 0` is the test.
13. **Never gate a filter row on its own facet if it also carries controls.**
14. **Browsing lives at `/library`, not `/`.**
15. **`${x}` in JSX is a literal dollar sign plus an expression.**
16. **A success message must describe what happened, not what was intended.**
17. **Check the legal pages against the code, not against the plan.**
18. **Entitlement has exactly one decision point.** `getViewer` is the only place
    `premium` is set. A second rule that also grants access is a second rule to
    forget when the paywall comes back.

The rest were learned on 2026-09-09/10.

19. **A public hostname on the gated bucket is the paywall gone.**
    `media.kineticlayers.com` was attached to `kinetic-layers-assets` — the
    PRIVATE bucket — because the preview bucket did not exist yet and it was the
    only one in the list. An R2 custom domain makes a bucket publicly readable.
    Nothing of value leaked (six sub-1 KB placeholders), and it is corrected, but
    that bucket must never carry a custom domain again.
20. **Anonymous Sanity reads do not return newly created document types.** The
    dataset's `aclMode` is `public` and this client sent no token for months,
    which held only because every type predated the problem. Adding `tag` broke
    it: authenticated reads see all 33, anonymous sees zero, and so does a
    throwaway type created to test it. Deploying the schema changes nothing.
    `SANITY_API_READ_TOKEN` is the fix; without it every tag dereferences to
    nothing and the Category menu is empty.
21. **`signInWithOAuth` never asks whether the provider exists.** It composes the
    authorize URL locally and returns it with no error, so a guard written
    against `error || !data.url` can never fire. The visitor finds out by being
    handed Supabase's raw 400 JSON. Ask `/auth/v1/settings` instead.
22. **Supabase falls back to the Site URL when `redirect_to` is not
    allowlisted** — silently. The exchange lands on `/` carrying a `?code=`
    nothing reads, and the sign-in evaporates with no error anywhere. The
    middleware forwards a stray code to `/auth/callback`, but the allowlist is
    the real fix.
23. **In GROQ, an array of nulls is not null.** `tags[]->title` over legacy
    _string_ tags yields `[null, null, …]`, which `coalesce` passes straight
    through — `list_categories` returned `"null (78)"`. Filter on
    `defined(@->title)`.
24. **An inline `height` silently overrides `aspect-ratio`.** Both the card and
    the item panel computed a pixel height from the aspect and then clamped it,
    so wide and tall media landed in the same band and got cropped. Set
    `--kl-aspect` and let the ratio do it.
25. **A scroll-scrubbed animation inside a modal never scrubs.** The download
    deck was unstacked by a ScrollTrigger reading the window, but the overlay
    scrolls `.kl-modal-veil`. The rows sat frozen mid-skew and read as a broken
    layout, because functionally that is what a scroll animation with no scroll
    is.
26. **A parallel route slot with no `loading.tsx` suspends the whole route.**
    `app/@modal/(.)item/[slug]` had none, so an intercepted click fell up to the
    root loader and replaced the entire page — the panel then opened over a blank
    screen, which looked like the veil failing to blur. It was not: there was
    nothing behind it to blur.
27. **`[data-kl]` does not redefine every legacy token.** `.legacy-skel` paints
    with `--surface`, which resolves to `#141412` inside the new shell — black
    bars on the paper ground. Check what a borrowed class actually resolves to
    before reusing it across palettes.
28. **A hidden Browser pane defers hydration and withholds IntersectionObserver.**
    It produces a perfect imitation of broken code: no React fibers below
    `<body>`, a stale `loading.tsx` shell beside real content, zero `<video>`
    elements, `document.hasFocus()` false so `.focus()` does not land, and
    `getBoundingClientRect()` returning zeros. Check `document.visibilityState`
    before believing any DOM probe. This cost hours twice.

## Outstanding

Kinetic Layers is **free while `NEXT_PUBLIC_EARLY_ACCESS=1`**. An account is the
entitlement; Stripe and `entitlements` are untouched, so turning the flag off
restores the paywall exactly as it was.

**Needs the account owner:**

1. **Supabase → Authentication → URL Configuration.** Site URL is still
   `http://localhost:3000`, which is what caused trap 22. Set it to
   `https://kineticlayers.com` and allowlist `/auth/callback` and `/auth/confirm`
   on both that origin and localhost.
2. **Tag the assets.** Every Category count reads 0. The 15 dummy assets carry
   old _string_ tags that no longer resolve, so they show none; delete them and
   tag the real ones in the Studio.
3. **Confirm a real signup end to end.** Resend is verified and SMTP is
   configured, but nobody has watched a confirmation mail arrive and complete.
4. **DMARC** — one record, `TXT _dmarc` → `v=DMARC1; p=none;`.
5. **Google / GitHub OAuth**, if wanted. Callback
   `https://ubftlspopkfwwazwsinv.supabase.co/auth/v1/callback`. The buttons
   reappear on their own within five minutes of enabling.
6. **The Sanity revalidation webhook.** `sanity hook list` returns nothing, so an
   edit appears when the fetch's own hour expires. See `docs/adding-an-asset.md`.
7. **Production `ADMIN_TOKEN` is 11 characters**, and it guards
   `/api/admin/grant`.
8. **The R2 token is Admin Read & Write on all buckets.** Narrow it to Object
   Read & Write on the two it needs.
9. **The legal pages are drafts** and say so on the page. Review before charging.

**Known hazard, not yet bitten:**
`supabase/migrations/20260907130000_premium_contract.sql` is deliberately unrun —
its own header says so. If `entitlements.plan` still holds `'unlimited'`,
`lib/kl/viewer.ts` tests for `'premium'` and returns `premium: false` for a
paying customer. `EARLY_ACCESS=1` masks it today; `/account/billing` will make it
visible the moment early access ends.

## Commands

```bash
npm run dev                                        # local
npm run build                                      # production build
npm run studio                                     # Sanity Studio at :3333
npm run studio:deploy                              # publish to kineticlayers.sanity.studio
node --env-file=.env.local tools/seed-tags.mjs     # plant the tag vocabulary
node --env-file=.env.local tools/import-asset.mjs ./incoming/x --dry-run
node tools/optimize-clip.mjs clip.mp4              # trim + poster, ~2 MB
npx wrangler deploy --config workers/media/wrangler.jsonc
graphify update .                                  # refresh the code graph
npx vercel --prod
```

Demo accounts: `demo@kineticlayers.com` (free) and `demo.pro@kineticlayers.com`
(premium). Passwords are **deliberately not written here** — the previous one
was, which put it in git history permanently and is what made rotation necessary
rather than optional.

## Conventions

- Verification means driving the running app or calling the route and asserting
  on what comes back. Reading the code is not verification.
- Comments explain _why_, especially where the obvious approach was wrong.
- URL is the filter state, so a filtered view is shareable and back works.
- The catalogue's counts are counted, never stored.
