import type { Metadata } from "next";
import "@/styles/concepts/signal-arc.css";
import SignalArc from "@/components/concepts/SignalArc";
import { ConceptBar, ConceptCta, ConceptFacts } from "@/components/ConceptChrome";

export const metadata: Metadata = {
  title: "Signal Arc — B2B SaaS hero — Direction Kit",
  description:
    "Signal Arc: an original B2B SaaS hero with an interactive proof panel. Live, responsive, keyboard-operable.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <a className="c-skip" href="#stage">
        Skip to the section
      </a>
      <ConceptBar name="Signal Arc" number="001" />

      <main>
        {/* Pinned to the light palette: this section was designed light, and the
            site going dark should not restyle the goods. */}
        <div className="c-stage" id="stage" data-theme="light">
          <SignalArc />
        </div>

        <ConceptFacts
          intro={
            <p>
              Everything above is live: resize it, tab through it, turn motion off. It is a
              work in progress and the figures are invented for a product that does not
              exist.
            </p>
          }
          facts={[
            {
              title: "Intended job",
              body: (
                <p>
                  Establish product credibility for a B2B SaaS buyer and earn the demo
                  click, without a wall of logos or an unverifiable claim.
                </p>
              ),
            },
            {
              title: "Editable content fields",
              body: (
                <ul>
                  <li>Eyebrow, headline, emphasis span</li>
                  <li>Supporting paragraph</li>
                  <li>Primary and secondary calls to action</li>
                  <li>Three trust statements</li>
                  <li>Three metric tabs: label, figure, unit, caption</li>
                  <li>Two comparison bars per tab: label, written value, fill</li>
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
                  <li>A tab controller with full keyboard support</li>
                  <li>No dependencies beyond React, no network requests</li>
                  <li>
                    All colour and motion resolved from <code>tokens.css</code>
                  </li>
                </ul>
              ),
            },
            {
              title: "Tested workflow",
              body: (
                <ul>
                  <li>Canonical source: Next.js, TypeScript and plain CSS</li>
                  <li>Verified at 360, 768, 1280 and 1440&nbsp;px</li>
                  <li>Keyboard: arrow keys, Home and End move between tabs</li>
                  <li>
                    Honours <code>prefers-reduced-motion</code>
                  </li>
                </ul>
              ),
            },
            {
              title: "Assets",
              body: (
                <p>
                  None to licence. Every visual is drawn from CSS and typography&mdash;no
                  photography, no icon set, no font download, and nothing hotlinked from
                  another company.
                </p>
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
