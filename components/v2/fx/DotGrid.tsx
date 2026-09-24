import s from "./fx.module.css";

/**
 * A matrix of dots that stands for real things — the reference dashboard's
 * transaction grid, used for facts: one dot per published kit, one per part a
 * kit has. `filled` dots are solid, `half` are ringed, the rest are the empty
 * grid. The words live in `label`.
 */
export default function DotGrid({
  cols,
  rows,
  filled = [],
  half = [],
  size = 10,
  gap = 12,
  label,
  className,
}: {
  cols: number;
  rows: number;
  /** Indexes, left to right then top to bottom. */
  filled?: number[];
  half?: number[];
  size?: number;
  gap?: number;
  label: string;
  className?: string;
}) {
  const on = new Set(filled);
  const ring = new Set(half);
  const pitch = size + gap;
  const w = cols * pitch - gap;
  const h = rows * pitch - gap;
  return (
    <span className={`${s.dotGrid} ${className ?? ""}`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
        {Array.from({ length: cols * rows }, (_, i) => {
          const cx = (i % cols) * pitch + size / 2;
          const cy = Math.floor(i / cols) * pitch + size / 2;
          const kind = on.has(i) ? s.dotOn : ring.has(i) ? s.dotRing : s.dotOff;
          return <circle key={i} cx={cx} cy={cy} r={size / 2 - 0.75} className={kind} />;
        })}
      </svg>
      <span className="v-sr">{label}</span>
    </span>
  );
}
