import { defineCliConfig } from "sanity/cli";

/**
 * CLI config, separate from sanity.config.ts because the CLI reads it before
 * any bundler runs — so it cannot import from lib/, and it cannot rely on
 * Next's env loading. Hence the explicit fallbacks.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "8vxxthrc",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
  /* "kiln" is taken on sanity.studio by someone else, and it is the retired
     name anyway. This is the hosted Studio at kineticlayers.sanity.studio. */
  studioHost: "kineticlayers",
  /* Pinned so `sanity deploy` stays unattended — without it the CLI prompts
     for the application id on every deploy. */
  deployment: {
    appId: "cwdswk0yv06yaxx10f11839c",
  },
});
