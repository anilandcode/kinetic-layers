# Kinetic Layers

A marketplace for AI design assets: prompts, templates, scenes and workflows,
built in one studio and shipped weekly. Twelve are free; the rest are behind a
subscription.

Next.js App Router · TypeScript · Sanity for content · Supabase for identity,
entitlement and files.

## Who owns what

The split matters, and it is not arbitrary:

```
Sanity          the catalogue — assets, collections, drops, site numbers,
                and the *paths* of preview media. No binaries.

Cloudflare      preview posters and looping clips, on Pages at
Pages           kiln-media.pages.dev. Public, unlimited bandwidth, free.

Supabase auth   users, sessions, OAuth.
Supabase db     profiles, entitlements, downloads, saved items.
Supabase store  the actual downloadable files. PRIVATE bucket, signed URLs.
```

**Why Pages and not R2.** R2 was the first choice and is still the better
long-term home — it is object storage, so uploads are per-object rather than a
folder redeploy. But enabling R2 requires a payment method on the account even
for the free tier, and Pages does not. Pages free serves unlimited bandwidth
from the same CDN, caps at 20,000 files and 25 MiB each (this catalogue is 134
files at ~30 KB), and needs no card. `NEXT_PUBLIC_MEDIA_BASE` is the only thing
that would change if you move to R2 later.

**Why not a media SaaS.** Previews are served on every
visit, so bandwidth is the recurring cost, not storage. R2 charges nothing for
egress at any volume; a credit-pooled free tier (Cloudinary and friends) draws
storage, bandwidth and transforms from one budget, so traffic competes with the
library for the same allowance — and on the free plan the penalty for running
out is the account being disabled, not a bill. Both motionsites.ai and
getlayers.ai serve from Cloudflare for the same reason.

Derivatives are baked once at upload with ffmpeg, so there is no transformation
CDN in the request path. `lib/kl/media.ts` resolves a stored path against
`NEXT_PUBLIC_MEDIA_BASE`; moving hosts is one environment variable.

**Why the files are not in Sanity.** Sanity's asset CDN is public by URL. The
paywall is the product, so a gated file has to sit behind something that can
check entitlement per request. Previews are public and belong on Sanity's CDN;
downloads are not, and live in a private Supabase bucket that only
`/api/download` can open — after it re-checks the gate.

## MCP

`app/api/mcp/route.ts` speaks MCP over streamable HTTP: `search_assets`,
`get_prompt`, `list_categories`. Setup is documented at `/mcp`.

It is not a second door. `get_prompt` asks the same `canDownload` the item page
and `/api/download` ask, so a key on the free plan is refused a paid prompt
exactly as the website refuses it. Auth is an API key because an agent has no
cookies; only the SHA-256 hash is stored, and the plaintext is shown once.

## The gate

One function decides, in `lib/kl/viewer.ts`, and **both** halves of the gate
ask it — `/api/download` for the files and `/api/prompt` for the text. There is
deliberately no second copy of the rule, because for a while there was no
second *caller*: the gate refused correctly and granted nothing, so a paying
subscriber saw the same two-line preview as a stranger.

```
canDownload(viewer, asset)
  free asset  → needs any account
  paid asset  → needs an active unlimited entitlement
```

The item page asks it to decide which of three states to draw. `/api/download`
and `/api/prompt` each ask it again before releasing anything. A hidden button is not a paywall — the
route is what actually stops a file walking out, and it never trusts the client
beyond the slug.

`entitlements` is readable by its owner and writable only by the server.
`/api/admin/grant` is the seam Stripe's webhook will replace.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | The site |
| `npm run build` | Production build |
| `npm run studio` | Sanity Studio, locally |
| `npm run studio:deploy` | Publish the Studio to `<project>.sanity.studio` |
| `npm run seed` | Re-seed the catalogue from `tools/seed-sanity.mjs` |
| `npm run media` | Generate dummy posters + clips into `public/preview/` |
| `npm run media:deploy` | Push `public/preview/` to Cloudflare Pages |
| `npm run media:upload` | Mirror `public/preview/` into an R2 bucket (unused) |
| `node --env-file=.env.local tools/qa-personas.mjs --create` | Free + unlimited test accounts |
| `node tools/seed-storage.mjs` | Put placeholder files in the private bucket |
| `node tools/apply-migration.mjs <file.sql>` | Apply a migration directly over Postgres |

The Studio is a **dev dependency**, not part of the app bundle. It used to be
mounted at `/studio`, which pulled ~800 MB of Sanity into the build and clashed
with React 19.2 over `useEffectEvent`. Hosting it separately removed both
problems and the app keeps only the read client.

## Environment

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `8vxxthrc` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_REVALIDATE_SECRET` | Shared with the Sanity webhook |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Safe to ship** — RLS protects the data, not the key |
| `SUPABASE_SECRET_KEY` | Server only. Bypasses RLS. Used for grants, signing and the legacy routes |
| `SUPABASE_DB_PASSWORD` | Only for `tools/apply-migration.mjs` |
| `ADMIN_TOKEN` | Guards `/api/admin/grant` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Offered when a form fails to send |
| `NEXT_PUBLIC_MEDIA_BASE` | `https://kiln-media.pages.dev`. Use `/preview` to serve the local folder instead |
| `R2_*` | Upload script only. The app never talks to R2, it only builds URLs |

Without the Supabase keys the site still renders: the catalogue is public, and
every auth path reports that accounts are not connected rather than throwing.
That is deliberate — a missing key should not take down a page that had no need
of a user.

## Known placeholder

The catalogue is 15 invented assets with fabricated specs, and the files in
Storage are text placeholders that say so when you open them. Every seam around
them is real — swapping in genuine prompts, files and renders is a content job
with no code changes. `/license` is a plain-English draft that has **not** been
through legal review, and says so on the page.

## Still to wire

1. **Google and GitHub OAuth.** The buttons are built and say so plainly until
   configured. Create the app on each provider, set the callback to
   `https://<project>.supabase.co/auth/v1/callback`, and paste the client ID and
   secret into Supabase → Authentication → Providers.
2. **Checkout.** No Stripe yet. Entitlement, the gate and the plan states are
   all real; `/api/admin/grant` changes a plan until a webhook can.
3. **Real files.** `tools/seed-storage.mjs` writes honest placeholders so the
   download path runs end to end. Replace the object at the same path in the
   `assets` bucket and the site serves the real thing with no code change.

## How previews load

Grid cards render a gradient immediately, a lazy WebP poster on top, and a
`<video>` with **no `src` at all** until someone reaches for it. On the item
page one clip plays on purpose, which is also the only way a phone sees motion —
the grid withholds video from coarse pointers entirely, and from anyone who
asked for reduced motion.

Measured on the built site, not assumed:

```
/ at 1600      15 cards · 15 videos, all with an empty src · 0 video requests
               15 posters, all from kiln-media.pages.dev · 267 KB total page
               0 requests to the local /preview folder — genuinely on the CDN
hover one card exactly 1 video request, that card's clip, then it plays
/ at 375       0 <video> elements rendered at all · 0 video requests
/item/[slug]   hero clip autoplays · 4 real thumbnails · 413 KB
```

## Verified

Build clean, 46 routes. Across `/`, `/docs`, `/mcp`, `/privacy`, `/terms`,
`/license`, `/changelog`, `/collections`, `/pricing` and `/item/[slug]`, at 375
and 1600 **on production**: zero contrast failures, no horizontal overflow, no
image missing an `alt`, exactly one `h1` per page and no heading skipped.

The gate is tested by calling both routes as each persona, on the website and
over MCP, and by checking what comes **back** rather than only what is refused:

```
                       anonymous   free plan     unlimited
/api/prompt  free        401         200          200
/api/prompt  paid        401         403          200
/api/download free       401         200 signed   200 signed
/api/download paid       401         403          200 signed
MCP get_prompt free      refused     903 chars    903 chars
MCP get_prompt paid      refused     refused      917 chars
```

Revoked and forged API keys are refused. Unknown slugs 404 everywhere.

Filter counts are verified against the rows their filter returns — all eleven
category and theme chips match. "Newest" leads with a different asset than
"A–Z", so the two orderings genuinely differ. Related assets differ per asset
and each really is drawn from that asset's own drop.

Media: 15 videos on the home page, all with an empty `src`, zero video requests
on load, exactly one on hover, posters from `kiln-media.pages.dev`.

The ⌘K palette traps Tab in both directions, restores focus to the trigger on
close, and announces its result count.


## Archive

`app/_archive-direction-kit/` holds the earlier Direction Kit demand test. It is
not routed — the underscore keeps it out of the router — and its Supabase API
routes (`/api/subscribe`, `/api/event`) still work.
