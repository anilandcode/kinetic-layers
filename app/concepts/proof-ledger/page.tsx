"use client";

import "@/styles/concepts/proof-ledger.css";
import ProofLedger, { TreatmentToggle, useTreatment } from "@/components/concepts/ProofLedger";
import { ConceptBar, ConceptCta, ConceptFacts } from "@/components/ConceptChrome";

/* This page is a client component because the treatment toggle owns state that
   the section reads. Metadata therefore lives in the sibling layout. */

export default function Page() {
  const { dark, setDark } = useTreatment();

  return (
    <>
      <a className="c-skip" href="#stage">
        Skip to the section
      </a>
      <ConceptBar name="Proof Ledger" number="002">
        <TreatmentToggle dark={dark} onToggle={() => setDark(!dark)} />
      </ConceptBar>

      <main>
        <div className="c-stage" id="stage">
          <ProofLedger dark={dark} />
        </div>

        <ConceptFacts
          intro={
            <p>
              The chart above is a real HTML table. Turn the stylesheet off and it is still
              the data; read it with a screen reader and it announces as rows and columns.
              Nothing is duplicated for accessibility because nothing needed to be.
            </p>
          }
          facts={[
            {
              title: "Intended job",
              body: (
                <p>
                  Turn delivered outcomes into evidence a sceptical buyer will accept: a
                  clear hierarchy from headline figure, to comparison, to method, to
                  attribution.
                </p>
              ),
            },
            {
              title: "Editable content fields",
              body: (
                <ul>
                  <li>Eyebrow, headline, introduction</li>
                  <li>Three headline figures: label, value, unit, caption</li>
                  <li>Chart caption and any number of rows</li>
                  <li>
                    Row emphasis via <code>data-emphasis</code>
                  </li>
                  <li>Method note</li>
                  <li>Quote and attribution</li>
                </ul>
              ),
            },
            {
              title: "What the source includes",
              body: (
                <ul>
                  <li>
                    One React component and one scoped <code>.css</code> file
                  </li>
                  <li>
                    Bar lengths set by one <code>--fill</code> value per row
                  </li>
                  <li>Data held as an array, so rows are added by editing a list</li>
                  <li>Light and dark from the same token names</li>
                </ul>
              ),
            },
            {
              title: "Tested workflow",
              body: (
                <ul>
                  <li>Canonical source: Next.js, TypeScript and plain CSS</li>
                  <li>Verified at 360, 768, 1280 and 1440&nbsp;px</li>
                  <li>Chart scrolls inside its own container on narrow screens</li>
                  <li>
                    Honours <code>prefers-reduced-motion</code>
                  </li>
                </ul>
              ),
            },
            {
              title: "Accessible by construction",
              body: (
                <ul>
                  <li>
                    Table markup with <code>caption</code> and <code>scope</code>
                  </li>
                  <li>Every bar sits beside its written value</li>
                  <li>Emphasis carried by position and label, not colour alone</li>
                  <li>Contrast holds in both treatments</li>
                </ul>
              ),
            },
            {
              title: "Commercial use",
              body: (
                <p>
                  If the collection ships, layers carry a licence to adapt and deliver
                  inside client projects, and a prohibition on reselling the package
                  itself. Nothing on this page is licensed yet&mdash;it is a validation
                  sample.
                </p>
              ),
            },
          ]}
        />
        <ConceptCta />
      </main>
    </>
  );
}
