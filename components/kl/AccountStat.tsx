/** One tile in the account's number row. Lifted out of the page it used to live
    at the bottom of, so the dashboard and any later section can both use it. */
export default function AccountStat({
  label,
  value,
  note,
  big,
}: {
  label: string;
  value: string;
  note: string;
  big?: boolean;
}) {
  return (
    <div
      data-reveal
      style={{
        borderRadius: "18px",
        border: "1px solid var(--line)",
        background: "var(--inset)",
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>
        {label}
      </span>
      <span style={{ fontWeight: 500, letterSpacing: "-0.03em", fontSize: big ? 34 : 26 }}>{value}</span>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{note}</span>
    </div>
  );
}
