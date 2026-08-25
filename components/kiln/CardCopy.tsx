"use client";

import { useState } from "react";
import { track } from "@/lib/track";

/**
 * Copy an asset's prompt straight from its card.
 *
 * motionsites.ai puts this on the card and it is the shortest path to value on
 * either competitor: one click. Ours was four steps — open the card, load the
 * item page, wait for the prompt to fetch, then copy.
 *
 * It only renders when the gate is already open for this viewer. That is a
 * convenience, not a security decision: /api/prompt re-checks entitlement with
 * the same canDownload before returning a single character, so hiding or
 * showing this button changes nothing about what a determined visitor can get.
 */
export default function CardCopy({ slug, name }: { slug: string; name: string }) {
  const [state, setState] = useState<"idle" | "working" | "done" | "failed">("idle");

  async function copy(evt: React.MouseEvent) {
    /* The card is a Link wrapping everything. Without both of these, copying
       also navigates to the item page — which is precisely the trip this
       button exists to save. */
    evt.preventDefault();
    evt.stopPropagation();

    setState("working");
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (!res.ok || !json.prompt) {
        setState("failed");
        return;
      }
      await navigator.clipboard.writeText(json.prompt);
      setState("done");
      track("download", `copy-prompt:${slug}`);
      setTimeout(() => setState("idle"), 2200);
    } catch {
      /* Clipboard permission can simply be refused, and so can the network.
         Either way the item page still works, which is what the label says. */
      setState("failed");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const label = {
    idle: "Copy prompt",
    working: "Copying…",
    done: "Copied",
    failed: "Open the item page",
  }[state];

  return (
    <button
      type="button"
      data-card-copy
      onClick={copy}
      disabled={state === "working"}
      /* The card's own aria-label names the asset; this needs to say which
         asset it copies, or a screen-reader user hears fifteen identical
         "Copy prompt" buttons. */
      aria-label={`${label} for ${name}`}
      className="mono"
    >
      {label}
    </button>
  );
}
