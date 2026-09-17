/**
 * The Kinetic Layers mark.
 *
 * Three nested layer shapes stepping down to the corner — the name, drawn. Taken
 * from `Kinetic Layers Platform.dc.html`, which is the current source; the
 * kiln-arch glyph in the design project's `Logo.dc.html` is the superseded Kiln
 * study and must not be built from.
 *
 * It lived inline in Header, so the auth pages — which build their own header
 * rather than mounting Header — carried a plain square instead and showed a
 * different logo from every other page. One component now, three callers.
 *
 * `id` exists because an SVG gradient id is document-global. Two marks on one
 * page with the same id would have the second silently reuse the first's
 * gradient, so each mount site passes its own.
 */

/** The approved neutral layered mark. */
export const MARK_GRADIENT = { from: "#F4F4F2", to: "#737371" } as const;

export default function Mark({
  size = 20,
  id = "klMark",
}: {
  size?: number;
  /** Unique per mount site — see above. */
  id?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={MARK_GRADIENT.from} />
          <stop offset="1" stopColor={MARK_GRADIENT.to} />
        </linearGradient>
      </defs>
      <path d="M4 0H36A4 4 0 0 1 40 4V36A4 4 0 0 1 36 40H10C4.5 40 0 35.5 0 30V4A4 4 0 0 1 4 0Z" fill={`url(#${id})`} />
      <path d="M14 10H36A4 4 0 0 1 40 14V36A4 4 0 0 1 36 40H15C12.2 40 10 37.8 10 35V14A4 4 0 0 1 14 10Z" fill="#FFFFFF" fillOpacity="0.34" />
      <path d="M23 20H37A3 3 0 0 1 40 23V37A3 3 0 0 1 37 40H22C20.9 40 20 39.1 20 38V23A3 3 0 0 1 23 20Z" fill="#FFFFFF" fillOpacity="0.52" />
    </svg>
  );
}
