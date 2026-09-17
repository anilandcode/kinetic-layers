# Adding a real asset

Only two current catalogue records have real uploaded previews. Older seeded
records and their placeholder files remain for development. Everything around
an actual asset — the gate, quota, signed downloads, and MCP tool — is real, so
replacing content is a content job, not a code change.

MotionSites references are a separate, attributed visual-reference set used on
the homepage. Do not import them through this workflow: they are not catalogue
assets and never receive download, entitlement, or Premium behavior.

Two ways in. Use the script for anything with files; use the Studio for a copy
fix.

## The script

```bash
node tools/import-asset.mjs ./incoming/my-asset --dry-run   # check it first
node tools/import-asset.mjs ./incoming/my-asset             # write it
```

It needs `SANITY_WRITE_TOKEN` in `.env.local` — create one at
**sanity.io/manage → API → Tokens**, with **Editor** permission. Everything else
it needs is already there.

### The folder it expects

```
my-asset/
  asset.json     metadata
  files/         the real deliverables — these become the downloads
  preview/       optional: card.webp, card.mp4, shot-1.webp, shot-1.mp4 …
```

### asset.json

```json
{
  "name": "Volumetric Drift",
  "type": "3D Scene",
  "tier": "Premium",
  "tags": ["Motion", "Luxe", "Hero", "Dark", "Three.js"],
  "tagline": "One sentence on what it is and what it was built for.",
  "prompt": "The full prompt. Gated — only the first lines reach an unentitled visitor.",
  "notes": "Markdown. Paste design.md straight in.",
  "files": [{ "name": "scene.js", "tag": "Code", "meta": "MODULE · 42 KB" }]
}
```

Required: `name`, `type`, `tagline`. That is the whole list — the form used to
carry twenty fields, five of which were taxonomies nobody filtered by.

Tags are **documents** now, not strings. `tools/seed-tags.mjs` plants the
vocabulary (33 tags, 12 marked `featured`, which is what the library offers as
filters) and is safe to re-run — it never overwrites an edit you made.

| Field         | Notes                                                                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`        | The tab on /library. Template, 3D Scene, Prompt, Background, Image Pack, LoRA, Video, MCP / Agent.                                                                                                        |
| `tier`        | `Free` or `Premium`. **Defaults to Premium** — forgetting it should never give an asset away.                                                                                                             |
| `tags`        | Titles of existing `tag` documents. **Unknown ones are refused, not created** — silently minting tags is how the rail grew to ~35 chips nobody chose. Add it in the Studio, or run `tools/seed-tags.mjs`. |
| `files[].tag` | Code, Source, Assets, Config, Prompts.                                                                                                                                                                    |

`meta` and `bytes` are read from the real files when you leave them out, so the
size a visitor is shown is the size they get.

### Video

A grid card attaches its clip on hover or keyboard focus and plays it muted.
Standalone item media can attach while visible. Keep the clip compact because
the visitor should reach the first useful frame quickly; reduced-motion and
coarse-pointer visitors keep the poster.

```bash
node tools/optimize-clip.mjs clip.mp4                  # 6s, 1280px, ~2 MB
node tools/optimize-clip.mjs clip.mp4 --max-mb 12      # bigger, still sane
node tools/optimize-clip.mjs clip.mp4 --seconds 10 --width 1600 --start 4
```

It writes a trimmed silent loop and a poster frame taken from that loop, so the
still and the first frame match. Upload the poster as **Image** and the loop as
**Video**.

The poster is optional now — Cloudflare cuts a still out of the clip
(`mode=frame`) for a video-only asset, and a 16 MB source produced a 9.4 KB
JPEG. Uploading one is still better: an image is what carries dimensions, so it
is what lets the card size itself before any video has loaded.

The Studio warns over 25 MB and refuses over 100 MB, which is Cloudflare's
transform input ceiling.

Roughly a second of waiting per 1.2 MB on a 10 Mbps connection. 2 MB is
imperceptible; 18 MB is fifteen seconds of staring at a still.

### Then

```bash
npm run media:upload    # if you added preview/ images
```

Only needed for the legacy path-based previews. Anything uploaded through the
Studio needs no deploy step at all: the Worker at `media.kineticlayers.com`
pulls it from Sanity on first request, stores it in R2, and serves it from there
afterwards.

## By hand

For a tagline or a prompt, open the Studio, edit the asset, publish.

How fast it goes live depends on one thing that is **not currently set up**.
`app/api/revalidate/route.ts` invalidates just the tags an edit touched, but no
Sanity webhook calls it — `sanity hook list` returns nothing. Until one exists,
an edit appears when the fetch's own hour expires (`revalidate: 3600` in
`lib/sanity/queries.ts`), not in seconds.

To wire it up, in the Sanity dashboard under **API → Webhooks**, add one
pointing at `https://kineticlayers.com/api/revalidate`: POST, dataset
`production`, trigger on create/update/delete, projection
`{_type, slug}`, and the secret set to `SANITY_REVALIDATE_SECRET`. The CLI's
`sanity hook create` can do it too, but only interactively.

It is live at **https://kineticlayers.sanity.studio** — sign in with the Sanity
account the project belongs to. To run it locally, or to push changes to the
hosted one after editing a schema:

```bash
npm run studio          # http://localhost:3333
npm run studio:deploy   # redeploys kineticlayers.sanity.studio
```

The Studio is **not** mounted at `/studio` in the app, and should not be: doing
that pulls the whole Sanity bundle into the Next build and deadlocks with React
19 over `useEffectEvent`. It was tried and reverted — see the note at the top of
`sanity.config.ts`. Access is whoever you have invited to the Sanity project.

Files are the part the Studio cannot do. They live in a private bucket, not in
Sanity, so uploading one by hand means putting it at the asset's `storagePath`
and letting `app/api/download/route.ts` sign it on request.

Which bucket depends on `STORAGE_DRIVER`:

|                      |                                                                     |
| -------------------- | ------------------------------------------------------------------- |
| `supabase` (default) | the private `assets` bucket — Supabase dashboard → Storage → assets |
| `r2`                 | the private R2 bucket named by `R2_ASSETS_BUCKET`                   |

The key is the same either way — `storagePath` is a plain `<slug>/<name>` — so
moving between them is a config change, not a re-import. Run
`tools/migrate-storage-to-r2.mjs` to copy what is already there. The reason to
move is Supabase's free tier: 1 GB stored and 5 GB egress a month, against R2's
10 GB and no egress charge at any volume. R2 wants a card on file even when
free; Supabase and Pages do not.

## What to check afterwards

- `/library` — it appears and the type, category, and pricing controls count it.
- `/item/<slug>` — media, prompt access, and each file download behave as expected.
- `/` — a real-preview item may appear in the Kinetic Layers portion of the wall;
  it remains distinct from MotionSites reference cards.
- Signed out on a paid asset, the gate still refuses.
