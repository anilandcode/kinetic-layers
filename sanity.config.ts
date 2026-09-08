import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

/**
 * Studio config.
 *
 * The Studio is NOT mounted inside the app. Embedding it pulled the whole
 * Sanity bundle into the Next build and deadlocked with React 19 over
 * useEffectEvent; it is a dev dependency now, run with `npm run studio` and
 * published with `npm run studio:deploy`. The app keeps only the read client.
 *
 * Access is whoever you have invited to the Sanity project. Hosted at
 * https://kineticlayers.sanity.studio.
 *
 * These values are inline rather than imported from lib/sanity/client, and that
 * is not duplication for its own sake. That module reads
 * NEXT_PUBLIC_SANITY_PROJECT_ID, which only Next ever defines — the Studio is
 * built by Vite, which exposes nothing but SANITY_STUDIO_* to the bundle. So
 * the import resolved to "" and the Studio died on load with "Configuration
 * must contain `projectId`", the same error lib/sanity/client.ts has a long
 * comment about surviving. sanity.cli.ts already worked around this and said
 * why; this file did not, which is why the Studio had never once run.
 *
 * Importing that module would also drag next-sanity and its server-only
 * console.error into a browser bundle that has no use for either.
 */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "8vxxthrc";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
const apiVersion = "2026-08-25";

export default defineConfig({
  name: "kinetic-layers",
  title: "Kinetic Layers",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
