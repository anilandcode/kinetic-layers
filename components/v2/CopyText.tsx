"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Icon from "./Icon";
import s from "./KitDialog.module.css";
import c from "./CopyText.module.css";

type Done = { remaining?: number; limit?: number };
type State =
  | { at: "idle" | "loading" }
  | ({ at: "copied" | "saved" } & Done)
  | { at: "manual"; text: string }
  | { at: "refused"; message: string; reason?: string };

/**
 * Gated text, fetched once: copy it, save it as a .md, or read it in place.
 *
 * The text comes from `endpoint` (/api/prompt), which asks the gate and spends
 * one read from the rolling daily allowance. It is kept after the first fetch,
 * so copying again, saving or previewing spends nothing more. If the browser
 * refuses the clipboard, the text is shown in a box to select by hand.
 */
export default function CopyText({
  endpoint,
  body,
  label,
  joinNext,
  filename,
  preview = false,
  disabled,
  disabledNote,
}: {
  endpoint: string;
  body: Record<string, unknown>;
  /** "Copy prompt", "Copy code"… */
  label: string;
  /** Where Join should bring the visitor back to. */
  joinNext: string;
  /** Offer "Download .md" under this name. */
  filename?: string;
  /** Offer reading the text in place. */
  preview?: boolean;
  disabled?: boolean;
  disabledNote?: string;
}) {
  const [state, setState] = useState<State>({ at: "idle" });
  const [open, setOpen] = useState(false);
  const cached = useRef<string | null>(null);

  async function fetchText(): Promise<{ text: string; meta: Done } | null> {
    if (cached.current) return { text: cached.current, meta: {} };
    setState({ at: "loading" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setState({ at: "refused", message: json.message ?? "That did not work.", reason: json.reason });
        return null;
      }
      const text = String(json.text ?? json.prompt ?? "");
      cached.current = text;
      return { text, meta: { remaining: json.remaining, limit: json.limit } };
    } catch {
      setState({ at: "refused", message: "Could not reach the network. Please try again." });
      return null;
    }
  }

  async function copy() {
    const got = await fetchText();
    if (!got) return;
    try {
      await navigator.clipboard.writeText(got.text);
      setState({ at: "copied", ...got.meta });
    } catch {
      setState({ at: "manual", text: got.text });
    }
  }

  async function save() {
    const got = await fetchText();
    if (!got || !filename) return;
    const url = URL.createObjectURL(new Blob([got.text], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setState({ at: "saved", ...got.meta });
  }

  async function toggle() {
    if (open) return setOpen(false);
    const got = await fetchText();
    if (!got) return;
    setOpen(true);
    setState((prev) => (prev.at === "loading" ? { at: "idle", ...got.meta } : prev));
  }

  if (disabled) {
    return (
      <div className={s.copyWrap}>
        <button type="button" className={s.copy} disabled>
          <Icon name="lock" size={14} />
          {label}
        </button>
        {disabledNote ? <p className={s.copyNote}>{disabledNote}</p> : null}
      </div>
    );
  }

  const busy = state.at === "loading";
  const left =
    "remaining" in state && typeof state.remaining === "number" && typeof state.limit === "number"
      ? `${state.remaining} of ${state.limit} reads left today`
      : null;

  return (
    <div className={s.copyWrap}>
      <div className={c.actions}>
        <button type="button" className={s.copy} onClick={copy} disabled={busy} data-done={state.at === "copied" ? "" : undefined}>
          <Icon name={state.at === "copied" ? "check" : "file"} size={14} />
          {busy ? "Loading…" : state.at === "copied" ? "Copied" : label}
        </button>
        {filename ? (
          <button type="button" className={s.copy} onClick={save} disabled={busy} data-done={state.at === "saved" ? "" : undefined}>
            <Icon name={state.at === "saved" ? "check" : "download"} size={14} />
            {state.at === "saved" ? "Saved" : "Download .md"}
          </button>
        ) : null}
        {preview ? (
          <button type="button" className={s.copy} onClick={toggle} disabled={busy} aria-expanded={open}>
            <Icon name={open ? "close" : "spec"} size={14} />
            {open ? "Hide" : "Preview"}
          </button>
        ) : null}
      </div>
      <p className={s.copyNote} role="status">
        {state.at === "copied"
          ? (left ?? "On your clipboard")
          : state.at === "saved"
            ? (left ?? `Saved as ${filename}`)
            : state.at === "refused"
              ? state.message
              : state.at === "manual"
                ? "Your browser blocked the clipboard — select the text below."
                : cached.current
                  ? (left ?? "Already unlocked — no further reads")
                  : "Uses one daily read"}
        {state.at === "refused" && state.reason === "needs-account" ? (
          <>
            {" "}
            <Link href={`/join?next=${encodeURIComponent(joinNext)}`}>Join free</Link>
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
      {open && cached.current ? <pre className={c.preview}>{cached.current}</pre> : null}
    </div>
  );
}
