import type { ReactNode } from "react";
import { HUES } from "@/lib/v2/gradient";
import Shell from "./Shell";
import PageHero from "./PageHero";
import ProseToc from "./ProseToc";
import l from "./layout.module.css";
import p from "./Page.module.css";
import s from "./Prose.module.css";

/**
 * The written pages — docs, MCP, changelog, licence, privacy, terms — in
 * Home's language: the short dithered hero, then a reading column. The
 * measure is capped well below the page width: these are read, not scanned.
 */

export function ContentPage({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <main className={p.page}>{children}</main>
    </Shell>
  );
}

export function ProseHero({
  eyebrow,
  title,
  lead,
  hue = HUES.ember,
  second,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  hue?: number;
  second?: number;
}) {
  return <PageHero kicker={eyebrow} title={title} lede={lead} hue={hue} second={second} />;
}

/** The reading column's sections, with the sticky contents beside them. */
export function ProseBody({ toc, children }: { toc?: Array<{ id: string; label: string }>; children: ReactNode }) {
  return (
    <div className={s.body}>
      {children}
      {toc?.length ? <ProseToc items={toc} /> : null}
    </div>
  );
}

/** A titled section of the reading column. */
export function ProseSection({
  id,
  title,
  children,
  last = false,
}: {
  id?: string;
  title?: ReactNode;
  children: ReactNode;
  last?: boolean;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} className={`${l.container} ${s.section}`} data-last={last ? "" : undefined} aria-labelledby={headingId}>
      <div className={s.column}>
        {title ? (
          <h2 id={headingId} className={s.h2}>
            {title}
          </h2>
        ) : null}
        <div className={s.prose}>{children}</div>
      </div>
    </section>
  );
}

/** The "we drafted this, a lawyer has not" note on the licence, privacy and terms. */
export function DraftNote({ contact, children }: { contact: string; children?: ReactNode }) {
  return (
    <div className={`${l.container} ${s.section}`}>
      <p className={`${s.column} ${s.draft}`} role="note">
        <strong>Draft.</strong>{" "}
        {children ?? (
          <>
            A plain-English draft written to match what the code actually does. It has had no legal review. If something
            here matters to you, <a href={`mailto:${contact}`}>tell us</a> and it gets fixed rather than argued.
          </>
        )}
      </p>
    </div>
  );
}

/** Numbered terms in a glass panel — the licence, privacy and terms pages. */
export function Terms({ id, items }: { id: string; items: Array<{ h: string; p: ReactNode }> }) {
  return (
    <section id={id} className={`${l.container} ${s.section}`} aria-label="Terms">
      <dl className={`${s.column} ${s.terms}`}>
        {items.map((t, i) => (
          <div key={t.h} className={s.term}>
            <span className={s.termNo} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <dt>{t.h}</dt>
            <dd>{t.p}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** A block of code, with an optional label in its bar. */
export function Code({ children, label }: { children: string; label?: string }) {
  return (
    <figure className={s.code}>
      <figcaption className={s.codeBar}>
        <i />
        <i />
        <i />
        {label ? <span>{label}</span> : null}
      </figcaption>
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

/** A definition list of short parts — anatomy, tools, fields. */
export function Parts({ items, mono = false }: { items: Array<[ReactNode, ReactNode]>; mono?: boolean }) {
  return (
    <dl className={s.parts} data-mono={mono ? "" : undefined}>
      {items.map(([h, body], i) => (
        <div key={i}>
          <dt>{h}</dt>
          <dd>{body}</dd>
        </div>
      ))}
    </dl>
  );
}
