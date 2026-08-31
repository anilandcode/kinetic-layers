import Link from "next/link";
import { Footer, Nav } from "@/components/kiln/Chrome";
import { getViewer } from "@/lib/kiln/viewer";

/**
 * A one-sentence outcome page.
 *
 * The confirm and unsubscribe links land here. Someone arriving from an email
 * wants one thing — did it work — so the page says that and offers one way
 * onward, rather than dropping them on a screen that looks like a form failed.
 */
export default async function NoticePage({
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
  const viewer = await getViewer();
  return (
    <>
      <Nav viewer={viewer} />
      <main className="shell" style={{ paddingBlock: "96px 120px" }}>
        <div data-hero style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
            {eyebrow}
          </span>
          <h1
            style={{
              fontSize: "clamp(30px, 3.8vw, 46px)",
              lineHeight: 1.08,
              fontWeight: 500,
              letterSpacing: "-0.035em",
              textWrap: "pretty",
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)" }}>{body}</p>
          {action && (
            <Link data-nav href={action.href} className="btn btn--primary" style={{ alignSelf: "flex-start", marginTop: 6 }}>
              {action.label}
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
