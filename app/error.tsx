"use client";

import { useEffect } from "react";
import { ShellFrame } from "@/components/v2/ShellFrame";
import AuthStage from "@/components/v2/AuthStage";
import { Button } from "@/components/v2/Button";
import p from "@/components/v2/Page.module.css";

/**
 * The error boundary. It renders outside any page, so it draws the
 * synchronous frame (the header's account slot as a placeholder) rather than
 * the Shell, which would ask for a session on the one screen that exists
 * because a fetch just failed.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ShellFrame pending>
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
    </ShellFrame>
  );
}
