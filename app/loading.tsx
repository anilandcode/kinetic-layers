/* Shown while a server component fetches. Deliberately quiet — a spinner on
   every navigation reads as slower than nothing at all. */
export default function Loading() {
  return (
    <div className="shell" style={{ paddingBlock: 120 }} aria-busy="true" aria-live="polite">
      <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>
        Opening the vault…
      </span>
    </div>
  );
}
