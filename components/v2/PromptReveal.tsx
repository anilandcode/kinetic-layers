"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./Button";
import s from "./Kit.module.css";

type Result =
  | { state: "idle" | "loading" }
  | { state: "open"; prompt: string; remaining?: number; limit?: number }
  | { state: "refused"; message: string; reason?: string };

/**
 * Read the whole reconstruction prompt. It goes through /api/prompt, which
 * asks the gate and spends one read from the rolling daily allowance — so the
 * button says it costs a read before it is pressed, and the text arrives only
 * after the check passes (no listing ever carries the prompt body).
 */
export default function PromptReveal({ slug }: { slug: string }) {
  const [result, setResult] = useState<Result>({ state: "idle" });
  const [copied, setCopied] = useState(false);

  async function reveal() {
    setResult({ state: "loading" });
    try {
      const res = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setResult({ state: "open", prompt: json.prompt, remaining: json.remaining, limit: json.limit });
      } else {
        setResult({ state: "refused", message: json.message ?? "That did not work.", reason: json.reason });
      }
    } catch {
      setResult({ state: "refused", message: "Could not reach the network. Please try again." });
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* The prompt is on screen and selectable. */
    }
  }

  if (result.state === "open") {
    return (
      <div className={s.reveal}>
        <div className={s.revealBar}>
          <span>
            Full prompt
            {typeof result.remaining === "number" && typeof result.limit === "number"
              ? ` · ${result.remaining} of ${result.limit} reads left today`
              : ""}
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={() => copy(result.prompt)}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className={s.revealText}>{result.prompt}</pre>
      </div>
    );
  }

  return (
    <div className={s.revealAsk}>
      <Button type="button" variant="secondary" size="sm" icon="prompt" onClick={reveal} disabled={result.state === "loading"}>
        {result.state === "loading" ? "Opening…" : "Read the full prompt"}
      </Button>
      <span className={s.revealNote}>Uses one of your daily prompt reads.</span>
      {result.state === "refused" ? (
        <p role="status" className={s.revealRefused}>
          {result.message}{" "}
          {result.reason === "needs-account" ? (
            <Link href={`/join?next=/item/${slug}`} className={s.inlineLink}>
              Join free
            </Link>
          ) : result.reason === "needs-premium" ? (
            <Link href="/pricing" className={s.inlineLink}>
              See pricing
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
