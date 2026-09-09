# Adding a real asset

The catalogue shipped as fifteen invented assets whose files are text
placeholders saying so. Everything around them is real — the gate, the daily
quota, signed downloads, the MCP tool — so replacing the content is a content
job, not a code change.

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
  "type": "3d scene",
  "stack": "three.js",
  "shelf": "Motion",
  "mood": "Technical",
  "category": "Hero",
  "theme": "Dark",
  "free": true,
  "tagline": "One sentence on what it is and what it was built for.",
  "promptBody": "The full prompt text. Gated — only the first lines are ever sent to an unentitled visitor.",
  "files": [{ "name": "scene.js", "tag": "Code", "meta": "MODULE · 42 KB" }],
  "shots": [{ "label": "Hero — default palette" }],
  "specs": [{ "k": "Type", "v": "3D scene" }],
  "body": ["A paragraph.", "Another paragraph."]
}
```

Required: `name`, `type`, `stack`, `shelf`, `mood`, `category`, `theme`,
`tagline`, `free`. The script refuses rather than guessing — a half-imported
asset that renders but cannot be downloaded is worse than one that never
appeared.

Values that must match exactly:

| Field      | Allowed |
|------------|---------|
| `shelf`    | Build, Motion, Craft |
| `mood`     | Luxe, Technical, Editorial, Organic, Brutalist, Playful |
| `theme`    | Dark, Light |
| `category` | Hero, Landing page, Portfolio, SaaS, Agency, Ecommerce, Dashboard, Editorial, Background, Texture, Workflow |
| `files[].tag` | Code, Source, Assets, Config, Prompts |

`type` is free text and becomes a tab in the library — reuse an existing one
(Template, 3D Scene, Prompt, Background, Image Pack, LoRA, Video, MCP / Agent)
unless you mean a genuinely new kind of thing.

`free: true` puts it in the free tier. While `NEXT_PUBLIC_EARLY_ACCESS=1` every
asset is free to any account regardless, so this only matters once you charge.

`meta` and `bytes` are read from the real files when you leave them out, so the
size a visitor is shown is the size they get.

### Then

```bash
npm run media:deploy    # if you added preview/ images
```

Without a `preview/` folder the card falls back to a generated gradient — run
`node --env-file=.env.local tools/make-dummy-media.mjs` to produce one.

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

| | |
|---|---|
| `supabase` (default) | the private `assets` bucket — Supabase dashboard → Storage → assets |
| `r2` | the private R2 bucket named by `R2_ASSETS_BUCKET` |

The key is the same either way — `storagePath` is a plain `<slug>/<name>` — so
moving between them is a config change, not a re-import. Run
`tools/migrate-storage-to-r2.mjs` to copy what is already there. The reason to
move is Supabase's free tier: 1 GB stored and 5 GB egress a month, against R2's
10 GB and no egress charge at any volume. R2 wants a card on file even when
free; Supabase and Pages do not.

## What to check afterwards

- `/library` — it appears, and its type tab and industry pill count it.
- `/item/<slug>` — the prompt reveals, and each file downloads.
- Signed out on a paid asset, the gate still refuses.
