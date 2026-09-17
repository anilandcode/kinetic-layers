import Link from "next/link";

/** The benchmark's three-column footer, populated with Kinetic Layers routes. */
export default function Footer() {
  return (
    <footer className="kl-bench-footer" aria-label="Footer">
      <span>Built by <a href="https://flowmarc.com">flowmarc.com</a></span>
      <span className="kl-bench-footer-copyright">© 2026 Kinetic Layers</span>
      <nav aria-label="Footer links">
        <Link href="/library">Library</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/license">License</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  );
}
