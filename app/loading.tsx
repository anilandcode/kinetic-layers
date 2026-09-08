/* Shown while a server component fetches. Deliberately quiet — a spinner on
   every navigation reads as slower than nothing at all.

   Wrapped in [data-kl] so the skeleton is already in the new palette: without
   it every navigation would flash the old ground for the length of the
   fetch. */
export default function Loading() {
  return (
    <div data-kl className="kl-shell">
      <div className="kl-pad" style={{ paddingBlock: 120 }} aria-busy="true" aria-live="polite">
        <span
          style={{
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Opening the library…
        </span>
      </div>
    </div>
  );
}
