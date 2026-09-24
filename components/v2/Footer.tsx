import Link from "next/link";
import Mark from "./Mark";
import s from "./Footer.module.css";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/library", label: "Library" },
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Build with it",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/mcp", label: "MCP server" },
      { href: "/license", label: "License" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.lead}>
          <Link href="/" className={s.brand} aria-label="Kinetic Layers, home">
            <Mark size={24} />
            <span>Kinetic Layers</span>
          </Link>
          <p>Original websites and motion kits, with the spec and the prompts that rebuild them.</p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className={s.column}>
            <h2>{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className={s.base}>
        <span>© 2026 Kinetic Layers</span>
        <span>
          Made by <a href="https://flowmarc.com">flowmarc.com</a>
        </span>
      </div>
    </footer>
  );
}
