# Start here

This is **Kinetic Layers**, live at https://kineticlayers.com on Vercel.

The name is Kinetic Layers everywhere — in code, in copy, in identifiers. "Kiln"
and "Direction Kit" are retired and should not appear in anything new. Where they
survive it is deliberate and historical: the archived demand test at
`app/_archive-direction-kit/`, applied Supabase migration filenames, the GitHub
repo slug, and the `kiln-media` Cloudflare Pages project.

Before doing anything else, in this order:

1. **`HANDOFF.md`** — the decisions, the traps and what is still broken. It is
   the state of the product; this file is only tooling rules.
2. **`graphify-out/GRAPH_REPORT.md`** — the code graph. 815 nodes over 151 files.
   Read it before answering any architecture question, and prefer
   `graphify query "..."` over grep for anything that crosses module boundaries.
   Details in the graphify section at the bottom of this file.

If `graphify-out/` is missing, rebuild it with `graphify update .` — seconds,
AST-only, no API cost.

---

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |

## graphify

This repo has a graphify knowledge graph at `graphify-out/` (gitignored — rebuild it, do not look for it in git).

- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- For cross-module "how does X relate to Y" questions, prefer `graphify query "..."`, `graphify path "A" "B"` or `graphify explain "X"` over grep — these traverse the graph's edges instead of scanning files.
- After changing code, run `graphify update .` to refresh it. AST only, no LLM, no API cost.
- The graph records the commit it was built from. Compare it against `git rev-parse HEAD` before trusting it — but note the stamp only advances when the rebuild actually changes topology, so a stamp behind HEAD after a docs-only or comment-only commit is expected, not stale.
- Communities are named after their hub file (e.g. `community=mcp/route.ts`), so a query result tells you which cluster a symbol belongs to without a second lookup.
- Built AST-only, no LLM, so edges are what the parser can prove. A semantic pass (`GEMINI_API_KEY` plus `graphify extract .`) would add inferred edges at the cost of an LLM run over the corpus.
- Requires the SQL extra: `uv tool install "graphifyy[sql]" --force`. Without it the ten Supabase migrations parse to nothing and the graph silently loses the schema, RLS policies and `consume_quota`.
- `graphify query` truncates to a token budget and says so. If the answer looks missing, raise `--budget` before concluding the graph does not know.
