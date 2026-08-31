import type { Metadata } from "next";
import { Footer, Nav } from "@/components/kiln/Chrome";
import { getViewer } from "@/lib/kiln/viewer";

export const metadata: Metadata = {
  alternates: { canonical: "/license" },
  title: "License",
  description: "What you may do with a Kiln asset.",
};

/**
 * Asset licence.
 *
 * This is a plain-English DRAFT, not settled terms. It was written to match
 * what the rest of the site already promises — commercial use on unlimited
 * client projects, downloads survive cancellation, no reselling — so the two
 * do not contradict each other. It has had no legal review, and the banner at
 * the top says so to anyone reading it. Replace it before taking money.
 */

const TERMS: Array<{ h: string; p: string }> = [
  {
    h: "What you get",
    p: "A non-exclusive, worldwide, perpetual licence to use the asset and its source files in your own work — personal or commercial, for yourself or for clients, on any number of projects.",
  },
  {
    h: "It is permanent, and it does not depend on your account",
    p: "The licence attaches when you download, and it does not expire. Kiln is free during early access; when it becomes paid, and if you later stop paying or close your account, everything you already downloaded stays licensed to you on these terms. Losing access stops new downloads and new drops. It never reaches back into work you have already shipped.",
  },
  {
    h: "You may modify it freely",
    p: "Edit prompts, re-render scenes, retrain, recolour, cut it apart. The output of your changes is yours. No attribution is required, though it is welcome.",
  },
  {
    h: "What you may not do",
    p: "Redistribute or resell the asset as an asset — that is, as a template, pack, prompt library, dataset, or any product whose substance is the file itself. The line is whether someone is buying your work or ours.",
  },
  {
    h: "No sublicensing of the raw file",
    p: "You can deliver finished work to a client and hand over the working files it needed. You cannot give a client a licence to redistribute the original asset onward.",
  },
  {
    h: "Trained models and generated output",
    p: "Output you generate using a prompt or model from Kiln belongs to you. You may not publish or sell a model whose training data is substantially our assets.",
  },
  {
    h: "No warranty",
    p: "Assets are provided as they are. We test what we ship, but we cannot promise a given file suits a given brief, renders on a given machine, or clears a given client's legal review.",
  },
];

export default async function License() {
  const viewer = await getViewer();
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

  return (
    <>
      <a className="skip-link" href="#terms">Skip to the terms</a>
      <Nav viewer={viewer} />

      <main>
        <section className="shell" style={{ paddingBlock: "64px 30px" }}>
          <div className="prose" data-hero style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              License
            </span>
            <h1 style={{ fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.06, fontWeight: 500, letterSpacing: "-0.035em" }}>
              Use it in client work. Don&rsquo;t resell it as an asset.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)" }}>
              That is the whole of it. The rest is detail.
            </p>
          </div>
        </section>

        {/* Said plainly and on the page, not buried in a code comment: this
            text has not been through legal review. */}
        <section className="shell prose" style={{ paddingBottom: 8 }}>
          <p
            role="note"
            style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: "var(--muted)",
              border: "1px solid var(--hairline-3)",
              borderLeft: "2px solid var(--sage-deep)",
              borderRadius: "var(--r-inner)",
              background: "var(--surface)",
              padding: "16px 20px",
            }}
          >
            <strong style={{ color: "var(--ink-3)", fontWeight: 500 }}>Draft.</strong>{" "}
            These terms are written in plain English to match what the site
            promises, but they have not been reviewed by a lawyer. They should be
            before any money changes hands. Questions in the meantime:{" "}
            <a href={`mailto:${contact}`} style={{ color: "var(--sage)" }}>
              {contact}
            </a>
            .
          </p>
        </section>

        <section id="terms" className="shell prose" style={{ paddingBlock: "34px 90px" }}>
          <dl style={{ display: "flex", flexDirection: "column", gap: 0, margin: 0 }}>
            {TERMS.map((t) => (
              <div
                key={t.h}
                data-reveal
                style={{ padding: "24px 0", borderTop: "1px solid var(--hairline)" }}
              >
                <dt style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)", marginBottom: 8 }}>
                  {t.h}
                </dt>
                <dd style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>{t.p}</dd>
              </div>
            ))}
          </dl>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted)", paddingTop: 30 }}>
            Not sure whether something is allowed? Ask rather than guess —{" "}
            <a href={`mailto:${contact}`} style={{ color: "var(--sage)" }}>
              {contact}
            </a>
            . The licence is the same for every asset and does not depend on
            what you paid — which, during early access, is nothing.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
