# Kinetic Layers

A marketplace for AI design assets: prompts, templates, scenes and workflows,
built in one studio and shipped weekly. Twelve are free; the rest are behind a
subscription.

Next.js App Router · TypeScript · Sanity for content · Supabase for identity,
entitlement and files.

## Who owns what

The split matters, and it is not arbitrary:

```
Sanity          the catalogue — assets, collections, drops, tags, site
                numbers. Uploaded media lives on its CDN; the Worker mirrors it.

Cloudflare R2   kinetic-layers-preview  public previews, served through the
                Worker at media.kineticlayers.com
                kinetic-layers-assets   PRIVATE, the gated downloads

Cloudflare      workers/media — pull-through mirror, plus /cdn-cgi/ image and
Worker          video transformations on the zone

Supabase auth   users, sessions.
Supabase db     profiles, entitlements, downloads, saved items, usage, api_keys.
Resend          transactional mail, and Supabase's SMTP.
```

**Why R2 with a Worker in front.** Making the Studio the upload surface put
every preview on `cdn.sanity.io`, which is metered per plan — and autoplaying
video in a grid is the heaviest possible thing to put on metered bandwidth. The
CMS keeps the upload box; it stops being the CDN.

`workers/media` is pull-through rather than pushed on a webhook: the first
request for a file fetches it from Sanity, stores it in R2 and serves it, and
every request after is R2 plus edge cache. Nothing to backfill, nothing to keep
in step, and no window after a publish where a document points at bytes that are
not there.

Range and HEAD support in that Worker are load-bearing, not polish —
Transformations require an origin to answer both with `Content-Range`, which is
why a cache miss stores the object and re-reads it through R2 instead of
streaming the upstream response back.

**Why not a media SaaS.** Previews are served on every
visit, so bandwidth is the recurring cost, not storage. R2 charges nothing for
egress at any volume; a credit-pooled free tier (Cloudinary and friends) draws
storage, bandwidth and transforms from one budget, so traffic competes with the
library for the same allowance — and on the free plan the penalty for running
out is the account being disabled, not a bill. Both motionsites.ai and
getlayers.ai serve from Cloudflare for the same reason.

Every URL goes through `/cdn-cgi/`, so a visitor gets a right-sized file
whatever was uploaded — crispness comes from asking for 2x the rendered column
(740 on a card, 1400 in the item panel), not from shipping the source. It is
also how a video-only asset gets a still: `mode=frame` cuts one out of the clip,
so nobody uploads a poster.

`lib/kl/media.ts` holds all of it behind `NEXT_PUBLIC_MEDIA_MIRROR`. Off, it
behaves exactly as it did before.

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
  paid asset  → needs an active premium entitlement
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
| `npm run media:upload` | Mirror `public/preview/` into the R2 preview bucket |
| `node --env-file=.env.local tools/seed-tags.mjs` | Plant the tag vocabulary (idempotent) |
| `node tools/optimize-clip.mjs <file>` | Trim a video to a web-sized loop + poster |
| `npx wrangler deploy --config workers/media/wrangler.jsonc` | Deploy the media Worker |
| `graphify update .` | Refresh the code graph in `graphify-out/` |
| `node --env-file=.env.local tools/qa-personas.mjs --create` | Free + premium test accounts |
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
| `SANITY_API_READ_TOKEN` | **Required.** Viewer role. Without it `tag` documents are invisible to the app — see HANDOFF trap 20 |
| `NEXT_PUBLIC_SITE_URL` | `https://kineticlayers.com`. Every auth email link, canonical URL and OG image is built from it |
| `NEXT_PUBLIC_MEDIA_BASE` | `https://media.kineticlayers.com`. Use `/preview` to serve the local folder instead |
| `NEXT_PUBLIC_MEDIA_MIRROR` | `1` routes media through the Worker and `/cdn-cgi/`. `0` behaves as before |
| `NEXT_PUBLIC_EARLY_ACCESS` | `1` makes an account the entitlement. Turning it off restores the paywall untouched |
| `RESEND_API_KEY` / `EMAIL_FROM` | Both needed, or `EMAIL_READY` is false and nothing sends |
| `STORAGE_DRIVER` | `supabase` (default) or `r2` — which bucket holds gated files |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Server and scripts |
| `R2_BUCKET` / `R2_ASSETS_BUCKET` | Public previews / private downloads. Deliberately separate — see HANDOFF trap 19 |

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

1. **Google and GitHub OAuth.** Both are disabled on the project, so the join
   page shows neither — it reads `/auth/v1/settings` and renders only what is
   actually on, rather than offering a door that answers with a 400. Enable one
   in Supabase → Authentication → Providers (callback
   `https://<project>.supabase.co/auth/v1/callback`) and its button reappears
   within five minutes. No redeploy.
2. **Checkout.** No Stripe yet. Entitlement, the gate and the plan states are
   all real; `/api/admin/grant` changes a plan until a webhook can.
3. **Real files.** `tools/seed-storage.mjs` writes honest placeholders so the
   download path runs end to end. Replace the object at the same path in the
   `assets` bucket and the site serves the real thing with no code change.

## How previews load

Grid cards paint a gradient immediately, a poster on top, and a `<video>` with
**no `src` at all** until the card scrolls into view. Then the source attaches,
it plays muted and looping, and on the way out the source is removed and the
element reloaded — which frees the decoded buffer instead of leaving every clip
you scrolled past resident in memory. Reduced motion opts out entirely.

Autoplay replaced hover because the reference sites do it, checked rather than
assumed: getlayers.ai ships 51 `<video>` tags, every one `autoplay` and
`preload="none"`, and not one with a `src` attribute. A code comment here
claimed the opposite for months.

The poster is not necessarily uploaded. A video-only asset gets one cut from the
clip by Cloudflare — a 16 MB source produced a 9.4 KB JPEG.

Measured on the live site, not assumed:

```
/library       50 /cdn-cgi/ URLs · 0 references to cdn.sanity.io
               media.kineticlayers.com cold 5.5s (pulling from Sanity), warm 248ms
frame poster   200 image/jpeg · 9,403 bytes, generated from the clip
range request  bytes=0-99 → 206 with a correct Content-Range; HEAD → 200
gated key      /placeholder/maps.zip → 404, and path traversal → 404
```

## Verified

Build clean, 50 routes. Across `/`, `/docs`, `/mcp`, `/privacy`, `/terms`,
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

The library rail is a type row plus three menus — Category, Sort, Pricing —
down from ~44 chips. Counts are verified against the rows their filter returns:
`?price=free&sort=name` gives 6 of 17, every card carrying the Free badge, in
alphabetical order. The Category menu lists the curated vocabulary from Sanity
including tags nothing carries yet, shown with a `0` and rendered as text rather
than a link, so nothing offers a click that can only land on the empty state.

The ⌘K palette traps Tab in both directions, restores focus to the trigger on
close, and announces its result count.


## Archive

`app/_archive-direction-kit/` holds the earlier Direction Kit demand test. It is
not routed — the underscore keeps it out of the router — and its Supabase API
routes (`/api/subscribe`, `/api/event`) still work.
