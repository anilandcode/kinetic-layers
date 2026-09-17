import PageShell from "@/components/kl/PageShell";
import GlassButton from "@/components/kl/GlassButton";

export default function NotFound() {
  return (
    <PageShell>
      <div
        className="kl-pad"
        style={{
          paddingBlock: "120px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <span className="kl-kicker">404</span>
        <h1 className="kl-prose-h1" style={{ maxWidth: "18ch" }}>
          Nothing here. It may have been renamed.
        </h1>
        <p className="kl-prose-lead" style={{ maxWidth: 460 }}>
          Slugs change when an asset is retitled. The library is the reliable way back in.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <GlassButton href="/library" pull={5}>
            Browse the library
          </GlassButton>
          <GlassButton href="/pricing" ghost>
            See pricing
          </GlassButton>
        </div>
      </div>
    </PageShell>
  );
}
