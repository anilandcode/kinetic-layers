import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./lib/sanity/client";

/**
 * Studio config. Mounted inside the app at /studio rather than deployed
 * separately, so there is one host, one deploy and one set of env vars.
 * Access is whoever you have invited to the Sanity project.
 */
export default defineConfig({
  name: "kiln",
  title: "Kiln",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
