/**
 * The Kinetic Layers mark: three nested layers stepping down to the corner.
 *
 * Same geometry as components/kl/Mark, redrawn in the theme's own colours so
 * it holds on both canvases — the outer layer is the text colour, the middle
 * one lets the canvas through, and the innermost is the signal colour.
 */
export default function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d="M4 0H36A4 4 0 0 1 40 4V36A4 4 0 0 1 36 40H10C4.5 40 0 35.5 0 30V4A4 4 0 0 1 4 0Z"
        fill="var(--v-text)"
      />
      <path
        d="M14 10H36A4 4 0 0 1 40 14V36A4 4 0 0 1 36 40H15C12.2 40 10 37.8 10 35V14A4 4 0 0 1 14 10Z"
        fill="var(--v-canvas)"
        fillOpacity="0.42"
      />
      <path
        d="M23 20H37A3 3 0 0 1 40 23V37A3 3 0 0 1 37 40H22C20.9 40 20 39.1 20 38V23A3 3 0 0 1 23 20Z"
        fill="var(--v-accent)"
      />
    </svg>
  );
}
