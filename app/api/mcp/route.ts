import { NextResponse } from "next/server";
import { canReadPrompt } from "@/lib/kiln/gate";
import { keyFromRequest, viewerFromApiKey } from "@/lib/kiln/apikey";
import { consumeQuota, quotaRefusal, refund, subjectFor, type Subject } from "@/lib/kiln/quota";
import { describeReset } from "@/lib/kiln/limits";
import { getAsset, getAssets, getPromptBody, searchAssets } from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/kiln/site";
import type { Viewer } from "@/lib/kiln/types";

/**
 * MCP server, over streamable HTTP.
 *
 * Both reference libraries ship one, and for a prompt library it is the obvious
 * surface: the thing a visitor wants is text, and the place they want it is the
 * agent they are already talking to. Browsing a gallery to copy a string into
 * another window is the long way round.
 *
 * The important property is that this is NOT a second door. Every tool that
 * returns gated content asks `canDownload` — the same function the item page
 * and /api/download ask. An MCP endpoint that skipped it would be a paywall
 * with a hole cut in the back.
 *
 * Auth is an API key, because an agent has no cookies. Browsing tools work
 * unauthenticated (the catalogue is public); anything gated requires the key.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";

type RpcId = string | number | null;

const ok = (id: RpcId, result: unknown) => NextResponse.json({ jsonrpc: "2.0", id, result });

const fail = (id: RpcId, code: number, message: string) =>
  NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } });

/** MCP reports tool failures inside a successful result, flagged isError. */
const toolError = (id: RpcId, message: string) =>
  ok(id, { content: [{ type: "text", text: message }], isError: true });

const text = (id: RpcId, body: string) => ok(id, { content: [{ type: "text", text: body }] });

const TOOLS = [
  {
    name: "search_assets",
    description:
      "Search the Kiln catalogue of prompts, templates, 3D scenes, backgrounds and agent workflows. Returns names, slugs and whether each is free. Use get_prompt with a slug to read the full prompt text.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text. Matches name, type, stack and mood." },
        category: {
          type: "string",
          description: "Filter by what it is for, e.g. Hero, Landing page, SaaS, Background, Workflow.",
        },
        free_only: { type: "boolean", description: "Only assets available on a free account." },
      },
    },
  },
  {
    name: "get_prompt",
    description:
      "Read the full prompt text for one asset. Free assets are readable without a key at a low daily rate; a Kiln API key raises the allowance, and paid assets require a key on an active unlimited subscription. Every read counts against the same daily budget as the website.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "The asset slug from search_assets." } },
      required: ["slug"],
    },
  },
  {
    name: "list_categories",
    description: "List the categories assets are filed under, with a count for each.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

async function runTool(
  name: string,
  args: Record<string, unknown>,
  viewer: Viewer | null,
  subject: Subject
) {
  if (name === "list_categories") {
    const assets = await getAssets();
    const tally: Record<string, number> = {};
    for (const a of assets) if (a.category) tally[a.category] = (tally[a.category] ?? 0) + 1;
    const lines = Object.entries(tally)
      .sort(([, x], [, y]) => y - x)
      .map(([c, n]) => `${c} (${n})`);
    return { text: lines.length ? lines.join("\n") : "No assets published yet." };
  }

  if (name === "search_assets") {
    const query = typeof args.query === "string" ? args.query : "";
    const category = typeof args.category === "string" ? args.category : null;
    const freeOnly = args.free_only === true;

    /* An empty query means "browse", so fall back to the whole catalogue
       rather than returning nothing — an agent filtering by category alone is
       a perfectly reasonable request. */
    let hits = query.trim() ? await searchAssets(query, 40) : await getAssets();
    if (category) hits = hits.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
    if (freeOnly) hits = hits.filter((a) => a.free);

    if (hits.length === 0) return { text: "Nothing matched." };

    const lines = hits.slice(0, 25).map((a) => {
      const access = a.free ? "free" : "unlimited only";
      const bits = [a.type, a.category, a.theme].filter(Boolean).join(" · ");
      return `${a.name}\n  slug: ${a.slug}\n  ${bits} — ${access}\n  ${SITE_URL}/item/${a.slug}`;
    });
    return {
      text: `${hits.length} result${hits.length === 1 ? "" : "s"}${hits.length > 25 ? " (showing 25)" : ""}:\n\n${lines.join("\n\n")}`,
    };
  }

  if (name === "get_prompt") {
    const slug = typeof args.slug === "string" ? args.slug : "";
    if (!slug) return { error: "Which asset? Pass a slug from search_assets." };

    const asset = await getAsset(slug);
    if (!asset) return { error: `No asset with slug "${slug}".` };

    /* canReadPrompt, the same predicate the website asks — not a copy of the
       rule, the rule. An unkeyed agent is treated exactly like an anonymous
       browser: a free asset's prompt, once a day. Using canDownload here would
       have made this the one door with its own policy. */
    if (!canReadPrompt(viewer, asset)) {
      return {
        error: viewer
          ? `"${asset.name}" is included with unlimited. Your key is on the free plan. ${SITE_URL}/pricing`
          : `"${asset.name}" needs an account. Create a Kiln API key at ${SITE_URL}/account and send it as "Authorization: Bearer <key>".`,
      };
    }

    /* The same meter the website uses, against the same subject. Without this
       an API key could read the whole catalogue in a loop while the browser
       paths were carefully rationed — a quota with a back door is decoration. */
    const quota = await consumeQuota(subject, "prompt", slug);
    if (!quota.allowed) {
      const { body: refusal } = quotaRefusal("prompt", quota);
      return {
        error: `${refusal.message} Resets in ${describeReset(quota.resetsAt)}. ${SITE_URL}/pricing`,
      };
    }

    const prompt = await getPromptBody(slug);
    if (!prompt) {
      await refund(quota.usageId);
      return { error: `"${asset.name}" has no prompt attached — it ships as files.` };
    }

    const left = quota.remaining;
    return {
      text: `${asset.name}\n${"—".repeat(asset.name.length)}\n\n${prompt}\n\n---\n${left} of ${quota.limit} prompt reads left today.`,
    };
  }

  return { error: `Unknown tool: ${name}` };
}

export async function POST(request: Request) {
  let body: { jsonrpc?: string; id?: RpcId; method?: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return fail(null, -32700, "Parse error");
  }

  const id = body.id ?? null;
  const method = body.method ?? "";

  /* Notifications carry no id and expect no reply — 202 with an empty body is
     what the spec asks for, and answering them with a result is a protocol
     error some clients treat as fatal. */
  if (method.startsWith("notifications/")) return new NextResponse(null, { status: 202 });

  if (method === "initialize") {
    return ok(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "kiln", version: "1.0.0" },
      instructions:
        "Kiln is a library of prompts, templates, scenes and agent workflows. Use search_assets to find something, then get_prompt with its slug to read the prompt in full. Prompt reads are rate limited per day and share one budget with the website; an API key from the Kiln account page raises the allowance, and paid assets need a key on an unlimited subscription.",
    });
  }

  if (method === "ping") return ok(id, {});

  if (method === "tools/list") return ok(id, { tools: TOOLS });

  if (method === "tools/call") {
    const name = String(body.params?.name ?? "");
    const args = (body.params?.arguments ?? {}) as Record<string, unknown>;

    /* Resolved per request. There is no session to cache and a key can be
       revoked between calls, so it is checked every time. */
    const viewer = await viewerFromApiKey(keyFromRequest(request));
    /* An unkeyed agent is metered like an anonymous browser: same subject
       derivation, same allowance, one shared budget. */
    const subject = await subjectFor(viewer, request);

    try {
      const out = await runTool(name, args, viewer, subject);
      return out.error ? toolError(id, out.error) : text(id, out.text!);
    } catch (err) {
      console.error("mcp tool failed:", name, err);
      return toolError(id, "That failed on our side. Try again.");
    }
  }

  return fail(id, -32601, `Method not found: ${method}`);
}

/** A GET here is usually a person pasting the URL into a browser. */
export async function GET() {
  return NextResponse.json({
    name: "kiln",
    protocol: "mcp",
    transport: "streamable-http",
    protocolVersion: PROTOCOL_VERSION,
    tools: TOOLS.map((t) => t.name),
    docs: `${SITE_URL}/mcp`,
  });
}
