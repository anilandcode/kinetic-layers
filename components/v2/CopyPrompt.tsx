"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Icon from "./Icon";
import s from "./KitDialog.module.css";

type State =
  | { at: "idle" | "loading" }
  | { at: "copied"; remaining?: number; limit?: number }
  | { at: "manual"; text: string }
  | { at: "refused"; message: string; reason?: string };

/**
 * Copy one of a kit's prompts to the clipboard.
 *
 * The text comes from /api/prompt, which asks the gate and spends one read
 * from the rolling daily allowance — the same rule as reading it on the kit
 * page or over MCP. It is fetched once and kept, so copying again spends
 * nothing. If the browser refuses the clipboard, the prompt is shown in a
 * box to select by hand instead.
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
  const [state, setState] = useState<State>({ at: "idle" });
  const cached = useRef<string | null>(null);

  async function copy() {
    let text = cached.current;
    let meta: { remaining?: number; limit?: number } = {};
    if (!text) {
      setState({ at: "loading" });
      try {
        const res = await fetch("/api/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, kind }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setState({ at: "refused", message: json.message ?? "That did not work.", reason: json.reason });
          return;
        }
        text = String(json.prompt);
        cached.current = text;
        meta = { remaining: json.remaining, limit: json.limit };
      } catch {
        setState({ at: "refused", message: "Could not reach the network. Please try again." });
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setState({ at: "copied", ...meta });
    } catch {
      setState({ at: "manual", text });
    }
  }

  if (disabled) {
    return (
      <div className={s.copyWrap}>
        <button type="button" className={s.copy} disabled>
          <Icon name="lock" size={14} />
          Copy prompt
        </button>
        <p className={s.copyNote}>Samples are previews — there is no prompt to copy.</p>
      </div>
    );
  }

  return (
    <div className={s.copyWrap}>
      <button
        type="button"
        className={s.copy}
        onClick={copy}
        disabled={state.at === "loading"}
        data-done={state.at === "copied" ? "" : undefined}
      >
        <Icon name={state.at === "copied" ? "check" : "file"} size={14} />
        {state.at === "loading" ? "Copying…" : state.at === "copied" ? "Copied" : "Copy prompt"}
      </button>
      <p className={s.copyNote} role="status">
        {state.at === "copied"
          ? typeof state.remaining === "number" && typeof state.limit === "number"
            ? `${state.remaining} of ${state.limit} prompt reads left today`
            : "On your clipboard"
          : state.at === "refused"
            ? state.message
            : state.at === "manual"
              ? "Your browser blocked the clipboard — select the prompt below."
              : "Uses one daily read"}
        {state.at === "refused" && state.reason === "needs-account" ? (
          <>
            {" "}
            <Link href={`/join?next=/item/${slug}`}>Join free</Link>
          </>
        ) : null}
        {state.at === "refused" && state.reason === "needs-premium" ? (
          <>
            {" "}
            <Link href="/pricing">See pricing</Link>
          </>
        ) : null}
      </p>
      {state.at === "manual" ? (
        <textarea className={s.manual} readOnly value={state.text} rows={6} onFocus={(e) => e.currentTarget.select()} />
      ) : null}
    </div>
  );
}
