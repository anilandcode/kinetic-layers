"use client";

import CopyText from "./CopyText";
import { itemHref } from "@/lib/kl/slug";

/**
 * Copy one of a kit's prompts to the clipboard — /api/prompt asks the gate and
 * spends one daily read, the same rule as reading it on the kit page or over
 * MCP. The fetch-once, clipboard and fallback behaviour is CopyText's.
 */
export default function CopyPrompt({
  slug,
  kind,
  disabled,
}: {
  slug: string;
  kind: "reconstruction" | "adaptation";
  /** Samples have no prompt to copy. */
  disabled?: boolean;
}) {
  return (
    <CopyText
      endpoint="/api/prompt"
      body={{ slug, kind }}
      label="Copy prompt"
      joinNext={itemHref(slug)}
      disabled={disabled}
      disabledNote="Samples are previews — there is no prompt to copy."
    />
  );
}
