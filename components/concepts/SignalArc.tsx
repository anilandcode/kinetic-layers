"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Signal Arc — B2B SaaS hero.
 *
 * The proof panel follows the ARIA tabs pattern: roving tabindex, arrow keys,
 * Home and End. Bars re-run their transition on show, so the panel feels alive
 * without animating anything a reduced-motion visitor asked not to see.
 *
 * Every figure is data, so a client edits numbers without touching behaviour.
 */

type Bar = { label: string; value: string; fill: number };
type Metric = { id: string; tab: string; figure: string; unit: string; caption: string; bars: Bar[] };

const METRICS: Metric[] = [
  {
    id: "recovery",
    tab: "Recovery",
    figure: "4.2",
    unit: "min",
    caption: "Median time from a bad deploy going live to it being rolled back.",
    bars: [
      { label: "With Meridian", value: "4.2 min", fill: 0.14 },
      { label: "Manual rollback", value: "31 min", fill: 1 },
    ],
  },
  {
    id: "escapes",
    tab: "Escapes",
    figure: "71",
    unit: "%",
    caption: "Fewer regressions reaching a customer in the first week after release.",
    bars: [
      { label: "After Meridian", value: "9 per quarter", fill: 0.29 },
      { label: "Before", value: "31 per quarter", fill: 1 },
    ],
  },
  {
    id: "effort",
    tab: "Effort",
    figure: "6",
    unit: "hrs",
    caption: "Engineering hours returned to each team every week, measured over a quarter.",
    bars: [
      { label: "Hours reclaimed", value: "6.0 / week", fill: 0.6 },
      { label: "Previously on incident triage", value: "10.0 / week", fill: 1 },
    ],
  },
];

export default function SignalArc() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Pointer-responsive emphasis. Never enabled for a coarse pointer or when
     reduced motion is requested. */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!wantsMotion || !finePointer) return;

    panel.style.setProperty("--sa-panel-glow", "var(--accent-soft)");
    const move = (evt: PointerEvent) => {
      const box = panel.getBoundingClientRect();
      panel.style.setProperty("--sa-x", `${((evt.clientX - box.left) / box.width) * 100}%`);
      panel.style.setProperty("--sa-y", `${((evt.clientY - box.top) / box.height) * 100}%`);
    };
    const leave = () => {
      panel.style.setProperty("--sa-x", "50%");
      panel.style.setProperty("--sa-y", "0%");
    };
    panel.addEventListener("pointermove", move, { passive: true });
    panel.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      panel.removeEventListener("pointermove", move);
      panel.removeEventListener("pointerleave", leave);
    };
  }, []);

  function onKeyDown(evt: React.KeyboardEvent, index: number) {
    let next: number | null = null;
    if (evt.key === "ArrowRight") next = (index + 1) % METRICS.length;
    else if (evt.key === "ArrowLeft") next = (index - 1 + METRICS.length) % METRICS.length;
    else if (evt.key === "Home") next = 0;
    else if (evt.key === "End") next = METRICS.length - 1;
    if (next === null) return;
    evt.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="sa" aria-labelledby="sa-title">
      <div className="sa__grid">
        <div className="sa__copy">
          <p className="sa__eyebrow">Deployment intelligence</p>
          <h1 className="sa__title" id="sa-title">
            Ship on Friday and <em>sleep on Saturday.</em>
          </h1>
          <p className="sa__lede">
            Meridian watches every release the moment it lands, catches the regressions
            your tests did not, and rolls back before your customers write in.
          </p>
          <div className="sa__actions">
            <a className="sa__btn sa__btn--go" href="#stage">
              Book a 20-minute demo
            </a>
            <a className="sa__btn sa__btn--quiet" href="#stage">
              Read the technical brief
            </a>
          </div>
          <p className="sa__trust">
            <span>SOC 2 Type II</span>
            <span>Deploys in under an hour</span>
            <span>No agent on your servers</span>
          </p>
        </div>

        <div className="sa__panel" ref={panelRef}>
          <div className="sa__panel-head">
            <h2 className="sa__panel-title">Last 90 days</h2>
            <p className="sa__panel-note">Across 240 teams</p>
          </div>

          <div className="sa__tabs" role="tablist" aria-label="Proof metrics">
            {METRICS.map((metric, i) => (
              <button
                key={metric.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                className="sa__tab"
                role="tab"
                type="button"
                id={`sa-tab-${metric.id}`}
                aria-controls={`sa-panel-${metric.id}`}
                aria-selected={i === active}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(evt) => onKeyDown(evt, i)}
              >
                {metric.tab}
              </button>
            ))}
          </div>

          {METRICS.map((metric, i) => (
            <div
              key={metric.id}
              role="tabpanel"
              id={`sa-panel-${metric.id}`}
              aria-labelledby={`sa-tab-${metric.id}`}
              tabIndex={0}
              hidden={i !== active}
            >
              <p className="sa__figure">
                {metric.figure}
                <sup>{metric.unit}</sup>
              </p>
              <p className="sa__caption">{metric.caption}</p>
              <div className="sa__bars">
                {metric.bars.map((bar) => (
                  <div className="sa__bar" key={bar.label}>
                    <span className="sa__bar-label">{bar.label}</span>
                    <span className="sa__bar-value">{bar.value}</span>
                    <span className="sa__bar-track">
                      {/* keyed on the active tab so the transition restarts from zero */}
                      <span
                        className="sa__bar-fill"
                        key={`${active}-${bar.label}`}
                        style={{ "--fill": bar.fill } as React.CSSProperties}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="sa__panel-foot">
            Placeholder figures for a fictional product. Replace with your client&rsquo;s
            measured results before publishing.
          </p>
        </div>
      </div>
    </section>
  );
}
