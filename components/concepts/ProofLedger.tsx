"use client";

import { useEffect, useState } from "react";

/**
 * Proof Ledger — results and case study.
 *
 * The chart is a real <table>. Nothing is duplicated for screen readers, and
 * with stylesheets off it degrades to the data it was always made of.
 *
 * Both treatments are named explicitly. Leaving the attribute off would fall
 * through to the site's own dark palette rather than this section's light one.
 */

const ROWS = [
  { quarter: "Q1 2025", value: "$1.9M", fill: 0.38 },
  { quarter: "Q2 2025", value: "$2.2M", fill: 0.44 },
  { quarter: "Q3 2025", value: "$2.9M", fill: 0.58 },
  { quarter: "Q4 2025", value: "$4.0M", fill: 0.8 },
  { quarter: "Q1 2026", value: "$5.0M", fill: 1, emphasis: true },
];

const FIGURES = [
  {
    label: "Booking time",
    value: "−64",
    unit: "%",
    note: "Median minutes to confirm a shipment, measured across 4,100 bookings.",
  },
  {
    label: "Support contacts",
    value: "1 in 9",
    unit: "",
    note: "Bookings needing a human, down from better than one in three.",
  },
  {
    label: "Payback",
    value: "5",
    unit: "mo",
    note: "Time for the saved handling cost to cover the build.",
  },
];

export function useTreatment() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  return { dark, setDark };
}

export function TreatmentToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button className="c-toggle" type="button" aria-pressed={dark} onClick={onToggle}>
      <span>{dark ? "Light treatment" : "Dark treatment"}</span>
    </button>
  );
}

export default function ProofLedger({ dark }: { dark: boolean }) {
  return (
    <section className="pl" aria-labelledby="pl-title" data-theme={dark ? "dark" : "light"}>
      <div className="pl__shell">
        <div className="pl__head">
          <p className="pl__eyebrow">Case study &middot; Harbourline Logistics</p>
          <h1 className="pl__title" id="pl-title">
            Eleven weeks to replace a process nobody trusted.
          </h1>
          <p className="pl__intro">
            Harbourline booked freight through three disconnected systems and a
            spreadsheet. We rebuilt the booking path around one record.
          </p>
        </div>

        <dl className="pl__figures">
          {FIGURES.map((f) => (
            <div className="pl__figure" key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                {f.value}
                {f.unit ? <sup>{f.unit}</sup> : null}
              </dd>
              <p>{f.note}</p>
            </div>
          ))}
        </dl>

        <div className="pl__panel">
          <div className="pl__chart-wrap">
            <table className="pl__chart">
              <caption>Qualified pipeline by quarter, in millions</caption>
              <thead>
                <tr>
                  <th scope="col">Quarter</th>
                  <th scope="col">Qualified pipeline</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.quarter}
                    style={{ "--fill": row.fill } as React.CSSProperties}
                    data-emphasis={row.emphasis ? "" : undefined}
                  >
                    <th scope="row">{row.quarter}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pl__method">
              <strong>Method.</strong> Pipeline is counted at the qualification stage,
              excluding renewals. Q1 2026 closed 14 March. Rebuilt booking path shipped in
              Q3 2025, so the first two quarters are the pre-launch baseline.
            </p>
          </div>

          <figure className="pl__quote">
            <blockquote>
              &ldquo;The part I did not expect was how much quieter the operations desk
              got. That was the real result.&rdquo;
            </blockquote>
            <figcaption>
              <strong>Placeholder attribution</strong>
              Operations lead, fictional client &mdash; replace with a real, approved
              quote.
            </figcaption>
          </figure>
        </div>

        <p className="pl__foot">
          Every figure on this page is invented for a company that does not exist.
          Publishing a results section means publishing results you can evidence.
        </p>
      </div>
    </section>
  );
}
