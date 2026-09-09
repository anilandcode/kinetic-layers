import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

/**
 * Kinetic Layers content schemas.
 *
 * Field names mirror lib/kl/types so nothing downstream has to rename
 * anything when it moves from the placeholder arrays to real content.
 *
 * Note what is NOT here: the downloadable files. Sanity's asset CDN is public
 * by URL, and the paywall is the product, so gated source files live in a
 * private bucket — Cloudflare R2, or Supabase Storage when STORAGE_DRIVER says
 * so. What lives here is the manifest describing them — name, size, kind —
 * plus the storage path the download route resolves.
 *
 * That is why this schema has no image or file fields anywhere. Nothing is
 * uploaded through the Studio; it is uploaded by tools/import-asset.mjs, which
 * writes the object and this document together so they cannot disagree.
 */

/**
 * One vocabulary, not five.
 *
 * These were `shelf`, `mood`, `category`, `theme` and `stack` — five required
 * dropdowns an author had to fill before anything could be published, four of
 * which the library never sliced by. They are one optional `tags` list now.
 * `type` stayed a field of its own because it is the library's tab row: it is
 * the one axis the UI navigates by rather than filters on.
 */
const TAGS = [
  /* was `shelf` */
  "Build", "Motion", "Craft",
  /* was `mood` */
  "Luxe", "Technical", "Editorial", "Organic", "Brutalist", "Playful",
  /* was `category` — what a visitor came looking for */
  "Hero", "Landing page", "Portfolio", "SaaS", "Agency", "Ecommerce",
  "Dashboard", "Background", "Texture", "Workflow",
  /* was `theme` */
  "Dark", "Light",
  /* was `stack` */
  "Next.js", "React", "Astro", "Tailwind", "Three.js", "R3F", "GSAP",
  "Blender", "Figma", "Flux", "Claude", "GPT",
] as const;

/** The tab row on /library. A closed list so the tabs cannot sprout typos. */
const TYPES = [
  "Template", "3D Scene", "Prompt", "Background",
  "Image Pack", "LoRA", "Video", "MCP / Agent",
] as const;

const TIERS = ["Free", "Premium"] as const;

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
        "Key inside the private bucket, e.g. \"my-asset/scene.zip\". You cannot " +
        "upload a file here — the Studio has no upload field for gated content. " +
        "Run tools/import-asset.mjs, which puts the object in the bucket and " +
        "writes this path in one step. A path with no object behind it makes the " +
        "download button return 409.",
    }),
    defineField({ name: "bytes", title: "Size in bytes", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "meta" } },
});

const asset = defineType({
  name: "asset",
  title: "Asset",
  type: "document",
  groups: [
    { name: "main", title: "Asset", default: true },
    { name: "words", title: "Words" },
    { name: "advanced", title: "Advanced" },
  ],
  fields: [
    /**
     * Two fields, either of which will do — an asset needs one of them, not
     * both. This was `media` required, which quietly meant "video not accepted
     * here": an image field rejects video/mp4, so uploading one stalled at 0%
     * with no explanation.
     *
     * A still is still worth having. Sanity records dimensions on images and
     * not on files, so an image is what lets the card size itself, and it is
     * what paints before any video has loaded. Video-only works; it just falls
     * back to a default height and shows the paper tint until the first frame
     * arrives.
     *
     * GIFs count as images and keep their animation.
     */
    defineField({
      name: "media",
      title: "Image",
      type: "image",
      group: "main",
      options: { storeOriginalFilename: true },
      description:
        "Image or GIF. Sizes the card, and paints first. Optional if you upload a video below.",
    }),
    defineField({
      name: "clip",
      title: "Video",
      type: "file",
      group: "main",
      options: { accept: "video/*", storeOriginalFilename: true },
      description:
        "Optional. Plays on hover when there is an image, or on its own when there is not. " +
        "Keep it a few seconds and web-sized — this loads in a grid, and Sanity is a CMS " +
        "rather than a video host. A 5s 1280px loop is a few hundred KB; a 50s 4K one is 16 MB.",
    }),

    /**
     * Optional. Empty means the query falls back to the media's original
     * filename, then to a sequence — see nameOf() in lib/sanity/queries.ts.
     */
    defineField({
      name: "name",
      type: "string",
      group: "main",
      description: "Leave empty to use the uploaded filename.",
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "main",
      options: {
        maxLength: 96,
        /* Async so an empty name can still produce a slug: it reads the
           uploaded asset's original filename rather than making the author
           invent one. */
        source: async (doc: Record<string, any>, ctx: any) => {
          if (doc?.name) return String(doc.name);
          const ref = doc?.media?.asset?._ref;
          if (ref && ctx?.getClient) {
            const client = ctx.getClient({ apiVersion: "2026-08-25" });
            const file: string | null = await client.fetch(
              "*[_id == $id][0].originalFilename",
              { id: ref }
            );
            if (file) return file.replace(/\.[^.]+$/, "");
          }
          return "asset";
        },
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "type",
      title: "Type",
      type: "string",
      group: "main",
      options: { list: [...TYPES] },
      description: "The tab it appears under on /library.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tier",
      type: "string",
      group: "main",
      options: { list: [...TIERS], layout: "radio", direction: "horizontal" },
      initialValue: "Premium",
      description: "Free assets download on any signed-in account.",
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "main",
      of: [{ type: "string" }],
      options: { list: [...TAGS], layout: "tags" },
      description: "Optional. Drives the library filters and what counts as related.",
    }),

    defineField({ name: "tagline", type: "text", rows: 2, group: "words" }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 12,
      group: "words",
      description: "Optional. Paste design.md here — markdown is fine.",
    }),
    defineField({
      name: "prompt",
      title: "Gated prompt text",
      type: "text",
      rows: 6,
      group: "words",
      description:
        "The full prompt. Only the first two lines are ever sent to an unentitled visitor; the rest is counted, not shipped.",
    }),

    /**
     * Written by tools/import-asset.mjs, which uploads the object and the
     * document together. Editable here for a typo, but these are paths into a
     * private bucket — nothing is uploaded through this field, and a path with
     * no object behind it makes the download button return 409.
     */
    defineField({ name: "files", type: "array", of: [{ type: "fileEntry" }], group: "advanced" }),
    defineField({ name: "drop", type: "reference", to: [{ type: "drop" }], group: "advanced" }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      group: "advanced",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  /* Neither field is required on its own, so the rule lives here: an asset
     with no media at all is a blank tile in the grid. */
  validation: (r) =>
    r.custom((doc) => {
      const d = doc as Record<string, unknown> | undefined;
      return d?.media || d?.clip ? true : "Add an image or a video.";
    }),
  preview: {
    select: { title: "name", subtitle: "type", media: "media", file: "media.asset.originalFilename" },
    prepare: ({ title, subtitle, media, file }: Record<string, any>) => ({
      title: title || file?.replace(/\.[^.]+$/, "") || "Untitled",
      subtitle,
      media,
    }),
  },
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
      name: "assets",
      type: "array",
      of: [{ type: "reference", to: [{ type: "asset" }] }],
      description: "What is in it. The first one supplies the cover unless you pick another.",
    }),
    /**
     * Borrowed, not uploaded. A collection is a shelf of assets that already
     * have media, so re-uploading one of their images here would be a second
     * copy to keep in step. Empty means the first asset in the list.
     */
    defineField({
      name: "cover",
      type: "reference",
      to: [{ type: "asset" }],
      description: "Optional. Which of its assets supplies the cover image.",
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: { list: [...TAGS], layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "blurb", media: "cover.media" },
  },
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
  fileEntry,
];
