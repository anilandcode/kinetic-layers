# media.kineticlayers.com

R2 in front, Sanity behind. Fills the bucket from `cdn.sanity.io` the first time
anyone asks for a file, then never asks again.

## Why this exists

Uploading previews through the Studio put every one of them on Sanity's asset
CDN, which is metered. Previews are the marketing — they are served on every
visit, and a grid of autoplaying video is the heaviest thing you can put on
metered bandwidth. R2 charges nothing for egress at any volume, so the bytes
belong here and the CMS keeps the upload box.

## Order of operations

Each step is checkable on its own. Do not skip ahead — `NEXT_PUBLIC_MEDIA_MIRROR`
last, because until the first three are done it produces 404s rather than
merely-large files.

1. **Custom domain.** R2 → `kinetic-layers-preview` → Settings → Custom Domains
   → add `media.kineticlayers.com`. The zone is already on Cloudflare, so this
   is a form, not a migration.

2. **Transformations.** Zone `kineticlayers.com` → enable Transformations.
   Images and Media share one subscription: 5,000 free unique transformations a
   month. A 6s clip costs 6 (one per second of output); a still costs 1; each
   unique URL is billed once per calendar month.

3. **Deploy.**

   ```sh
   npx wrangler deploy --config workers/media/wrangler.jsonc
   ```

4. **Prove the chain** before touching the app, with a real file:

   ```sh
   # the mirror: first call fills R2 from Sanity, second is served by R2
   curl -sI https://media.kineticlayers.com/sanity/<file>.mp4

   # range, which Media Transformations require of an origin
   curl -sI -H 'Range: bytes=0-99' https://media.kineticlayers.com/sanity/<file>.mp4
   # expect: 206 and a Content-Range header

   # the transform: a still cut out of the video
   curl -sI 'https://media.kineticlayers.com/cdn-cgi/media/mode=frame,time=0s,width=740/https://media.kineticlayers.com/sanity/<file>.mp4'
   # expect: 200 and content-type: image/jpeg
   ```

   If `/cdn-cgi/` and the Worker route fight over the path, it surfaces here —
   which is the whole point of testing it before six files depend on it.

5. **Flip the flag.** `NEXT_PUBLIC_MEDIA_MIRROR=1` in `.env.local` and in
   Vercel, then redeploy.

## Rolling back

Set `NEXT_PUBLIC_MEDIA_MIRROR=0` and redeploy. `lib/kl/media.ts` returns to
resolving paths against the base and passing Sanity URLs through untouched. The
Worker and the bucket can stay where they are; nothing reads them.

## Notes

- The bucket is the **public preview** one. `R2_ASSETS_BUCKET` holds paid source
  files and must never be bound to a public hostname.
- `sanity/*` keys are content-hashed by Sanity, so they are cached `immutable`.
  The seeded `<slug>/card.webp` keys are stable rather than content-addressed
  and get the split cache `tools/upload-r2.mjs` uses — a replaced render still
  has to reach someone holding the old one.
- A cache miss stores the object and re-reads it through R2 instead of streaming
  the upstream response back. That costs one extra hop, once, and buys correct
  range semantics on the very first request — which is what the transformer
  needs.
