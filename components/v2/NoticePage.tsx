import Shell from "./Shell";
import AuthStage from "./AuthStage";
import Icon from "./Icon";
import { ButtonLink } from "./Button";
import p from "./Page.module.css";

/**
 * A one-sentence outcome page — where the newsletter and membership-interest
 * links land. Someone arriving from an email wants one thing, did it work, so
 * the page says that in a glass card over the dithered field and offers one
 * way onward. `tone="good"` lights the ember check for a success.
 */
export default function NoticePage({
  eyebrow,
  title,
  body,
  action,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: { href: string; label: string };
  tone?: "good" | "neutral";
}) {
  return (
    <Shell>
      <main>
        <AuthStage labelledBy="notice-title">
          <div className={p.notice}>
            <span className={p.noticeIcon} data-tone={tone} aria-hidden="true">
              <Icon name={tone === "good" ? "check" : "arrow"} size={18} />
            </span>
            <p className={p.kicker}>
              <span className={p.kickerDot} aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 id="notice-title" className={p.noticeTitle}>
              {title}
            </h1>
            <p className={p.noticeBody}>{body}</p>
            {action ? (
              <ButtonLink href={action.href} icon="arrow">
                {action.label}
              </ButtonLink>
            ) : null}
          </div>
        </AuthStage>
      </main>
    </Shell>
  );
}
