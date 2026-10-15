import AuthStage from "./AuthStage";
import { ButtonLink } from "./Button";
import { DotNumber } from "./DotMatrix";
import p from "./Page.module.css";

/** The 404 copy, shared by the in-frame boundary and the root one. */
export default function NotFoundNotice() {
  return (
    <main>
      <AuthStage labelledBy="notfound-title">
        <div className={p.notice}>
          <DotNumber value="404" label="Error 404" dot={10} tone="accent" />
          <h1 id="notfound-title" className={p.noticeTitle}>
            Nothing here. It may have been renamed.
          </h1>
          <p className={p.noticeBody}>Slugs change when a kit is retitled. The library is the reliable way back in.</p>
          <div className={p.actions}>
            <ButtonLink href="/library" icon="arrow">
              Browse the library
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">
              See pricing
            </ButtonLink>
          </div>
        </div>
      </AuthStage>
    </main>
  );
}
