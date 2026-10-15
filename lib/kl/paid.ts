/**
 * Where paid content lives in Sanity — shared by the app, the Studio and the
 * tools, which is why this file imports nothing.
 *
 * The dataset is public (a private one needs a paid Sanity plan), and a public
 * dataset serves every document whose `_id` has no dot to anyone who asks the
 * API. A document whose `_id` sits under a path — `paid.<id>` — is served only
 * to authenticated requests: the app's server token and the Studio. Measured on
 * this dataset 2026-10-15: anonymous reads miss `paid.*` even by exact id.
 *
 * So everything behind the paywall — kit prompts, website code and design
 * Markdown, the website ZIP's storage key — lives in `paid.<parentId>`, never
 * on the kit or website document itself.
 */
export const PAID_PREFIX = "paid.";
export const PAID_TYPE = "paidContent";
/** Single-use proof that a Studio member asked for a ZIP upload URL. */
export const UPLOAD_PREFIX = "paid.upload.";
export const UPLOAD_TYPE = "paidUpload";

/** The parent's published id, whether the Studio hands us a draft or a version. */
export const baseId = (id: string) => id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");
export const paidId = (parentId: string) => `${PAID_PREFIX}${baseId(parentId)}`;

/** The fields a paid document can hold. */
export type PaidField = "prompt" | "adaptationPrompt" | "code" | "design";

export type PaidZip = { storagePath: string; name: string; bytes: number; uploadedAt: string };
