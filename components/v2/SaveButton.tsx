"use client";

import { useState } from "react";
import { Button, ButtonLink } from "./Button";

/**
 * Save a kit for later — it then shows under Saved in the library and on the
 * dashboard. Optimistic, and rolled back if /api/save refuses: saving is
 * cheap and reversible, so waiting on a round trip to redraw a toggle only
 * feels broken. Signed out, it is an invitation to sign in, never a control
 * that silently does nothing.
 */
export default function SaveButton({
  slug,
  saved: initiallySaved,
  signedIn,
  className,
}: {
  slug: string;
  saved: boolean;
  signedIn: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [failed, setFailed] = useState(false);

  if (!signedIn) {
    return (
      <ButtonLink href={`/join?next=${encodeURIComponent(`/item/${slug}`)}`} variant="secondary" icon="bookmark" className={className}>
        Sign in to save
      </ButtonLink>
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
        body: JSON.stringify({ kind: "asset", slug, saved: next }),
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
      <Button type="button" variant="secondary" icon={saved ? "check" : "bookmark"} onClick={toggle} aria-pressed={saved} className={className}>
        {failed ? "Try again" : saved ? "Saved" : "Save for later"}
      </Button>
      <span role="status" aria-live="polite" className="v-sr">
        {failed ? "Could not save. Try again." : saved ? "Saved" : ""}
      </span>
    </>
  );
}
