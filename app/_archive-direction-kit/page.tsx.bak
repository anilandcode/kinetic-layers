import Link from "next/link";
import ClientRuntime from "@/components/ClientRuntime";
import InviteForm from "@/components/InviteForm";
import { SiteFooter, SiteHeader } from "@/components/Wordmark";
import {
  BriefNetworkViz,
  DirectionViz,
  HeroFigure,
  LicenceViz,
  ProofLedgerSchematic,
  SamenessViz,
  SignalArcSchematic,
  StudioCurrentSchematic,
} from "@/components/graphics";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@directionkit.com";

const CONCEPTS = [
  {
    slug: "signal-arc",
    name: "Signal Arc",
    job: "B2B SaaS hero",
    blurb:
      "Establish product credibility and earn the demo click, with an interactive proof panel your client can edit.",
    Schematic: SignalArcSchematic,
  },
  {
    slug: "proof-ledger",
    name: "Proof Ledger",
    job: "Results & case-study section",
    blurb:
      "Turn delivered outcomes into evidence a buyer trusts. Light and dark, with a chart that stays readable without colour.",
    Schematic: ProofLedgerSchematic,
  },
  {
    slug: "studio-current",
    name: "Studio Current",
    job: "Agency service & portfolio layer",
    blurb:
      "Show how you work without burying the enquiry. A narrative project sequence with a modular service CTA.",
    Schematic: StudioCurrentSchematic,
  },
] as const;

export default function Home() {
  return (
    <>
      <ClientRuntime />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader note="Founding collection · in validation" />

      <main id="main">
        {/* ============ Hero ============ */}
        <section className="hero glow">
          <div className="shell hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Original design direction</p>
              <h1 className="display">
                Win the client.
                <br />
                Then <span className="grad">ship the site.</span>
              </h1>
              <p className="lede">
                Original, conversion-ready website layers for agencies&mdash;each with an
                AI-ready brief, canonical source, and a commercial licence for client
                delivery.
              </p>
              <div className="cta-row">
                <a
                  className="btn btn--primary"
                  href="#invitation"
                  data-track="cta_click"
                  data-track-detail="hero-primary"
                >
                  Join the founding collection
                </a>
                <a
                  className="btn btn--secondary"
                  href="#directions"
                  data-track="cta_click"
                  data-track-detail="hero-secondary"
                >
                  See the three launch directions
                </a>
              </div>
              <p className="trust">
                <span>12 original layers</span>
                <span>Source included</span>
                <span>Commercial client use</span>
              </p>
            </div>

            <div className="hero__figure">
              <HeroFigure />
            </div>
          </div>
        </section>

        {/* ============ Bento: how it works ============ */}
        <section className="band" aria-labelledby="how">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow">How it works</p>
              <h2 className="display" id="how">
                Four steps, in the order that actually happens
              </h2>
            </div>

            <div className="bento">
              <article className="card span-2 reveal">
                <div className="card__viz">
                  <SamenessViz />
                </div>
                <p className="card__n">01</p>
                <h3 className="card__title">
                  Stop beginning client work with the same generic AI layout.
                </h3>
              </article>

              <article className="card span-4 reveal">
                <div className="card__viz">
                  <DirectionViz />
                </div>
                <p className="card__n">02</p>
                <h3 className="card__title">
                  Start with an original visual direction built for a specific conversion
                  moment.
                </h3>
                <div className="card__foot chip-row">
                  <span className="chip chip--mint">Composition</span>
                  <span className="chip chip--violet">Palette roles</span>
                  <span className="chip chip--cyan">Motion language</span>
                </div>
              </article>

              <article className="card span-4 reveal">
                <div className="card__viz">
                  <BriefNetworkViz />
                </div>
                <p className="card__n">03</p>
                <h3 className="card__title">
                  Use the structured brief when you want AI to adapt it; use the source
                  when fidelity matters.
                </h3>
                <div className="card__foot chip-row">
                  <span className="chip">Structured brief</span>
                  <span className="chip">Canonical source</span>
                  <span className="chip">Compatibility card</span>
                </div>
              </article>

              <article className="card span-2 reveal">
                <div className="card__viz">
                  <LicenceViz />
                </div>
                <p className="card__n">04</p>
                <h3 className="card__title">
                  Deliver with a clear commercial-use policy and an asset manifest.
                </h3>
              </article>
            </div>
          </div>
        </section>

        {/* ============ Concept cards ============ */}
        <section className="band glow glow--violet" id="directions" aria-labelledby="directions-h">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow">Three launch directions</p>
              <h2 className="display" id="directions-h">
                Open any of them. They are <span className="grad">real, working sections.</span>
              </h2>
              <p className="prose">
                The first three layers of the founding collection, built to the standard
                the collection will hold: responsive, keyboard-operable, token-driven, and
                honest about what is finished and what is not. They are deliberately not
                three variations of the same dark hero.
              </p>
            </div>

            <div className="concepts">
              {CONCEPTS.map(({ slug, name, job, blurb, Schematic }) => (
                <article className="concept reveal" key={slug}>
                  <div className="concept__preview">
                    <Schematic />
                  </div>
                  <div className="concept__body">
                    <span className="tag">Work in progress</span>
                    <h3 className="display">{name}</h3>
                    <p className="concept__job">{job}</p>
                    <p>{blurb}</p>
                    <Link
                      className="concept__link"
                      href={`/concepts/${slug}`}
                      aria-label={`Open the live ${name} section`}
                      data-track="concept_click"
                      data-track-detail={slug}
                    >
                      Open the live section
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ Offer + invitation ============ */}
        <section className="band glow" id="invitation" aria-labelledby="invite-h">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow">Founding collection</p>
              <h2 className="display" id="invite-h">
                Request an invitation
              </h2>
              <p className="prose">
                The collection is being validated before it is built. An invitation costs
                nothing and commits you to nothing&mdash;it puts you first in line, and
                tells us whether this is worth making.
              </p>
            </div>

            <div className="offer">
              {/* Exactly one of these is painted. See the boot script in layout.tsx. */}
              <div>
                <div className="offer-card" data-offer="a">
                  <p className="eyebrow">Founding Prompt</p>
                  <p className="price">
                    $79<small>Intended price for the founding year</small>
                  </p>
                  <ul className="includes">
                    <li>12 original website layers</li>
                    <li>Previews and structured AI briefs</li>
                    <li>Commercial client-output rights</li>
                    <li>Quarterly additions during the founding year</li>
                  </ul>
                </div>

                <div className="offer-card" data-offer="b">
                  <p className="eyebrow">Founding Studio</p>
                  <p className="price">
                    $179<small>Intended price for the founding year</small>
                  </p>
                  <ul className="includes">
                    <li>Everything in Founding Prompt</li>
                    <li>Canonical source packages</li>
                    <li>Asset manifests and implementation notes</li>
                    <li>Priority source-migration support</li>
                  </ul>
                </div>

                <p className="note" style={{ marginTop: "var(--sp-5)" }}>
                  <strong>Where this stands.</strong> The first collection is in
                  validation. The price shown is the intended founding-year price&mdash;it
                  is not a charge. No payment details are collected on this page and
                  nothing is owed if the collection never ships.
                </p>
              </div>

              <InviteForm contactEmail={CONTACT} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
