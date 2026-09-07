import Link from "next/link";
import { Footer, Nav } from "@/components/legacy/Chrome";

export default function NotFound() {
  return (
    <>
      <a className="skip-link" href="#gone">Skip to the message</a>
      <Nav />
      <main id="gone" className="shell" style={{ paddingBlock: "120px 80px", display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
          404
        </span>
        <h1 style={{ fontSize: "clamp(30px,4vw,52px)", fontWeight: 500, letterSpacing: "-0.03em", maxWidth: "18ch" }}>
          Nothing here. It may have been renamed.
        </h1>
        <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 460 }}>
          Slugs change when an asset is retitled. The library is the reliable way back in.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <Link data-nav href="/library" className="btn btn--primary">Browse the library</Link>
          <Link data-nav href="/collections" className="btn btn--ghost">See the collections</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
