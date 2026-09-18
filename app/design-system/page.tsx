import type { Metadata } from "next";
import PageShell from "@/components/kl/PageShell";
import DesignSystemMotionPreview from "@/components/kl/DesignSystemMotionPreview";
import styles from "./design-system.module.css";

export const metadata: Metadata = {
  title: "Design foundations",
  description: "The semantic Kinetic Layers foundations and component states.",
  robots: { index: false, follow: false },
};

const COLORS = [
  ["Canvas", "--canvas", "Page background"],
  ["Surface 1", "--surface-1", "Cards and panels"],
  ["Surface 2", "--surface-2", "Nested regions"],
  ["Raised", "--surface-raised", "Menus and dialogs"],
  ["Primary text", "--text-primary", "Headings and key data"],
  ["Secondary text", "--text-secondary", "Body copy"],
  ["Muted text", "--text-muted", "Metadata and help"],
  ["Default border", "--border-default", "Controls and separators"],
  ["Strong border", "--border-strong", "Selected boundaries"],
  ["Primary action", "--action-primary", "One leading action"],
  ["Success", "--status-success", "Confirmed outcomes"],
  ["Warning", "--status-warning", "Attention required"],
  ["Danger", "--status-danger", "Errors and destructive states"],
  ["Information", "--status-info", "Neutral system information"],
  ["Focus", "--focus-ring", "Keyboard focus"],
] as const;

const SPACING = [1, 2, 3, 4, 6, 8, 12, 16, 24] as const;

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className={styles.sectionHead}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

export default function DesignSystem() {
  return (
    <PageShell>
      <div className="ds-review">
        <section className={`${styles.hero} ds-section`}>
          <div className="ds-container" data-size="gallery">
            <p className={styles.eyebrow}>Foundation review · DR-1</p>
            <h1>A quieter system for work that moves.</h1>
            <p className={styles.lead}>
              This isolated route is the approval surface for semantic color, type, spacing,
              layout, focus and motion. Public pages stay unchanged until these foundations
              and the reference screens are accepted.
            </p>
            <div className="ds-cluster">
              <a className="ds-button" href="#colors">Review tokens</a>
              <a className="ds-button" data-variant="secondary" href="#motion">Review motion</a>
            </div>
          </div>
        </section>

        <section id="colors" className="ds-section">
          <div className="ds-container" data-size="gallery">
            <SectionTitle eyebrow="01 · Color" title="Semantic, not decorative" copy="New components name purpose instead of inheriting historical color names. Use the theme control in the header to inspect both palettes." />
            <div className={styles.swatchGrid}>
              {COLORS.map(([name, token, note]) => (
                <article className={styles.swatch} key={token}>
                  <span className={styles.swatchColor} style={{ background: `var(${token})` }} aria-hidden="true" />
                  <div><h3>{name}</h3><code>{token}</code><p>{note}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.tonalSection} ds-section`}>
          <div className="ds-container" data-size="content">
            <SectionTitle eyebrow="02 · Typography" title="A clear editorial hierarchy" copy="The new system uses a licence-safe system sans until Maison Neue deployment rights are confirmed. Meaningful text never falls below 11px." />
            <div className={styles.typeSpecimens}>
              <p className={styles.display}>Original layers, ready to adapt.</p>
              <p className={styles.pageTitle}>Browse the library</p>
              <p className={styles.sectionTitle}>Built for inspection, not decoration</p>
              <p className={styles.bodyLarge}>Each kit shows the real preview, included files, compatibility and access state before asking for a decision.</p>
              <p className={styles.body}>Body copy remains compact but readable across product, documentation and account screens.</p>
              <p className={styles.label}>Version 1.2 · Framer Motion · Updated today</p>
            </div>
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container" data-size="gallery">
            <SectionTitle eyebrow="03 · Layout" title="Four containers, one grid" copy="Reading, form, content and gallery roles replace route-specific widths. Gutters and columns change at the agreed ranges." />
            <div className={styles.containerList}>
              {(["reading", "form", "content", "gallery"] as const).map((size) => (
                <div className={styles.containerRow} key={size} data-size={size}><span>{size}</span><code>{`--container-${size}`}</code></div>
              ))}
            </div>
            <div className={styles.gridDemo} aria-label="Responsive layout grid">
              {Array.from({ length: 12 }, (_, index) => <span key={index}>{index + 1}</span>)}
            </div>
          </div>
        </section>

        <section className={`${styles.tonalSection} ds-section`}>
          <div className="ds-container" data-size="content">
            <SectionTitle eyebrow="04 · Spacing and shape" title="A small, repeatable vocabulary" copy="Spacing follows a 4px base. Controls, cards and large media use 8, 12 and 16px radii; pills are reserved for compact filters and statuses." />
            <div className={styles.spacingList}>
              {SPACING.map((space) => <div key={space}><code>{`space-${space}`}</code><span style={{ width: `var(--space-${space})` }} /></div>)}
            </div>
            <div className={styles.shapeGrid}>
              <span data-shape="control">Control · 8</span><span data-shape="card">Card · 12</span><span data-shape="media">Media · 16</span>
            </div>
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container" data-size="content">
            <SectionTitle eyebrow="05 · Controls and focus" title="Every action exposes its state" copy="Primary touch targets are at least 44px. Tab through these controls to inspect the shared focus ring." />
            <div className="ds-cluster">
              <button className="ds-button" type="button">Primary action</button>
              <button className="ds-button" data-variant="secondary" type="button">Secondary</button>
              <button className="ds-button" data-variant="quiet" type="button">Quiet action</button>
              <button className="ds-button" type="button" disabled>Unavailable</button>
            </div>
          </div>
        </section>

        <section id="motion" className={`${styles.tonalSection} ds-section`}>
          <div className="ds-container" data-size="content">
            <SectionTitle eyebrow="06 · Motion" title="Motion explains state" copy="Interface motion uses the shared ease and short distances. Reduced-motion removes translation while keeping content complete." />
            <DesignSystemMotionPreview />
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container" data-size="reading">
            <SectionTitle eyebrow="07 · Gate" title="What must happen next" copy="Confirm the font licence and enable real Sanity data in Vercel Preview. Then this foundation can be reviewed at 390, 768, 1024 and 1440 pixels in both themes before reference screens begin." />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
