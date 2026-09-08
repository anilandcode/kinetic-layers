/**
 * What survives of the old chrome.
 *
 * Nav, Footer and ModeToggle are gone: every route renders the Kinetic Layers
 * header now, and ModeToggle existed only to swap between the dark treatment
 * and /light, which no longer exists — the palette has a real theme toggle.
 *
 * These two remain because the auth pages and the account page still use them:
 * Mark is the wordmark glyph, Avatar the initials bubble.
 */
export function Mark() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        background: "linear-gradient(140deg,rgba(185,206,149,0.9),rgba(120,150,95,0.55))",
        border: "1px solid rgba(185,206,149,0.5)",
        flexShrink: 0,
      }}
    />
  );
}

export function Avatar({ email, size = 26 }: { email: string | null; size?: number }) {
  const initial = (email ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "99px",
        /* Solid, not a gradient: the initial has to clear contrast against the
           darkest part of the fill, and the system bans gradient surfaces. */
        background: "var(--amber)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.42),
        color: "var(--amber)",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}
