import s from "./DotMatrix.module.css";

/**
 * Dot-matrix figures: numerals and a sparkline, drawn as SVG.
 *
 * "Data drawn as craft" (docs/DESIGN-DIRECTION-V2.md) — and only for figures
 * that are real: a version, a count of files, a count of tests, a download
 * tally. The SVG is decoration for sighted readers; the same figure is always
 * present as text beside it, so nothing is known only from the dots.
 */

/* 5×7 glyphs. "#" is a lit dot. */
const GLYPHS: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
  ",": ["..", "..", "..", "..", "..", ".#", "#."],
  "-": ["...", "...", "...", "###", "...", "...", "..."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "%": ["##..#", "##..#", "...#.", "..#..", ".#...", "#..##", "#..##"],
  v: [".....", ".....", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  $: ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
  " ": ["..", "..", "..", "..", "..", "..", ".."],
};

export function DotNumber({
  value,
  label,
  dot = 6,
  tone = "text",
  ghost = true,
  className,
}: {
  value: string | number;
  /** The words a screen reader hears. Defaults to the value itself. */
  label?: string;
  /** Pitch between dot centres, in px. */
  dot?: number;
  tone?: "text" | "accent" | "muted";
  /** Draw the unlit dots faintly, so the grid reads as a display. */
  ghost?: boolean;
  className?: string;
}) {
  const chars = String(value).split("").filter((c) => GLYPHS[c]);
  const dots: Array<{ x: number; y: number; on: boolean }> = [];
  let col = 0;
  chars.forEach((c, i) => {
    const glyph = GLYPHS[c];
    const w = glyph[0].length;
    glyph.forEach((row, y) => {
      for (let x = 0; x < w; x++) dots.push({ x: col + x, y, on: row[x] === "#" });
    });
    col += w + (i < chars.length - 1 ? 1 : 0);
  });
  const r = dot * 0.36;
  const width = Math.max(1, col) * dot;
  const height = 7 * dot;

  return (
    <span className={`${s.figure} ${s[tone]} ${className ?? ""}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
        {dots.map((d, i) =>
          d.on || ghost ? (
            <circle
              key={i}
              cx={d.x * dot + dot / 2}
              cy={d.y * dot + dot / 2}
              r={r}
              className={d.on ? s.on : s.off}
            />
          ) : null
        )}
      </svg>
      <span className="v-sr">{label ?? String(value)}</span>
    </span>
  );
}

/**
 * A sparkline as columns of dots, lit from the baseline.
 *
 * Seven rows tall. Zero draws nothing but the ghost grid, so an empty week
 * looks empty rather than flat-but-busy.
 */
export function DotSpark({
  values,
  label,
  dot = 6,
  rows = 7,
  tone = "accent",
  className,
}: {
  values: number[];
  /** Required: what the series is, in words, including the numbers. */
  label: string;
  dot?: number;
  rows?: number;
  tone?: "text" | "accent" | "muted";
  className?: string;
}) {
  const max = Math.max(0, ...values);
  const r = dot * 0.36;
  const width = values.length * dot;
  const height = rows * dot;
  return (
    <span className={`${s.figure} ${s[tone]} ${className ?? ""}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
        {values.map((v, x) => {
          const lit = max > 0 && v > 0 ? Math.max(1, Math.round((v / max) * rows)) : 0;
          return Array.from({ length: rows }, (_, y) => (
            <circle
              key={`${x}-${y}`}
              cx={x * dot + dot / 2}
              cy={y * dot + dot / 2}
              r={r}
              className={rows - y <= lit ? s.on : s.off}
            />
          ));
        })}
      </svg>
      <span className="v-sr">{label}</span>
    </span>
  );
}
