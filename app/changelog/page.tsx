import type { Metadata } from "next";
import PageShell from "@/components/kl/PageShell";
import { getDrops } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";

export const metadata: Metadata = {
  alternates: { canonical: "/changelog" },
  title: "Changelog",
  description: "Every drop, newest first.",
};

/**
 * The changelog is the drops.
 *
 * `drop` documents already carry a title, a meta line and a ship date — which
 * is a changelog entry in everything but name. Reading them here means the page
 * maintains itself: publish a drop in the Studio and it appears, with no second
 * place to remember to update.
 */
export default async function Changelog() {
  const [drops, viewer] = await Promise.all([getDrops(), getViewer()]);

  return (
    <PageShell>
        <section className="kl-pad" style={{ paddingBlock: "64px 34px" }}>
          <div className="kl-prose" data-hero style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
              Changelog
            </span>
            <h1 style={{ fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.06, fontWeight: 500, letterSpacing: "-0.035em" }}>
              Every drop, newest first.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)" }}>
              New work appears when it is ready. This log records what has been added.
            </p>
          </div>
        </section>

        <section id="log" className="shell prose" style={{ paddingBottom: 90 }}>
          {drops.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 16, paddingBlock: 40 }}>
              No drops published yet.
            </p>
          ) : (
            <ol style={{ display: "flex", flexDirection: "column", listStyle: "none", margin: 0, padding: 0 }}>
              {drops.map((d) => (
                <li
                  key={d.slug}
                  data-reveal
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 20,
                    padding: "22px 0",
                    borderTop: "1px solid var(--line)",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="kl-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      color: d.tag === "SOON" ? "var(--muted)" : "var(--amber)",
                      border: "1px solid var(--line2)",
                      borderRadius: "99px",
                      padding: "5px 11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.tag ?? "LIVE"}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
                    <h2 style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)" }}>
                      {d.title}
                    </h2>
                    {d.meta && (
                      <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
                        {d.meta}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </PageShell>
  );
}
