import type { Metadata } from "next";
import Link from "next/link";
import { Code, ContentPage, Parts, ProseBody, ProseHero, ProseSection } from "@/components/v2/Prose";
import { getKits } from "@/lib/v2/data";
import { SITE_URL } from "@/lib/kl/site";
import { LIMITS, describeAllowance } from "@/lib/kl/limits";

export const metadata: Metadata = {
  alternates: { canonical: "/docs" },
  title: "Docs",
  description: "What is in a kit, and how to get a second, better result out of it.",
};

/**
 * How to actually use the thing you opened.
 *
 * Both reference libraries carry one of these — getlayers as Docs, motionsites
 * as Academy — and the reason is the same: a prompt handed over with no
 * context gets one attempt and then abandoned. This describes what is in a kit
 * (the same six parts the kit page's workbench draws) and how to get a second,
 * better result out of it.
 */
export default async function Docs() {
  const kits = await getKits();
  const free = kits.filter((k) => k.free).length;

  return (
    <ContentPage>
      <ProseHero
        eyebrow="Docs"
        title="What is in a kit, and how to get a second result out of it."
        lead="Every kit is a finished design with the spec that describes it and the prompts that rebuild it. The prompts are the part worth learning to edit."
      />

      <ProseBody
        toc={[
          { id: "anatomy", label: "The anatomy of a kit" },
          { id: "editing", label: "Editing a prompt" },
          { id: "editor", label: "From your editor" },
          { id: "limits", label: "Daily limits" },
          { id: "use", label: "What you may do" },
        ]}
      >
        <ProseSection id="anatomy" title="The anatomy of a kit">
          <p>
            Six parts, drawn on every kit page as a node canvas. Parts a kit does not have yet are drawn as outlines and
            named under it — nothing is implied that is not there.
          </p>
          <Parts
            items={[
              ["Reference", "The finished design, running. Everything else in the kit is measured against it."],
              ["Design spec", "Type, colour, spacing and motion, written down — what makes the design this design."],
              [
                "Reconstruction prompt",
                "Rebuilds the reference from the spec in your stack. The first lines are public; the rest opens with an account.",
              ],
              [
                "Tested rebuild",
                "A record of each time someone ran the prompt: the tool, the model, the date, and whether it matched.",
              ],
              ["Adaptation prompt", "Keeps the structure and motion, and swaps the identity for yours."],
              ["Your brand", "What you make with it. Nothing on this part is ours to verify."],
            ]}
          />
        </ProseSection>

        <ProseSection id="editing" title="Editing a prompt without breaking it">
          <p>
            Most of these prompts are long because the detail is doing the work. The temptation is to rewrite the whole
            thing; the better move is to change one clause and re-run. Change six things at once and you cannot tell which
            one moved the result.
          </p>
          <p>
            The clauses worth reaching for first are usually the palette, the type and the copy — which is what the
            adaptation prompt is for. Structure and motion are what make the kit the kit; edit those and you have a
            different design, which may be what you want, but know that is what you did.
          </p>
        </ProseSection>

        <ProseSection id="editor" title="From your editor">
          <p>
            Connect the <Link href="/mcp">MCP server</Link> and skip the browser entirely — your agent searches the library
            and reads the prompts you have access to, in the editor you are already in.
          </p>
          <Code label="terminal">{`claude mcp add --transport http kinetic-layers ${SITE_URL}/api/mcp \\
    --header "Authorization: Bearer kl_your_key"`}</Code>
        </ProseSection>

        <ProseSection id="limits" title="Daily limits">
          <p>
            Reading a prompt and downloading a file each count against a daily allowance: {describeAllowance("free")} on a
            free account, {describeAllowance("premium")} on Premium. Without an account you can read {LIMITS.anon.prompt}{" "}
            free prompt a day and download nothing.
          </p>
          <p>
            The window rolls: an allowance frees up twenty-four hours after it was spent, not at midnight. Browsing costs
            nothing — the kit page only spends a read when you press <em>Read the full prompt</em>. The same budget covers
            the website and the MCP server, so an agent and a browser draw on one pot.
          </p>
          <p>
            These are here to stop a script taking the library in an afternoon, not to ration real use. If you are hitting
            them doing ordinary work, that is a bug in the number — say so.
          </p>
        </ProseSection>

        <ProseSection id="use" title="What you may do with the result" last>
          <p>
            Use it in client work, modify it freely, keep it after cancelling. Do not resell the kit as a kit. That is the
            whole of it — the detail is on the <Link href="/license">licence page</Link>.
          </p>
          <p>
            {free > 0
              ? `${free} ${free === 1 ? "kit is" : "kits are"} free to any account, which is the cheapest way to find out whether the rest are worth it — each card says which.`
              : "Free kits appear in the library as they are published."}{" "}
            <Link href="/library">Browse the library</Link>.
          </p>
        </ProseSection>
      </ProseBody>
    </ContentPage>
  );
}
