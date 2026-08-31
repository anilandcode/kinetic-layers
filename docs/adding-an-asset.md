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

For a tagline or a prompt, open **/studio**, edit the asset, publish. The
webhook revalidates only the tags that changed, so it is live in seconds.

Files are the part the Studio cannot do: they live in the private `assets`
bucket in Supabase, not in Sanity. Upload at the path in the asset's
`storagePath` field (Supabase dashboard → Storage → assets) and the download
route signs it on request. Nothing else changes.

## What to check afterwards

- `/library` — it appears, and its type tab and industry pill count it.
- `/item/<slug>` — the prompt reveals, and each file downloads.
- Signed out on a paid asset, the gate still refuses.
