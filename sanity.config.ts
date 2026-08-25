import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./lib/sanity/client";

/**
 * Studio config.
 *
 * The Studio is NOT mounted inside the app. Embedding it pulled the whole
 * Sanity bundle into the Next build and deadlocked with React 19 over
 * useEffectEvent; it is a dev dependency now, run with `npm run studio` and
 * published with `npm run studio:deploy`. The app keeps only the read client.
 *
 * Access is whoever you have invited to the Sanity project.
 */
export default defineConfig({
  name: "kiln",
  title: "Kiln",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
