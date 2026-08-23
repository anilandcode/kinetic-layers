# Direction Kit — demand test

A validation landing page for an original website-layer collection aimed at
agencies. Next.js App Router, TypeScript, plain CSS, Supabase for storage.

**This is a demand test, not the product.** It measures whether agencies want
the collection before any of it is built. Nothing here charges anything.

## Why it exists

Prior research concluded that the reference businesses in this space sell
curated design judgment plus reproducible source and licensing — not AI website
generation — and set a gate before building anything:

1. 15 interviews with agencies and freelancers who ship client sites
2. ≥7 confirming a recurring, costly problem this offer addresses
3. ≥5 making a paid founding commitment

**This build serves the first two.** The third needs a checkout, which is a
deliberate second pass once a legal entity and refund terms exist. Until then
the page collects a non-binding invitation request and says so plainly.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15, App Router, TypeScript |
| Styling | Plain CSS with design tokens — no framework |
| Storage | Supabase Postgres, reached only from server routes |
| Fonts | System stacks — nothing downloaded, zero external requests |
| Images | None. Every visual is inline SVG or CSS |

## Layout

```
app/
  page.tsx                  landing page
  layout.tsx                pre-paint variant assignment
  thanks/ privacy/          secondary pages
  concepts/{slug}/          three live sample sections
  api/subscribe/route.ts    invitation handler
  api/event/route.ts        first-party event sink
components/
  InviteForm.tsx            qualification form
  ClientRuntime.tsx         page view, scroll reveal, click tracking
  graphics.tsx              every SVG on the site
  concepts/                 the three sample sections
lib/
  contracts.ts              shared shapes and validation
  supabase.ts               server client and visitor hashing
styles/                     tokens, site, concept chrome, per-concept CSS
supabase/migrations/        schema
tools/
  readout.mjs               fills the playbook's readout table
  verify-db.mjs             smoke-tests the database
```

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```

Useful commands:

```bash
npm run build                # production build
node tools/verify-db.mjs     # smoke-test the schema
npm run readout              # the demand-test readout table
```

## The A/B test

Two founding prices are tested: $79 (Founding Prompt) and $179 (Founding
Studio). A visitor is assigned once, before first paint, and **never sees both**
— the playbook's rule. Assignment is sticky via a first-party cookie and
localStorage.

`?v=a` or `?v=b` overrides the assignment for QA. The override is never
persisted and flags the pageview as `qa`, so QA traffic is excluded from every
reading.

## Data and privacy

Two tables, both with RLS enabled and **no policies at all** — the anon and
authenticated roles can do nothing. The API routes use the secret key, which
bypasses RLS. No browser ever reaches Postgres.

Qualification (`agency|freelancer` **and** `2-5|6plus` sites shipped) is a
generated column, computed in the database so it cannot drift from whatever the
application believed that day.

The only cookie is `dk_variant`. There is no third-party analytics script. The
stored visitor identifier is a salted, truncated hash of the IP — enough to spot
a bot, not enough to identify a person.

## Deploying to Vercel

Set these in the Vercel project settings:

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SECRET_KEY` | Secret key — **server-only**, never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Offered when a submission fails to send |
| `EMAIL_PROVIDER` | Optional: `mailerlite`, `convertkit` or `buttondown` |
| `EMAIL_API_KEY` | Optional |
| `EMAIL_LIST_ID` | Optional |

## Before it goes live

1. **Buy the domain.** `directionkit.com` and `foundinglayers.com` were both
   available on 23 Aug 2026. Verify again at purchase.
2. **Create the fallback mailbox** named by `NEXT_PUBLIC_CONTACT_EMAIL`. The
   form offers it when a submission fails; it must be a real inbox.
3. **Pick an email provider**, set the three `EMAIL_*` variables, then name the
   provider in `app/privacy/page.tsx` — it currently promises to name one
   before any address is sent anywhere.

## Provenance

The three sample sections carry originality records covering concept, reference
log, asset register and similarity review. Every visual is original: no
photography, no icon set, no webfont, no third-party code, nothing hotlinked.

The dark bento treatment follows a mood the owner supplied as reference. Mood
and technique were taken; nothing else. The reference images leaned on
third-party brand marks and licensed 3D icon sets — none of those appear here
and none were traced or adapted.

## Known limits

- **The three sample sections score 80/100**, below the 85 publishing gate,
  because AI fidelity has not been tested. They are labelled work in progress
  on every page and nothing here is licensed or sold.
- **No screen-reader testing yet.** Contrast is measured on every text-bearing
  element and passes; keyboard operation and the ARIA tabs pattern are verified
  in a browser.
- **Every figure in the samples is invented** for products and clients that do
  not exist, and each section says so on its face.
