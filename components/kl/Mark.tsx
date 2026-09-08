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

export const MARK_GRADIENT = { from: "#8C8A84", to: "#E8853A" } as const;

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
      <path d="M0 0H40V40H10C4.5 40 0 35.5 0 30V0Z" fill={`url(#${id})`} />
      <path d="M10 10H40V40H15C12.2 40 10 37.8 10 35V10Z" fill="#FFFFFF" fillOpacity="0.34" />
      <path d="M20 20H40V40H22C20.9 40 20 39.1 20 38V20Z" fill="#FFFFFF" fillOpacity="0.52" />
    </svg>
  );
}
