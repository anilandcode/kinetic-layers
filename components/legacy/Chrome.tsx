import KlMark from "@/components/kl/Mark";

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
  /* The real mark, not a coloured square. This used to be a sage gradient, then
     a flat amber one — both were placeholders standing in for the layered glyph
     the rest of the site shows. `klMarkAuth` keeps its gradient id distinct from
     Header's. */
  return <KlMark size={16} id="klMarkAuth" />;
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
        color: "var(--ground)",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}
