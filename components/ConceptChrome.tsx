import Link from "next/link";

/**
 * Frame around a live concept section.
 *
 * The chrome is dark; the stage in the middle holds a section that may well be
 * light. That contrast is deliberate — the chrome is the shop, the stage is the
 * goods, and the goods are not all dark.
 */

export function ConceptBar({
  name,
  number,
  children,
}: {
  name: string;
  number: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="c-bar">
      <div className="c-shell c-bar__inner">
        <Link className="c-back" href="/#directions">
          &larr; All directions
        </Link>
        <p className="c-bar__meta">
          {children}
          <span className="c-wip">Work in progress</span>
          <span>
            {name} &middot; {number}
          </span>
        </p>
      </div>
    </header>
  );
}

export function ConceptFacts({
  intro,
  facts,
}: {
  intro: React.ReactNode;
  facts: Array<{ title: string; body: React.ReactNode }>;
}) {
  return (
    <section className="c-facts">
      <div className="c-shell">
        <div className="c-facts__head">
          <h2>What this layer is, and is not</h2>
          {intro}
        </div>
        <div className="c-grid">
          {facts.map((fact) => (
            <div className="c-fact" key={fact.title}>
              <h3>{fact.title}</h3>
              {fact.body}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ConceptCta() {
  return (
    <div className="c-shell">
      <div className="c-cta">
        <p>
          If this is the standard you would want across twelve layers, say so&mdash;that is
          the whole question we are trying to answer.
        </p>
        <Link className="btn" href="/#invitation">
          Request an invitation
        </Link>
      </div>
    </div>
  );
}
