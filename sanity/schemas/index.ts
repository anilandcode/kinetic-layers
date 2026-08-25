import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

/**
 * Kiln content schemas.
 *
 * Field names mirror lib/kiln/types so nothing downstream has to rename
 * anything when it moves from the placeholder arrays to real content.
 *
 * Note what is NOT here: the downloadable files. Sanity's asset CDN is public
 * by URL, and the paywall is the product, so gated source files live in a
 * private Supabase Storage bucket. What lives here is the manifest describing
 * them — name, size, kind — plus the storage path the download route resolves.
 */

const SHELVES = ["Build", "Motion", "Craft"] as const;
const MOODS = ["Luxe", "Technical", "Editorial", "Organic", "Brutalist", "Playful"] as const;

/* What the asset is FOR, as opposed to what it is (`type`) or which shelf it
   sits on. Both reference libraries lead with this — it is the question a
   visitor actually arrives with. */
const CATEGORIES = [
  "Hero", "Landing page", "Portfolio", "SaaS", "Agency",
  "Ecommerce", "Dashboard", "Editorial", "Background", "Texture", "Workflow",
] as const;

const THEMES = ["Dark", "Light"] as const;

/**
 * Preview media is stored as a *path*, not an uploaded Sanity asset.
 *
 * The files live in a public Cloudflare R2 bucket because previews are served
 * on every visit and R2 charges nothing for egress. Sanity holds the path and
 * the shape; lib/kiln/media.ts resolves it against the host. Derivatives are
 * baked once at upload with ffmpeg, so no transformation CDN is in the path.
 */
const mediaFields = (prefix: string) => [
  defineField({
    name: "poster",
    title: "Poster path",
    type: "string",
    description: `Still frame inside the media bucket, e.g. "${prefix}/card.webp". Relative — no domain.`,
  }),
  defineField({
    name: "clip",
    title: "Clip path",
    type: "string",
    description: `Looping MP4, e.g. "${prefix}/card.mp4". Optional; it only plays on hover.`,
  }),
  defineField({
    name: "aspect",
    title: "Aspect ratio",
    type: "number",
    description: "width ÷ height. Reserves the box so the card never reflows when the poster lands.",
  }),
];

const specRow = defineType({
  name: "specRow",
  title: "Spec row",
  type: "object",
  fields: [
    defineField({ name: "k", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "v", title: "Value", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "k", subtitle: "v" } },
});

const fileEntry = defineType({
  name: "fileEntry",
  title: "File",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "meta", title: "Meta line", type: "string" }),
    defineField({
      name: "tag",
      type: "string",
      options: { list: ["Code", "Source", "Assets", "Config", "Prompts"] },
    }),
    defineField({
      name: "storagePath",
      title: "Storage path",
      type: "string",
      description:
        "Path inside the private Supabase bucket. The download route signs this; it is never exposed to the browser.",
    }),
    defineField({ name: "bytes", title: "Size in bytes", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "meta" } },
});

const shot = defineType({
  name: "shot",
  title: "Preview shot",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    ...mediaFields("<slug>/shot-1"),
    defineField({
      name: "gradient",
      title: "Placeholder gradient",
      type: "string",
      description: "Painted instantly under the poster, and used alone when there is no render yet.",
    }),
  ],
  preview: { select: { title: "label", subtitle: "poster" } },
});

const asset = defineType({
  name: "asset",
  title: "Asset",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "type", title: "Type", type: "string", validation: (r) => r.required() }),
    defineField({ name: "stack", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "shelf",
      type: "string",
      options: { list: [...SHELVES] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "mood",
      type: "string",
      options: { list: [...MOODS] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Used for",
      type: "string",
      options: { list: [...CATEGORIES] },
      description: "What a visitor came looking for. Drives the main filter row.",
    }),
    defineField({
      name: "theme",
      type: "string",
      options: { list: [...THEMES] },
    }),
    defineField({
      name: "free",
      title: "Free tier",
      type: "boolean",
      initialValue: false,
      description: "Free assets are downloadable by any signed-in account.",
    }),
    defineField({ name: "tagline", type: "text", rows: 2 }),
    defineField({ name: "body", title: "What this is", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "previewHeight",
      title: "Masonry height",
      type: "number",
      initialValue: 220,
      description: "Card height in px. The grid is deliberately ragged.",
    }),
    defineField({ name: "gradient", title: "Card gradient", type: "string" }),
    ...mediaFields("<slug>"),
    defineField({ name: "shots", type: "array", of: [{ type: "shot" }] }),
    defineField({ name: "specs", type: "array", of: [{ type: "specRow" }] }),
    defineField({ name: "files", type: "array", of: [{ type: "fileEntry" }] }),
    defineField({
      name: "promptBody",
      title: "Gated prompt text",
      type: "text",
      rows: 6,
      description:
        "The full prompt. Only the first two lines are ever sent to an unentitled visitor; the rest is counted, not shipped.",
    }),
    defineField({ name: "drop", type: "reference", to: [{ type: "drop" }] }),
    defineField({ name: "publishedAt", type: "datetime", initialValue: () => new Date().toISOString() }),
  ],
  preview: { select: { title: "name", subtitle: "type" } },
});

const collection = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "blurb", type: "text", rows: 3 }),
    defineField({
      name: "shelf",
      type: "string",
      options: { list: [...SHELVES] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "previewHeight", type: "number", initialValue: 230 }),
    defineField({ name: "gradient", type: "string" }),
    ...mediaFields("collections/<slug>"),
    defineField({ name: "assets", type: "array", of: [{ type: "reference", to: [{ type: "asset" }] }] }),
  ],
  preview: { select: { title: "name", subtitle: "blurb" } },
});

const drop = defineType({
  name: "drop",
  title: "Drop",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "meta", title: "Meta line", type: "string" }),
    defineField({
      name: "tag",
      type: "string",
      options: { list: ["NEW", "LIVE", "SOON"] },
      initialValue: "LIVE",
    }),
    defineField({ name: "shippedAt", type: "datetime" }),
  ],
  orderings: [
    { title: "Newest", name: "newest", by: [{ field: "shippedAt", direction: "desc" }] },
  ],
  preview: { select: { title: "title", subtitle: "meta" } },
});

/** Site-wide numbers the design shows in the hero and the pricing copy. */
const settings = defineType({
  name: "settings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "totalAssets", type: "number", initialValue: 240 }),
    defineField({ name: "freeThisMonth", type: "number", initialValue: 12 }),
    defineField({ name: "addedThisWeek", type: "number", initialValue: 9 }),
    defineField({ name: "monthlyPrice", type: "number", initialValue: 24 }),
    defineField({ name: "annualPrice", type: "number", initialValue: 240 }),
    defineField({ name: "currentDrop", type: "string", initialValue: "019" }),
    defineField({ name: "collectionCount", type: "number", initialValue: 18 }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const schemaTypes: SchemaTypeDefinition[] = [
  asset,
  collection,
  drop,
  settings,
  specRow,
  fileEntry,
  shot,
];
