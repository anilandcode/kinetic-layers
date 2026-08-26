# Kiln — handoff

State as of commit `406e3fc`. Read this before changing anything; it records the
decisions and the traps, not the code.

## What it is

A marketplace for AI design assets — prompts, templates, 3D scenes, workflows.
Free tier plus an unlimited subscription. Next.js 15 App Router, TypeScript.

- **Repo** `github.com/anilandcode/direction-kit` (private)
- **Live** https://direction-kit.vercel.app — Vercel project `direction-kit`,
  linked, env vars set for production/preview/development
- **Local** `~/Projects/direction-kit` — **not** in Google Drive. It was, and the
  Drive mount broke builds with `ECANCELED`. Do not move it back.

## Who owns what

```
Sanity  8vxxthrc/production   the catalogue: assets, collections, drops,
                              prices. Public dataset, no token to read.
Cloudflare Pages              preview posters and clips, kiln-media.pages.dev.
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
| May they have it | `lib/kiln/gate.ts` — `canDownload`, `canReadPrompt` |
| How often | `lib/kiln/quota.ts` + `lib/kiln/limits.ts` |
| Who are they | `lib/kiln/viewer.ts` (cookies), `lib/kiln/apikey.ts` (MCP) |
| Where media lives | `lib/kiln/media.ts` — one env var swaps the host |

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

Rolling 24h, not calendar day. `LIMITS` in `lib/kiln/limits.ts` is read by the
routes that enforce it *and* the pricing page that promises it, so the printed
number and the enforced number cannot drift. Change it there and both move.

## What works, verified by driving it

Auth (password, magic link, reset, session across refresh), the paywall matrix
across all four doors, RLS isolation, quotas with 429 + `Retry-After`, MCP with
API keys, media lazy-loading, SEO/OG/sitemap, 46 routes building clean, contrast
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
   image, every `?next=` redirect. The modal is an *intercepting* route
   (`app/@modal/(.)item/[slug]`) precisely so the real page survives a refresh.
4. **`KilnMotion` intercepts `a[data-nav]` in the capture phase** and
   `stopPropagation`s. A React `onClick` on a card will never fire. Cards are
   exempted via `data-card`.
5. **Removing a filter leaves links pointing at it.** A link to a param nobody
   reads silently shows everything, which is worse than no link.
6. **`gsap.context().revert()` restores the pre-animation state**, so a badly
   timed cleanup puts elements back to `opacity: 0`.
7. **Test by calling the route, not by reading the code.** The paywall refused
   correctly for weeks while granting nothing — `getPromptBody` had zero
   callers. A gate that only refuses is half-tested.
8. **`usage` is a reserved-ish table name** but works fine through PostgREST.
   The Supabase pooler can take ~7s cold; `/account` looks hung and is not.

## Outstanding — needs the account owner

1. **Email confirmation is ON** and Supabase's built-in SMTP is rate-limited to
   ~2–3/hour. Signup returns "check your email" and often nothing arrives.
   Dashboard → Authentication → Sign In / Providers → Email → turn off *Confirm
   email* for now, and add real SMTP (Resend) before launch — it also fixes
   password reset and magic links.
2. **Google / GitHub OAuth** — buttons exist and say plainly they are
   unconfigured. Callback
   `https://ubftlspopkfwwazwsinv.supabase.co/auth/v1/callback`.
3. **Checkout** — deliberately absent. `/api/admin/grant` is the seam Stripe's
   webhook replaces. Entitlement, the gate and the plan states are all real.
4. **`/license`, `/privacy`, `/terms` are drafts I wrote.** They describe what
   the code actually does and each says on the page that no lawyer has seen it.
   Replace before taking money.
5. **The catalogue is 15 invented assets.** Files in Storage are text
   placeholders that say so. Every seam is real — dropping in genuine content
   needs no code change.
6. `sudo chown -R 501:20 ~/.npm` — the npm cache is ~7.8GB and `npm cache clean`
   fails without it.

## Commands

```bash
npm run dev                                        # local
npm run seed                                       # regenerate catalogue NDJSON
npx sanity dataset import /tmp/kiln-seed.ndjson production --replace
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
