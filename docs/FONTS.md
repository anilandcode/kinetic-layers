# Fonts

| Face | Used for | Source | Licence |
|---|---|---|---|
| **General Sans** (300, 400, 500, 600) | The v2 interface | Fontshare, fetched at build time by `tools/fetch-fonts.mjs` | ITF Free Font License 2.0 |
| **Geist Mono** | Metadata only | Google Fonts, through `next/font` | OFL |
| **Geist** | Fallback if General Sans is unavailable, and the v1 screens | Google Fonts, through `next/font` | OFL |
| **Source Serif 4** | v1 only | Google Fonts, through `next/font` | OFL |

## General Sans: why it is not in the repository

The ITF Free Font License allows self-hosting on our own websites (§01). It
forbids making the font files available "through … a repository … or publicly
accessible servers" (§02). This repository is public on GitHub, so the files
must **never** be committed. `public/fonts/general-sans/` is in `.gitignore`.

`npm run build` and `npm run dev` run `tools/fetch-fonts.mjs` first:

1. It downloads the official release from Fontshare.
2. It copies out four unmodified WOFF2 files.
3. The site serves them from its own origin, which is the self-hosting the
   licence permits.

If Fontshare is unreachable, the build continues and the type stack falls back
to Geist.

## Rules from the licence

- **Never put General Sans in anything a customer downloads.** That means no
  kit, no zip and no template. §02 forbids making the font available to third
  parties, including as a selectable font in a service. Kits that need a sans
  face should name a font the buyer can get themselves.
- **Do not subset, convert or rename the font files.** §02 and §05 forbid it.
  `next/font/local` would hash the file name, which is harmless, but its subset
  options must stay off. That is why the faces are declared with plain
  `@font-face` in `styles/kl-foundations.css`.
- If the repository becomes private, committing the WOFF2 files is still not
  needed. Leave the fetch in place.
