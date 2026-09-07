import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/kl/PageShell";
import { Code, ProseHero } from "@/components/kl/Prose";
import { getViewer } from "@/lib/kl/viewer";
import { SITE_URL } from "@/lib/kl/site";

export const metadata: Metadata = {
  alternates: { canonical: "/mcp" },
  title: "MCP",
  description: "Search the vault and read prompts from inside your agent.",
};

/**
 * How to connect the MCP endpoint.
 *
 * The endpoint itself is app/api/mcp/route.ts. This page is the instructions,
 * and it deliberately shows the real URL and the real tool names rather than a
 * sanitised example — the commands here are meant to be pasted and work.
 */
export default async function Mcp() {
  const viewer = await getViewer();
  const endpoint = `${SITE_URL}/api/mcp`;

  const tools = [
    {
      name: "search_assets",
      what: "Find something by free text, category or free-only. Returns names, slugs and whether each needs a subscription.",
    },
    {
      name: "get_prompt",
      what: "Read one prompt in full. This is the gated one — free assets need any key, paid assets need a key on a Premium plan.",
    },
    { name: "list_categories", what: "What the vault is filed under, with a count for each." },
  ];

  return (
    <PageShell>
        <ProseHero
          eyebrow="MCP"
          title="Use the vault from inside your agent."
          lead="Browsing a gallery to copy a string into another window is the long way round. Connect Kinetic Layers over MCP and your agent can search the catalogue and pull a prompt straight into what it is building."
        />

        <section id="connect" className="shell prose" style={{ paddingBlock: "24px 20px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 8 }}>
            1. Get a key
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>
            Keys live on your{" "}
            <Link data-nav href="/account" style={{ color: "var(--sage)" }}>
              account page
            </Link>
            . A key carries your plan — it opens exactly what you can open on the
            site, and nothing more. Searching works without one; reading a prompt
            does not.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", margin: "34px 0 8px" }}>
            2. Add the server
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>
            Claude Code:
          </p>
          <Code>{`claude mcp add --transport http kiln ${endpoint} \\
  --header "Authorization: Bearer kiln_your_key_here"`}</Code>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", marginTop: 22 }}>
            Cursor, or anything reading <span className="mono" style={{ fontSize: 13 }}>mcp.json</span>:
          </p>
          <Code>{`{
  "mcpServers": {
    "kiln": {
      "url": "${endpoint}",
      "headers": {
        "Authorization": "Bearer kiln_your_key_here"
      }
    }
  }
}`}</Code>

          <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", margin: "34px 0 8px" }}>
            3. Ask for something
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>
            &ldquo;Find me a dark hero scene in Kinetic Layers and use its prompt.&rdquo; The agent
            searches, picks one, and reads the prompt without you leaving the
            editor.
          </p>
        </section>

        <section className="shell prose" style={{ paddingBlock: "30px 20px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 6 }}>
            The tools
          </h2>
          <dl style={{ display: "flex", flexDirection: "column", margin: 0 }}>
            {tools.map((t) => (
              <div key={t.name} style={{ padding: "20px 0", borderTop: "1px solid var(--hairline)" }}>
                <dt className="mono" style={{ fontSize: 13, color: "var(--sage)", marginBottom: 7 }}>
                  {t.name}
                </dt>
                <dd style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: "var(--muted)" }}>{t.what}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="shell prose" style={{ paddingBlock: "20px 90px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 8 }}>
            What it will refuse
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>
            The same things the site refuses, decided by the same code. A key on
            the free plan asking for a paid prompt gets told so and pointed at{" "}
            <Link data-nav href="/pricing" style={{ color: "var(--sage)" }}>
              pricing
            </Link>
            ; a request with no key at all gets told to make one. There is no
            back door here — that was the point of building it this way rather
            than as a separate service.
          </p>
        </section>
      </PageShell>
  );
}
