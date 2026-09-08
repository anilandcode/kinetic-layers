import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/kl/PageShell";
import { Code, ProseHero } from "@/components/kl/Prose";
import { getViewer } from "@/lib/kl/viewer";
import { getSettings } from "@/lib/sanity/queries";
import { LIMITS, describeAllowance } from "@/lib/kl/limits";

export const metadata: Metadata = {
  alternates: { canonical: "/docs" },
  title: "Docs",
  description: "What is in an asset, and how to use it.",
};

/**
 * How to actually use the thing you downloaded.
 *
 * Both reference libraries carry one of these — getlayers as Docs, motionsites
 * as Academy — and the reason is the same: a prompt handed over with no context
 * gets one attempt and then abandoned. This describes what is in an asset and
 * how to get a second, better result out of it.
 */
export default async function Docs() {
  const [viewer, settings] = await Promise.all([getViewer(), getSettings()]);

  return (
    <PageShell>
        <ProseHero
          eyebrow="Docs"
          title="What is in an asset, and how to get a second result out of it."
          lead="Every asset ships with the output, the source, and the prompt that made it. The prompt is the part worth learning to edit."
        />

        <section id="anatomy" className="shell prose" style={{ paddingBlock: "24px 10px" }}>
          <h2 style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>
            The anatomy of an asset
          </h2>
          <dl style={{ display: "flex", flexDirection: "column", margin: 0 }}>
            {[
              ["The preview", "What it looks like running. Hover a card to see it move; the item page plays it in full."],
              ["The prompt", "The exact text that produced the output, not a cleaned-up retelling of it. Free assets show it to any account; the rest need a subscription."],
              ["The source files", "Whatever the thing is actually made of — scene modules, components, configs, weights, maps. Downloadable one at a time from the item page."],
              ["The spec", "Where it was used, what it costs to run, what it depends on. The honest version, including the parts that are awkward."],
            ].map(([h, p]) => (
              <div key={h} style={{ padding: "20px 0", borderTop: "1px solid var(--line)" }}>
                <dt style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)", marginBottom: 7 }}>
                  {h}
                </dt>
                <dd style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: "var(--muted)" }}>{p}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="shell prose" style={{ paddingBlock: "26px 10px" }}>
          <h2 style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>
            Editing a prompt without breaking it
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)" }}>
            Most of these prompts are long because the detail is doing the work.
            The temptation is to rewrite the whole thing; the better move is to
            change one clause and re-run. A prompt that produces a warm studio
            set will produce a cold one if you change the lighting line and leave
            the rest alone — change six things at once and you cannot tell which
            one moved the result.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)", marginTop: 16 }}>
            The clauses worth reaching for first are usually the light, the
            palette, and the camera. Structure and composition are what makes the
            asset the asset — edit those and you have a different asset, which
            may be what you want, but know that is what you did.
          </p>
        </section>

        <section className="shell prose" style={{ paddingBlock: "26px 10px" }}>
          <h2 style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>
            From your editor
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)" }}>
            Connect the{" "}
            <Link data-nav href="/mcp" style={{ color: "var(--amber)" }}>
              MCP endpoint
            </Link>{" "}
            and skip the browser entirely — your agent searches the vault and
            reads prompts you have access to, in the editor you are already in.
          </p>
          <Code>{`# in Claude Code
claude mcp add --transport http kiln https://your-kiln/api/mcp \\
  --header "Authorization: Bearer kiln_your_key"`}</Code>
        </section>

        <section className="shell prose" style={{ paddingBlock: "26px 10px" }}>
          <h2 style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>
            Daily limits
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)" }}>
            Reading a prompt and downloading a file each count against a daily
            allowance: {describeAllowance("free")} on a free account,{" "}
            {describeAllowance("premium")} on Premium. Without an account you
            can read {LIMITS.anon.prompt} free prompt a day and download nothing.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)", marginTop: 16 }}>
            The window rolls: an allowance frees up twenty-four hours after it
            was spent, not at midnight. Browsing costs nothing — the item page
            only spends a read when you press <em>Reveal the prompt</em>. The
            same budget covers the website, the copy button on a library card
            and the MCP endpoint, so an agent and a browser draw on one pot.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)", marginTop: 16 }}>
            These are here to stop a script taking the catalogue in an
            afternoon, not to ration real use. If you are hitting them doing
            ordinary work, that is a bug in the number — say so.
          </p>
        </section>

        <section className="shell prose" style={{ paddingBlock: "26px 90px" }}>
          <h2 style={{ fontSize: 25, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 10 }}>
            What you may do with the result
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)" }}>
            Use it in client work, modify it freely, keep it after cancelling.
            Do not resell the asset as an asset. That is the whole of it — the
            detail is on the{" "}
            <Link data-nav href="/license" style={{ color: "var(--amber)" }}>
              licence page
            </Link>
            .
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--muted)", marginTop: 16 }}>
            {settings.freeThisMonth > 0
              ? `${settings.freeThisMonth} assets are free to any account, which is the cheapest way to find out whether the rest are worth it — each card says which.`
              : "Free assets appear here as they are published."}{" "}
            <Link data-nav href="/library" style={{ color: "var(--amber)" }}>
              Browse the library
            </Link>
            .
          </p>
        </section>
      </PageShell>
  );
}
