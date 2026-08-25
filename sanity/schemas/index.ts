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
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "gradient",
      title: "Placeholder gradient",
      type: "string",
      description: "CSS gradient used until a real render exists.",
    }),
  ],
  preview: { select: { title: "label", media: "image" } },
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
    defineField({ name: "cover", type: "image", options: { hotspot: true } }),
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
  preview: { select: { title: "name", subtitle: "type", media: "cover" } },
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
    defineField({ name: "cover", type: "image", options: { hotspot: true } }),
    defineField({ name: "assets", type: "array", of: [{ type: "reference", to: [{ type: "asset" }] }] }),
  ],
  preview: { select: { title: "name", subtitle: "blurb", media: "cover" } },
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
