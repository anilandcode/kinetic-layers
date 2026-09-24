import s from "./fx.module.css";

/**
 * A dotted waveform — the recording bar of the Reticla reference: columns of
 * dots, the played part in ember and the rest in grey. Decorative only (it is
 * hidden from assistive tech); the shape is seeded from `seed`, so a kit
 * always draws the same wave.
 */
export default function Waveform({
  seed = "kinetic",
  columns = 34,
  rows = 5,
  played = 0.58,
  className,
}: {
  seed?: string;
  columns?: number;
  rows?: number;
  /** Fraction drawn in ember. */
  played?: number;
  className?: string;
}) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  return (
    <span className={`${s.wave} ${className ?? ""}`} aria-hidden="true">
      {Array.from({ length: columns }, (_, c) => {
        const lit = 1 + Math.round(rand() * (rows - 1));
        return (
          <span key={c} className={s.waveCol} data-played={c / columns < played ? "" : undefined} style={{ animationDelay: `${(c % 9) * 90}ms` }}>
            {Array.from({ length: rows }, (_, r) => (
              <i key={r} data-on={rows - r <= lit ? "" : undefined} />
            ))}
          </span>
        );
      })}
    </span>
  );
}
