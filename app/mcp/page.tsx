import type { Metadata } from "next";
import Link from "next/link";
import { Code, ContentPage, Parts, ProseBody, ProseHero, ProseSection } from "@/components/v2/Prose";
import { HUES } from "@/lib/v2/gradient";
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
export default function Mcp() {
  const endpoint = `${SITE_URL}/api/mcp`;

  const tools: Array<[string, string]> = [
    [
      "search_assets",
      "Find a kit by free text, category or free-only. Returns names, slugs and whether each needs a subscription.",
    ],
    [
      "get_prompt",
      "Read one prompt in full. This is the gated one — free kits need any key, paid kits need a key on a Premium plan.",
    ],
    ["list_categories", "What the library is filed under, with a count for each."],
  ];

  return (
    <ContentPage>
      <ProseHero
        eyebrow="MCP"
        title="Use the library from inside your agent."
        lead="Browsing a gallery to copy a string into another window is the long way round. Connect Kinetic Layers over MCP and Claude Code or Cursor can search the kits and pull a prompt straight into what it is building."
        hue={HUES.violet}
        second={HUES.ember}
      />

      <ProseBody
        toc={[
          { id: "key", label: "1. Get a key" },
          { id: "connect", label: "2. Add the server" },
          { id: "ask", label: "3. Ask for something" },
          { id: "tools", label: "The tools" },
          { id: "refuse", label: "What it will refuse" },
        ]}
      >
        <ProseSection id="key" title="1. Get a key">
          <p>
            Keys live on your <Link href="/account/profile">profile page</Link>. A key carries your plan — it opens exactly
            what you can open on the site, and nothing more. Searching works without one; reading a prompt does not.
          </p>
        </ProseSection>

        <ProseSection id="connect" title="2. Add the server">
          <p>Claude Code:</p>
          <Code label="terminal">{`claude mcp add --transport http kinetic-layers ${endpoint} \\
    --header "Authorization: Bearer kl_your_key_here"`}</Code>
          <p>
            Cursor, or anything reading <code>mcp.json</code>:
          </p>
          <Code label="mcp.json">{`{
    "mcpServers": {
      "kinetic-layers": {
        "url": "${endpoint}",
        "headers": {
          "Authorization": "Bearer kl_your_key_here"
        }
      }
    }
  }`}</Code>
        </ProseSection>

        <ProseSection id="ask" title="3. Ask for something">
          <p>
            “Find me a dark hero in Kinetic Layers and use its prompt.” The agent searches, picks one, and reads the prompt
            without you leaving the editor.
          </p>
        </ProseSection>

        <ProseSection id="tools" title="The tools">
          <Parts mono items={tools} />
        </ProseSection>

        <ProseSection id="refuse" title="What it will refuse" last>
          <p>
            The same things the site refuses, decided by the same code. A key on the free plan asking for a paid prompt
            gets told so and pointed at <Link href="/pricing">pricing</Link>; a request with no key at all gets told to
            make one. There is no back door here — that was the point of building it this way rather than as a separate
            service.
          </p>
        </ProseSection>
      </ProseBody>
    </ContentPage>
  );
}
