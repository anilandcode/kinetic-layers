"use client";

import type { EventName } from "./contracts";

declare global {
  interface Window {
    DK?: { variant: string; source: string; qa: boolean };
  }
}

const ENDPOINT = "/api/event";

/**
 * Fire-and-forget event. Uses sendBeacon where available so a click that
 * navigates away still records, and never throws — tracking must not be able
 * to break the page.
 */
export function track(name: EventName, detail?: string | null) {
  if (typeof window === "undefined") return;
  const dk = window.DK ?? { variant: "unknown", source: "direct", qa: false };

  const body = JSON.stringify({
    event: name,
    variant: dk.variant,
    source: dk.source,
    qa: dk.qa ? 1 : 0,
    path: window.location.pathname,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    detail: detail ?? null,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }

  try {
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* nothing here is worth surfacing */
  }
}
