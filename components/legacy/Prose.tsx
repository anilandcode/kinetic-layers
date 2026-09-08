import type { ReactNode } from "react";

/**
 * Shared shell for the written pages — docs, privacy, terms, MCP.
 *
 * They were each about to grow their own hero and their own measure, which is
 * how a design drifts. One component means the reading width, heading scale
 * and skip-link target are decided once.
 */
export function ProseHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="kl-pad" style={{ paddingBlock: "64px 30px" }}>
      <div className="kl-prose" data-hero style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
          {eyebrow}
        </span>
        <h1 style={{ fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.06, fontWeight: 500, letterSpacing: "-0.035em", textWrap: "pretty" }}>
          {title}
        </h1>
        {lead && <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)" }}>{lead}</p>}
      </div>
    </section>
  );
}

/** The "we drafted this, a lawyer has not" banner, used by privacy and terms. */
export function DraftNote({ contact }: { contact: string }) {
  return (
    <section className="kl-pad" style={{ paddingBottom: 8 }}>
      <p
        className="kl-prose"
        role="note"
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: "var(--muted)",
          border: "1px solid var(--line2)",
          borderLeft: "2px solid var(--amber)",
          borderRadius: "12px",
          background: "var(--card)",
          padding: "16px 20px",
        }}
      >
        <strong style={{ color: "var(--muted)", fontWeight: 500 }}>Draft.</strong> Written in
        plain English to describe what this site actually does, but not reviewed
        by a lawyer. It should be before any money changes hands. Questions:{" "}
        <a href={`mailto:${contact}`} style={{ color: "var(--amber)" }}>
          {contact}
        </a>
        .
      </p>
    </section>
  );
}

export function Terms({ id, items }: { id: string; items: Array<{ h: string; p: ReactNode }> }) {
  return (
    <section id={id} className="kl-pad" style={{ paddingBlock: "34px 90px" }}>
      <dl className="kl-prose" style={{ display: "flex", flexDirection: "column", gap: 0, margin: 0 }}>
        {items.map((t) => (
          <div key={t.h} data-reveal style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}>
            <dt style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)", marginBottom: 8 }}>
              {t.h}
            </dt>
            <dd style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>{t.p}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <pre
      className="mono prose--wide"
      style={{
        margin: "14px 0 0",
        padding: "16px 18px",
        background: "var(--ground)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        fontSize: 12.5,
        lineHeight: 1.7,
        color: "var(--muted)",
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  );
}
