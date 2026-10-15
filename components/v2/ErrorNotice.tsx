"use client";

import { useEffect } from "react";
import AuthStage from "./AuthStage";
import { Button } from "./Button";
import p from "./Page.module.css";

/** The error copy, shared by the in-frame boundary and the root one. */
export default function ErrorNotice({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <AuthStage labelledBy="error-title">
        <div className={p.notice}>
          <p className={p.kicker}>Something broke</p>
          <h1 id="error-title" className={p.noticeTitle}>
            That did not load.
          </h1>
          <p className={p.noticeBody}>
            The error is logged. Trying again often works — it is usually the content API being slow rather than
            anything actually wrong.
          </p>
          {error.digest ? <p className={p.reference}>Reference {error.digest}</p> : null}
          {/* A button, not a link: this resets the boundary rather than navigating. */}
          <Button type="button" onClick={reset} icon="arrow">
            Try again
          </Button>
        </div>
      </AuthStage>
    </main>
  );
}
