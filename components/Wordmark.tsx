import Link from "next/link";

export function Wordmark() {
  return (
    <Link className="wordmark" href="/">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="26" height="26" rx="8" fill="#101318" stroke="#2f353f" />
        <path
          d="M7.5 19.5c4-8.5 8.5-11 13-9.5"
          stroke="#35e0a1"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="7.5" cy="19.5" r="2.2" fill="#a78bfa" />
        <circle cx="20.5" cy="10" r="2.2" fill="#35e0a1" />
      </svg>
      Direction&nbsp;Kit
    </Link>
  );
}

export function SiteHeader({ note }: { note?: string }) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Wordmark />
        {note ? <p className="header-note">{note}</p> : null}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <p>Direction Kit &mdash; founding collection in validation, 2026.</p>
        <p>
          <Link href="/privacy">Privacy</Link>
        </p>
      </div>
    </footer>
  );
}
