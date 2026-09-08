"use client";

import { useState } from "react";

/**
 * Save / unsave, for assets and collections alike.
 *
 * `/api/save` has always handled both kinds, but nothing in the UI ever sent
 * `kind: "collection"` — so the "Saved" list on the account page had a
 * collections section that could not possibly fill. One component, used in both
 * places, is what stops that drifting apart again.
 *
 * The update is optimistic and rolls back on failure: saving is reversible and
 * cheap, so waiting on a round trip to redraw a toggle just feels broken.
 */
export default function SaveButton({
  kind,
  slug,
  saved: initiallySaved,
  signedIn,
  labels,
  className = "btn btn--quiet",
  style,
}: {
  kind: "asset" | "collection";
  slug: string;
  saved: boolean;
  signedIn: boolean;
  labels?: { on: string; off: string };
  className?: string;
  style?: React.CSSProperties;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [failed, setFailed] = useState(false);

  const on = labels?.on ?? "Saved — remove";
  const off = labels?.off ?? "Save for later";

  /* Signed out, this is a prompt to sign in rather than a control that
     silently does nothing — which is what it used to be. */
  if (!signedIn) {
    return (
      <a
        href={`/join?next=${encodeURIComponent(kind === "asset" ? `/item/${slug}` : `/collections/${slug}`)}`}
        className={className}
        style={style}
      >
        Sign in to save
      </a>
    );
  }

  async function toggle() {
    const next = !saved;
    setSaved(next);
    setFailed(false);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, slug, saved: next }),
      });
      if (!res.ok) {
        setSaved(!next);
        setFailed(true);
      }
    } catch {
      setSaved(!next);
      setFailed(true);
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={toggle}
        aria-pressed={saved}
        style={style}
      >
        {failed ? "Try again" : saved ? on : off}
      </button>
      {/* The outcome used to live only in a `title`, which is hover-only and
          therefore invisible to keyboards and touch alike. aria-pressed states
          the toggle, but not that a save failed or landed. */}
      <span role="status" aria-live="polite" className="visually-hidden">
        {failed ? "Could not save. Try again." : saved ? "Saved" : ""}
      </span>
    </>
  );
}
