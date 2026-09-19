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
    <div data-reveal className="kl-account-stat">
      <span className="kl-mono kl-account-stat-label">{label}</span>
      <span className={`kl-account-stat-value${big ? " kl-account-stat-value--big" : ""}`}>{value}</span>
      <span className="kl-account-stat-note">{note}</span>
    </div>
  );
}
