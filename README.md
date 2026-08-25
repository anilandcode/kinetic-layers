# Kiln

A marketplace for AI design assets: prompts, templates, scenes and workflows,
built in one studio and shipped weekly. Twelve are free; the rest are behind a
subscription.

Next.js App Router · TypeScript · Sanity for content · Supabase for identity,
entitlement and files.

## Who owns what

The split matters, and it is not arbitrary:

```
Sanity          the catalogue — assets, collections, drops, site numbers.
                Public dataset, edited in the Studio, no token needed to read.

Supabase auth   users, sessions, OAuth.
Supabase db     profiles, entitlements, downloads, saved items.
Supabase store  the actual downloadable files. PRIVATE bucket, signed URLs.
```

**Why the files are not in Sanity.** Sanity's asset CDN is public by URL. The
paywall is the product, so a gated file has to sit behind something that can
check entitlement per request. Previews are public and belong on Sanity's CDN;
downloads are not, and live in a private Supabase bucket that only
`/api/download` can open — after it re-checks the gate.

## The gate

One function decides, in `lib/kiln/viewer.ts`:

```
canDownload(viewer, asset)
  free asset  → needs any account
  paid asset  → needs an active unlimited entitlement
```

The item page asks it to decide which of three states to draw. `/api/download`
asks it again before signing anything. A hidden button is not a paywall — the
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
| `node tools/seed-storage.mjs` | Put placeholder files in the private bucket |
| `node tools/apply-migration.mjs <file.sql>` | Apply a migration directly over Postgres |

The Studio is a **dev dependency**, not part of the app bundle. It used to be
mounted at `/studio`, which pulled ~800 MB of Sanity into the build and clashed
with React 19.2 over `useEffectEvent`. Hosting it separately removed both
problems and the app keeps only the read client.

## Environment

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `b0s07szo` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_REVALIDATE_SECRET` | Shared with the Sanity webhook |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Safe to ship** — RLS protects the data, not the key |
| `SUPABASE_SECRET_KEY` | Server only. Bypasses RLS. Used for grants, signing and the legacy routes |
| `SUPABASE_DB_PASSWORD` | Only for `tools/apply-migration.mjs` |
| `KILN_ADMIN_TOKEN` | Guards `/api/admin/grant` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Offered when a form fails to send |

Without the Supabase keys the site still renders: the catalogue is public, and
every auth path reports that accounts are not connected rather than throwing.
That is deliberate — a missing key should not take down a page that had no need
of a user.

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

## Verified

Build clean, 36 routes. Across `/`, `/light`, `/item/[slug]`, `/collections`,
`/collections/[slug]`, `/account`, `/join`, `/pricing`, `/plan` and
`/design-system`, at 375 and 1600: zero contrast failures, no horizontal
overflow, no unreachable controls, zero external requests.

The gate was tested by calling `/api/download` directly, not by looking at the
UI: free and paid assets both refused without a session, unknown slug 404s, and
an unsigned read of the Storage bucket is rejected.

## Archive

`app/_archive-direction-kit/` holds the earlier Direction Kit demand test. It is
not routed — the underscore keeps it out of the router — and its Supabase API
routes (`/api/subscribe`, `/api/event`) still work.
