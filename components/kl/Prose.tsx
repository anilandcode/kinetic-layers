import type { ReactNode } from "react";

/**
 * The written pages — licence, privacy, terms, docs, MCP, changelog.
 *
 * Same API as the component this replaces, so the pages themselves only swap
 * an import. One component means the reading width, heading scale and skip
 * target are decided once rather than drifting per page.
 *
 * The measure is capped well below the 1600px shell: these are read, not
 * scanned, and a 1500px line of body copy is unreadable however much room
 * there is.
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
      <div className="kl-prose" data-hero>
        <span className="kl-kicker">{eyebrow}</span>
        {/* Not data-mask: these headings carry entities and the mask rebuilds
            the text node, which would eat them. */}
        <h1 className="kl-prose-h1">{title}</h1>
        {lead ? <p className="kl-prose-lead" data-rise>{lead}</p> : null}
      </div>
    </section>
  );
}

/** The "we drafted this, a lawyer has not" banner on privacy and terms. */
export function DraftNote({ contact }: { contact: string }) {
  return (
    <section className="kl-pad" style={{ paddingBottom: 8 }}>
      <p className="kl-prose kl-draft-note" role="note">
        This is a plain-English draft written to match what the code actually
        does. It has had no legal review. If something here matters to you,{" "}
        <a href={`mailto:${contact}`}>tell us</a> and it gets fixed rather than
        argued.
      </p>
    </section>
  );
}

export function Terms({ id, items }: { id: string; items: Array<{ h: string; p: ReactNode }> }) {
  return (
    <section id={id} className="kl-pad" style={{ paddingBlock: "34px 90px" }}>
      <dl className="kl-prose kl-terms">
        {items.map((t) => (
          <div key={t.h} data-reveal>
            <dt>{t.h}</dt>
            <dd>{t.p}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Code({ children }: { children: string }) {
  return <code className="kl-code">{children}</code>;
}
