import GlassButton from "./GlassButton";

/**
 * The closing call to action: a dot lattice that bends around the cursor.
 *
 * The lattice is laid out here as a percentage grid so it renders on the
 * server and is stable between builds. The motion layer takes over on pointer
 * move; untouched, the dots simply sit there at low opacity, which is a
 * perfectly good background.
 *
 * The body is pointer-events:none so the crosshair reaches the field
 * underneath — the buttons switch it back on for themselves.
 */

const COLS = 14;
const ROWS = 9;

export default function DotFieldCta({
  heading,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  heading: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  const dots = Array.from({ length: COLS * ROWS }, (_, i) => ({
    left: `${((i % COLS) + 0.5) * (100 / COLS)}%`,
    top: `${(Math.floor(i / COLS) + 0.5) * (100 / ROWS)}%`,
  }));

  return (
    <div className="kl-pad" style={{ paddingTop: 96, paddingBottom: 40 }}>
      <div className="kl-dotfield" data-dotfield>
        <div className="kl-dots" aria-hidden="true">
          {dots.map((d, i) => (
            <span key={i} className="kl-dot" data-dot style={{ left: d.left, top: d.top }} />
          ))}
        </div>

        <div className="kl-lamp" data-lamp="16" aria-hidden="true" />

        <div className="kl-cta-body">
          <h2 className="kl-cta-h2" data-cta-h2>
            {heading}
          </h2>
          <p>{body}</p>
          <div className="kl-cta-actions">
            <GlassButton href={secondaryHref} pull={6}>
              {secondaryLabel}
            </GlassButton>
            <GlassButton href={primaryHref} premium pull={6}>
              {primaryLabel}
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}
