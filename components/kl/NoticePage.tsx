import PageShell from "./PageShell";
import GlassButton from "./GlassButton";

/**
 * A one-sentence outcome page.
 *
 * The newsletter confirm and unsubscribe links land here. Someone arriving
 * from an email wants one thing — did it work — so the page says that and
 * offers one way onward, rather than dropping them on a screen that looks like
 * a form failed.
 *
 * Same API as the component it replaces, so the two routes only swap an
 * import.
 */
export default function NoticePage({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <PageShell>
      <div className="kl-pad" style={{ paddingBlock: "96px 120px" }}>
        <div className="kl-prose" data-hero>
          <span className="kl-kicker">{eyebrow}</span>
          <h1 className="kl-prose-h1">{title}</h1>
          <p className="kl-prose-lead">{body}</p>
          {action ? (
            <div style={{ marginTop: 10, display: "flex" }}>
              <GlassButton href={action.href} pull={5}>
                {action.label}
              </GlassButton>
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
