import type { Metadata } from "next";
import "@/styles/concepts/studio-current.css";
import StudioCurrent from "@/components/concepts/StudioCurrent";
import { ConceptBar, ConceptCta, ConceptFacts } from "@/components/ConceptChrome";

export const metadata: Metadata = {
  title: "Studio Current — agency service layer — Direction Kit",
  description:
    "Studio Current: an original agency service and portfolio layer with a narrative project sequence and a modular service CTA.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <a className="c-skip" href="#stage">
        Skip to the section
      </a>
      <ConceptBar name="Studio Current" number="003" />

      <main>
        {/* Pinned to the light palette: this section was designed light. */}
        <div className="c-stage" id="stage" data-theme="light">
          <StudioCurrent />
        </div>

        <ConceptFacts
          intro={
            <p>
              A service layer usually fails in one of two ways: it explains the process and
              forgets to ask for anything, or it asks immediately and explains nothing. This
              one carries the sequence and the enquiry in the same block.
            </p>
          }
          facts={[
            {
              title: "Intended job",
              body: (
                <p>
                  Show a prospective client how you work, then let them act on it without
                  scrolling to find a contact form.
                </p>
              ),
            },
            {
              title: "Editable content fields",
              body: (
                <ul>
                  <li>Eyebrow, headline, introduction</li>
                  <li>Any number of sequence steps: label, title, body, up to three chips</li>
                  <li>One plate per step</li>
                  <li>Testimonial and attribution</li>
                  <li>Any number of services: name, price, description, link</li>
                  <li>Closing line and primary call to action</li>
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
                  <li>Three original SVG plates</li>
                  <li>Zero client JavaScript &mdash; the section is entirely static</li>
                  <li>Step numbering from CSS counters, so reordering needs no edits</li>
                </ul>
              ),
            },
            {
              title: "Responsive image treatment",
              body: (
                <ul>
                  <li>Art-directed ratio: 4:5 on a phone, 16:10 at tablet, 5:4 on desktop</li>
                  <li>
                    Cropped with <code>slice</code>, matching <code>object-fit: cover</code>
                  </li>
                  <li>
                    Drop a real <code>&lt;img&gt;</code> in place of the SVG and nothing else
                    changes
                  </li>
                  <li>
                    Alternating layout done with <code>order</code>, so the DOM stays in
                    narrative order
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
                  <li>Sequence reads top to bottom for a screen reader at every width</li>
                  <li>No motion beyond hover, so reduced motion changes nothing</li>
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
