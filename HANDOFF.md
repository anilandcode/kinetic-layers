# Kinetic Layers — handoff

State as of commit `79a2a60` on branch `fix/signup-and-email`. Read this before
changing anything; it records the decisions and the traps, not the code.

## Where the last session left off — 2026-09-07

**Branding.** The product is now **Kinetic Layers**, at **kineticlayers.com**.
The rename is **done**. Code, copy and identifiers all say Kinetic Layers. What
still reads "kiln" is deliberate: applied migration filenames (renaming one
breaks Supabase's ledger), the archived demand test, the GitHub repo slug, the
and historical notes about the retired palette.

**Hosting.** Staying on **Vercel** for now. DNS at Cloudflare, unproxied (grey
cloud) — the certificate will not issue behind the orange cloud. Move to
Cloudflare Workers ($5/mo, already proven on the `cloudflare-workers` branch) at
the first payment taken, because Vercel Hobby forbids commercial use. Media stays
on **Cloudflare Pages**: the pipeline pre-bakes every derivative, so there is no
transformation CDN in the path and Cloudinary would bill credits for a capability
that was designed out. R2 later, when the library outgrows deploy-the-whole-folder.

**Done on this branch.** Auth email links no longer derive their origin from the
`x-forwarded-host` request header — a real vulnerability, since a genuine
Supabase password-reset mail could be pointed at an attacker's domain. All four
call sites now build from `SITE_URL` in `lib/kl/site.ts`. Verified: production
build passes, canonical / og:url / og:image / sitemap all read
`https://kineticlayers.com`, and a forged `X-Forwarded-Host: evil.example`
changes nothing.

**Blocked on the account owner.** Signup is still broken for most visitors and
no code change fixes it. Supabase is on its built-in SMTP, roughly 2-3 mails an
hour, so people get "check your email" and no email. Needs, in order: a Resend
account with kineticlayers.com verified by DNS (DNS-only records); Supabase
custom SMTP pointed at Resend; `https://kineticlayers.com/**` allowlisted under
Supabase → Authentication → URL Configuration; then `RESEND_API_KEY`,
`EMAIL_FROM` and `NEXT_PUBLIC_SITE_URL` set in Vercel. Stopgap if Resend stalls:
turning off "Confirm email" makes signup work immediately, but leaves password
reset broken.

**Still untested end to end**, once the above lands: real signup on a preview
deploy, password reset opening `/reset-password` signed in, and
`POST /api/subscribe` sending rather than falsely succeeding.

**Tooling.** The repo now carries a graphify code graph — see `CLAUDE.md`.

## What it is

A marketplace for AI design assets — prompts, templates, 3D scenes, workflows.
Free tier plus an unlimited subscription. Next.js 15 App Router, TypeScript.

- **Repo** `github.com/anilandcode/direction-kit` (private)
- **Live** https://kineticlayers.com — Vercel project `direction-kit`,
  linked, env vars set for production/preview/development
- **Local** `~/Projects/direction-kit` — **not** in Google Drive. It was, and the
  Drive mount broke builds with `ECANCELED`. Do not move it back.

## Who owns what

```
Sanity  8vxxthrc/production   the catalogue: assets, collections, drops,
                              prices. Public dataset, no token to read.
Cloudflare Pages              preview posters and clips, kinetic-layers-media.pages.dev.
                              Unlimited bandwidth, no card. NOT R2 — enabling
                              R2 needs a payment method, Pages does not.
Supabase ubftlspopkfwwazwsinv auth, profiles, entitlements, downloads, saves,
                              api_keys, usage. Private `assets` bucket for
                              gated files, signed per request.
```

## The rules, in one place each

Do not write a second copy of any of these.

| Rule | Where |
| --- | --- |
| May they have it | `lib/kl/gate.ts` — `canDownload`, `canReadPrompt` |
| How often | `lib/kl/quota.ts` + `lib/kl/limits.ts` |
| Who are they | `lib/kl/viewer.ts` (cookies), `lib/kl/apikey.ts` (MCP) |
| Where media lives | `lib/kl/media.ts` — one env var swaps the host |

**Prompts and files are different resources.** `canReadPrompt` lets an
anonymous visitor read a free asset's prompt; `canDownload` does not let them
take a file. Reading is cheap, serving files is not.

**Four doors lead to a prompt** and they share one budget: the item page,
`CardCopy` on a library card, `/api/download`, and the MCP `get_prompt` tool. A
per-route counter is four allowances wearing a trenchcoat.

## Allowances

```
              prompts/day   downloads/day
anonymous          1              0
free               5              3
unlimited         50             30
```

Rolling 24h, not calendar day. `LIMITS` in `lib/kl/limits.ts` is read by the
routes that enforce it *and* the pricing page that promises it, so the printed
number and the enforced number cannot drift. Change it there and both move.

## What works, verified by driving it

Auth (password, magic link, reset, session across refresh), the paywall matrix
across all four doors, RLS isolation, quotas with 429 + `Retry-After`, MCP with
API keys, media lazy-loading, SEO/OG/sitemap, 47 routes building clean, contrast
and overflow clean at 375 and 1600.

## Traps

Each of these cost real time. They are not hypothetical.

1. **Never let CSS hide content that only JS can restore.** A CSS rule hid
   `[data-hero] > *` at `opacity: 0` for GSAP to reveal. When the motion layer
   did not finish, the entire sign-in form was invisible — permanently. Entrance
   animation is now a CSS keyframe with `both`. Do not reintroduce the pattern.
2. **Contrast audits must cover control boundaries, not just text.** A sweep
   reported "zero failures" on a form whose field borders were 1.24:1 and
   effectively invisible. `--field-line` exists for that; WCAG wants 3:1.
3. **`/item/[slug]` is load-bearing externally** — sitemap, MCP tool output, OG
   image, every `?next=` redirect. The popup the design asks for is an
   intercepting route at `app/@modal/(.)item/[slug]`, so a click inside the app
   opens an overlay and a refresh, a shared link or a crawler gets the real
   page. The earlier objection — that changing the address bar reads as a new
   page — had it backwards: back closes the overlay, and the URL someone copies
   is the one the sitemap already publishes. `AssetModal` and its `data-card`
   delegation are gone. The full page must keep working untouched.
4. **The old motion layer is gone.** It intercepted `a[data-nav]` in the capture
   phase and `stopPropagation`d, so a React `onClick` on a card never fired —
   and it faded pages to near-black before navigating, which on the warm ground
   was a flash. Nothing binds `data-nav` now. `lib/kl/motion.ts` keys off
   `[data-nav-link]` and never swallows a handler.
5. **Removing a filter leaves links pointing at it.** A link to a param nobody
   reads silently shows everything, which is worse than no link.
6. **`gsap.context().revert()` restores the pre-animation state**, so a badly
   timed cleanup puts elements back to `opacity: 0`.
7. **Test by calling the route, not by reading the code.** The paywall refused
   correctly for weeks while granting nothing — `getPromptBody` had zero
   callers. A gate that only refuses is half-tested.
8. **`usage` is a reserved-ish table name** but works fine through PostgREST.
   The Supabase pooler can take ~7s cold; `/account` looks hung and is not.
9. **A limit read in one statement and written in another is not a limit.**
   The quota counted, then inserted. Ten concurrent requests on an allowance
   of one were granted three *in production*. Serverless removes any
   in-process fix: parallel requests land on different instances. Everything
   that spends an allowance goes through `consume_quota()`, which does both
   inside one transaction behind an advisory lock. Do not add a second path.
10. **A limiter must fail closed.** The old code granted access when the
   count query errored. "The database is struggling" is exactly when an
   attacker wants the door open, and inducing errors becomes the bypass.
11. **Two scripts that agree by counting are not in step.** `seed-sanity.mjs`
   wrote four shots per asset; `make-dummy-media.mjs` made three. Every asset
   shipped a 404ing thumbnail. The generator now reads the poster names out of
   the documents. Any pair of scripts that must agree should share a source,
   not a number.
12. **Check images actually decoded, not just that the page rendered.** The
   broken thumbnail survived several sweeps because nothing was visibly wrong
   above the fold. `img.complete && img.naturalWidth === 0` is the test.
13. **Never gate a filter row on its own facet if it also carries controls.**
   The tone row drew only when more than one tone existed. On four of the
   eight type tabs every asset shares a tone, so the row vanished — and took
   Favourites and Clear all with it: the controls that undo a filter
   disappeared exactly when a filter was on. A row must also draw whenever its
   own filter is set, or an active filter has nothing to switch it off.
14. **Browsing lives at `/library`, not `/`.** Home is a landing page: hero,
   stats, the newest eight, drops. `/collections` is a different entity —
   bundles, filtered by shelf — and deliberately shares no filter vocabulary
   with the library.
15. **`${x}` in JSX is a literal dollar sign plus an expression**, not a
   template placeholder. The closing headline shipped reading "$5 are free.
   The other $10 are $24 a month."
16. **A success message must describe what happened, not what was intended.**
   /api/subscribe answered "Thanks — you are on the list" while no provider
   was configured and no list existed — a silent no-op wearing a success
   message. Every path in lib/kl/email.ts now either sends or says plainly
   that it did not, and the library's card renders the server's wording
   instead of hardcoding its own.
17. **Check the legal pages against the code, not against the plan.**
   /privacy promised "Every one of those emails can unsubscribe you" for weeks
   before an unsubscribe existed. A page describing intent is a claim you have
   already made to every visitor who read it.
18. **Entitlement has exactly one decision point.** `getViewer` is the only
   place `unlimited` is set, which is why going free was one flag and not a
   rewrite across sixteen files. Keep it that way: a second rule that also
   grants access is a second rule to forget when the paywall comes back.

## Outstanding — needs the account owner

Kinetic Layers is **free while `NEXT_PUBLIC_EARLY_ACCESS=1`** (set in Vercel production).
An account is the entitlement; Stripe and `entitlements` are untouched, so
turning the flag off restores the paywall exactly as it was.

1. **Resend.** Nothing emails until `RESEND_API_KEY` and `EMAIL_FROM` exist.
   Create the account, verify a sending domain, then:
   - Add both to Vercel. The newsletter starts working the moment they land —
     until then /api/subscribe stores the address and says so plainly.
   - Supabase → Project Settings → Authentication → SMTP → point at Resend.
     That fixes signup, password reset and magic links together.
2. **Email confirmation is still ON** and Supabase's built-in SMTP allows ~2–3
   an hour, so signup often fails silently. Until SMTP is configured: Supabase
   → Authentication → Providers → Email → turn **Confirm email** off.
3. **Google / GitHub OAuth** — buttons exist and say they are unconfigured.
   Callback `https://ubftlspopkfwwazwsinv.supabase.co/auth/v1/callback`.
4. **`SANITY_WRITE_TOKEN`** — needed by `tools/import-asset.mjs`. Create at
   sanity.io/manage → API → Tokens, with Editor permission. See
   `docs/adding-an-asset.md`.
5. **The catalogue is 15 invented assets.** Files in Storage are text
   placeholders that say so. `tools/import-asset.mjs` replaces one end to end;
   no code change is needed for real content.
6. **The legal pages are still drafts.** They now describe what the code
   actually does — free access, real unsubscribe, the usage meter — and each
   says on the page that no lawyer has read it. Get them reviewed before
   charging.
7. `sudo chown -R 501:20 ~/.npm` — the npm cache is ~7.8GB and `npm cache
   clean` fails without it.

## Commands

```bash
npm run dev                                        # local
npm run seed                                       # regenerate catalogue NDJSON
npx sanity dataset import /tmp/kl-seed.ndjson production --replace
npm run media                                      # dummy posters + clips (ffmpeg)
npm run media:deploy                               # push media to Cloudflare Pages
node --env-file=.env.local tools/qa-personas.mjs --create   # free + unlimited test users
node --env-file=.env.local tools/apply-migration.mjs <file.sql>
npx vercel --prod --yes
```

Demo accounts, if they still exist: `demo@kiln.build` / `demo.pro@kiln.build`,
password `kiln-demo-2026`.

## Conventions

- Verification means driving the running app or calling the route and asserting
  on what comes back. Reading the code is not verification.
- Comments explain *why*, especially where the obvious approach was wrong.
- URL is the filter state, so a filtered view is shareable and the back button
  works.
- The catalogue's counts are counted, never stored. A settings document holding
  "240 assets" was wrong the day after it was written.
