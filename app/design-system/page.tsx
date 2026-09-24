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
            <p className={styles.eyebrow}>Kinetic Layers · System 01</p>
            <h1>A precise workspace for creative assets.</h1>
            <p className={styles.lead}>
              The shared reference for typography, surfaces, controls, media, product states,
              and motion. Every public page should feel like part of this same workspace.
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
            <SectionTitle eyebrow="02 · Typography" title="Compact, calm, and deliberate" copy="Geist is the interim product face while the v2 canvas chooses between it, General Sans and Satoshi. Every family keeps explicit system fallbacks. Display type is reserved for page identity; workspace titles and controls stay compact." />
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
            <SectionTitle eyebrow="04 · Spacing and shape" title="A small, repeatable vocabulary" copy="Spacing follows a 4px base. Controls, cards and large media use 10, 16 and 24px radii; pills are reserved for compact filters and statuses." />
            <div className={styles.spacingList}>
              {SPACING.map((space) => <div key={space}><code>{`space-${space}`}</code><span style={{ width: `var(--space-${space})` }} /></div>)}
            </div>
            <div className={styles.shapeGrid}>
              <span data-shape="control">Control · 10</span><span data-shape="card">Card · 16</span><span data-shape="media">Media · 24</span>
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

        <section className={`${styles.tonalSection} ds-section`}>
          <div className="ds-container" data-size="content">
            <SectionTitle eyebrow="06 · Forms and discovery" title="Labels stay attached to decisions" copy="Inputs reserve room for help and errors. Search and filters use the same control height, focus treatment and plain-language labels." />
            <div className={styles.formGrid}>
              <div className={styles.formSpecimen}>
                <label htmlFor="ds-email">Email address</label>
                <input id="ds-email" type="email" placeholder="you@example.com" aria-describedby="ds-email-help" />
                <p id="ds-email-help">Used only for account access and requested updates.</p>
              </div>
              <div className={styles.formSpecimen} data-invalid="true">
                <label htmlFor="ds-project">Project name</label>
                <input id="ds-project" defaultValue="A" aria-invalid="true" aria-describedby="ds-project-error" />
                <p id="ds-project-error" role="alert">Use at least three characters.</p>
              </div>
              <div className={styles.formSpecimen}>
                <label htmlFor="ds-disabled">Workspace</label>
                <input id="ds-disabled" value="Personal workspace" disabled readOnly />
                <p>This value cannot be changed yet.</p>
              </div>
            </div>
            <div className={styles.discoveryBar}>
              <label className={styles.searchField}>
                <span className="visually-hidden">Search the component example</span>
                <input type="search" placeholder="Search original kits" />
              </label>
              <button className="ds-button" data-variant="secondary" type="button">Filters · 2</button>
              <button className={styles.filterChip} type="button" aria-pressed="true">Templates <span aria-hidden="true">×</span></button>
              <button className={styles.filterChip} type="button" aria-pressed="true">Free <span aria-hidden="true">×</span></button>
              <span className={styles.resultCount}>2 results</span>
            </div>
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container" data-size="gallery">
            <SectionTitle eyebrow="07 · Content cards" title="Original work and inspiration cannot be confused" copy="The product card owns an access state and product action. The reference card carries source attribution and never implies a download, prompt or inventory item." />
            <div className={styles.cardGrid}>
              <a className={styles.productCard} href="/item/verdro">
                <span className={styles.productVisual} data-art="verdro" aria-hidden="true"><span /></span>
                <span className={styles.cardBody}>
                  <span className={styles.cardMeta}>Original kit · Template</span>
                  <strong>verdro</strong>
                  <span>Preview only · Inspect the real product page</span>
                </span>
              </a>
              <a className={styles.productCard} href="/item/Asset">
                <span className={styles.productVisual} data-art="motion" aria-hidden="true"><span /><span /><span /></span>
                <span className={styles.cardBody}>
                  <span className={styles.cardMeta}>Original kit · Motion</span>
                  <strong>Asset</strong>
                  <span>Preview only · Motion available</span>
                </span>
              </a>
              <article className={styles.referenceCard}>
                <span className={styles.referenceVisual} aria-hidden="true"><span>External reference</span></span>
                <div className={styles.cardBody}>
                  <span className={styles.cardMeta}>Inspiration · External</span>
                  <strong>Editorial motion study</strong>
                  <span>Source attribution required · No product action</span>
                </div>
              </article>
              <article className={styles.missingCard}>
                <span aria-hidden="true">Preview unavailable</span>
                <div className={styles.cardBody}>
                  <span className={styles.cardMeta}>Original kit · Missing media</span>
                  <strong>A deliberately long product title that must wrap safely</strong>
                  <span>Product information remains readable without artwork.</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.tonalSection} ds-section`}>
          <div className="ds-container" data-size="gallery">
            <SectionTitle eyebrow="08 · Detail workspace" title="The media defines the canvas" copy="The detail shell shares spacing, type, controls and behavior across every item. Each preview keeps its own aspect ratio; the information panel stays compact and useful." />
            <div className={styles.dialogSpecimen}>
              <div className={styles.dialogStage} aria-label="Media preview proportion example">
                <div className={styles.orbitArt} aria-hidden="true"><span /><span /><span /><i /></div>
                <span className={styles.previewControl}>Preview · 16:10</span>
              </div>
              <aside className={styles.dialogDetails}>
                <button className={styles.dialogClose} type="button" aria-label="Close preview example">×</button>
                <p className={styles.eyebrow}>Original kit · Preview only</p>
                <h3>Magnetic field study</h3>
                <p className={styles.dialogDescription}>A responsive motion composition with prompt notes and an implementation guide.</p>
                <dl>
                  <div><dt>Format</dt><dd>Motion</dd></div>
                  <div><dt>Includes</dt><dd>Prompt + guide</dd></div>
                  <div><dt>Access</dt><dd>Preview only</dd></div>
                </dl>
                <div className={styles.dialogActions}>
                  <p>Download controls appear only when files are published and the viewer has access.</p>
                  <button className="ds-button" type="button">View item details</button>
                  <button className="ds-button" data-variant="secondary" type="button">Browse related kits</button>
                </div>
              </aside>
            </div>
            <div className={styles.dialogRules}>
              <span><b>Intrinsic media</b> Landscape, square and portrait previews retain their proportions.</span>
              <span><b>Shared behavior</b> Escape, backdrop, focus return and reduced motion follow one contract.</span>
              <span><b>Truthful actions</b> Product, reference and locked states expose only valid next steps.</span>
            </div>
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container" data-size="gallery">
            <SectionTitle eyebrow="09 · System states" title="Different problems receive different recovery" copy="Empty inventory, filtered-out results and service failure are not one generic empty state." />
            <div className={styles.stateGrid}>
              <article><span className={styles.stateIcon}>0</span><h3>No published kits</h3><p>The catalogue is connected, but nothing is ready to browse.</p><button className="ds-button" data-variant="secondary" type="button">Read what is coming</button></article>
              <article><span className={styles.stateIcon}>↺</span><h3>No matching results</h3><p>Two active filters hide every available original kit.</p><button className="ds-button" data-variant="secondary" type="button">Clear filters</button></article>
              <article data-state="error"><span className={styles.stateIcon}>!</span><h3>Catalogue unavailable</h3><p>The service did not respond. Your filters and place are preserved.</p><button className="ds-button" data-variant="secondary" type="button">Try again</button></article>
            </div>
          </div>
        </section>

        <section id="motion" className={`${styles.tonalSection} ds-section`}>
          <div className="ds-container" data-size="content">
            <SectionTitle eyebrow="10 · Motion" title="Motion explains state" copy="Interface motion uses the shared ease and short distances. Reduced-motion removes translation while keeping content complete." />
            <DesignSystemMotionPreview />
          </div>
        </section>

        <section className="ds-section">
          <div className="ds-container" data-size="reading">
            <SectionTitle eyebrow="11 · Release gate" title="What must be true before migration" copy="Verify the real catalogue at 390, 768, 1024 and 1440 pixels in both themes. Confirm the typeface chosen on the v2 canvas, then migrate Homepage, Library and Product surfaces through shared components." />
          </div>
        </section>
      </div>
    </PageShell>
  );
}
