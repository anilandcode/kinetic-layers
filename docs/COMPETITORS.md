# Kinetic Layers — competitor brief

Researched 2026-09-24. Every price and feature below was read from the
competitor's own live site on that date; the source is linked under each profile.
This is research, not a claim of market position. Prices change often and
several were shown as discounts, so re-check before quoting any of them. Do not
lift comparative marketing copy from this document.

Supersedes the landscape table in
[KINETIC-LAYERS-MASTER-PLAN.md](KINETIC-LAYERS-MASTER-PLAN.md) §1, which was
researched on 2026-09-10.

## Summary

The two direct competitors already sell what Kinetic Layers sells today: a
motion-led design library delivered as prompts, with source code, a commercial
licence, a community and an MCP server. Both undercut the proposed Founding
Membership with one-time lifetime prices, and MotionSites already offers custom
prompts for $99 to $249. **Kinetic Layers cannot win on volume, price or feature
count.**

The opening that remains is the one the master plan bets on, and none of the
pages reviewed occupy it: **proof that a kit actually rebuilds.** MotionSites
promises "pixel-perfect" and GetLayers promises "1 in 1 results" with source, but
neither publishes tested reconstructions — the tool, model and date used, with
side-by-side comparisons and known limitations. A second, related opening is
**adaptation as a deliverable**: competitors say "swap the subject in one
instruction"; nobody ships an adaptation prompt and a design specification as
part of the product.

## Where Kinetic Layers stands today

| | Live at kineticlayers.com | Local only, not deployed |
|---|---|---|
| Build | The pre-redesign build deployed 2026-09-10 | Bench redesign, `3daf27f` → `6a0223c` (09-17/18) |
| Catalogue | 17 assets: 15 placeholders plus "Asset" and "verdro" | 2 items with real previews, plus 20 MotionSites references on the homepage |
| Price | Free during early access | Free; $24/month Founding Membership proposed, interest list only |
| Delivery | Gated prompt and files, download quotas | Same, plus a file manifest on the item page |
| MCP | `search_assets`, `get_prompt`, `list_categories`, API-key auth | Unchanged |

## Direct competitors

These sell the same product to the same buyer.

### GetLayers — by Textura (agency)

Templates, sections, 3D scenes, video backgrounds and gradients, written as
prompts. All made in-house by Textura. Claims "1,000+ creators".

| | |
|---|---|
| Free | A curated set of layers with the full prompt, no card. For trying only: "extend one into your own thing rather than shipping it untouched" |
| Unlimited | The rest of the prompt library plus a commercial licence. Yearly and lifetime options; the price loads client-side and could not be read |
| Full Stack | **$129 lifetime** (shown as reduced from $359). Adds source for every layer, animated backgrounds, 3D scenes, gradients with live tuning, the private Discord |
| Licence | Commercial on any paid plan; no attribution; unlimited sites |
| Distinctive | **Live tuning**: adjust a scene or gradient on the page, then copy a prompt that carries your values. **Compose**: a scene plus a UI template, copied as one prompt |
| MCP | **Full Stack only.** OAuth sign-in, no API key. Claude Code plugin (`textura-agency/getlayers-plugin`) or `https://mcp.getlayers.ai/mcp`. Builds whole sites, pulls assets, adds motion to an existing codebase, and **generates original 3D scenes** from a mood plus reference images |
| Open source | `next16-claude-starter` and `ai-design-vault` on GitHub, both funnels into the paid plans |
| Categories | SaaS, Fintech, AI/Tech, Portfolio, Health/Science, E-commerce, Hospitality/Travel, Agency/Studio |

Sources: [pricing](https://www.getlayers.ai/pricing) ·
[home](https://www.getlayers.ai/) · [MCP](https://www.getlayers.ai/mcp)

### MotionSites

Website prompts for heroes, landing pages, footers, features, CTAs and pricing,
plus backgrounds, apps and 40+ Lovable templates. Claims **500+ prompts**.
Cross-promotes Design Rocket, an AI web-design course.

| | |
|---|---|
| Free | An account can open **3 free prompts** |
| 3 months | $129, capped at 3 prompt copies a day |
| Yearly | **$279**, unlimited |
| Lifetime | **$399** (shown as reduced from $759) |
| Prompt packs | $49 for 2–10 downloads, no subscription |
| Licence | Personal and client work |
| Community | Included, with priority support |
| MCP | **Included in every paid plan.** OAuth sign-in, no API key. Runs on a Supabase edge function. Free accounts see 3 prompts through it |
| Custom work | **Private custom prompt from any reference**: hero section $99 (from $599), full landing page of 5–6 sections $249 (from $1,499). Includes "all project files", delivered in a few business days, never published |

Sources: [pricing](https://motionsites.ai/unlimited) ·
[home](https://motionsites.ai/) · [MCP](https://motionsites.ai/mcp) ·
[custom requests](https://motionsites.ai/request)

## Adjacent competitors

These compete for the same job — "give me a site that doesn't look generic" —
with a different product.

| | What it is | Price | Why it matters |
|---|---|---|---|
| [21st.dev](https://21st.dev/pricing) | Multi-author marketplace of components, themes and templates; AI generation; PR design reviews | Builder **free**, with unlimited component retrieval over MCP. Builder + AI **$15/month** yearly, 500–2,000 credits. Templates sold per author | A free MCP to a large component library sets the floor for what a prompt library must beat |
| [Relume](https://www.relume.io/pricing) | Brief → sitemap → wireframe → design → style guide, with AI agents and free hosting | Free (30 components); Pro **from $14/month** | Owns the work before visual design. Claims 1M+ users |
| [Aceternity UI Pro](https://ui.aceternity.com/pricing) | 200+ premium blocks and 12+ templates in Next.js, Tailwind and Framer Motion; MCP; prompts for Lovable and v0 | Free components. Annual **$169**; lifetime **$199**; team of 10 **$1,590** once | Same stack and animation style, sold as code rather than prompts, with an MCP |
| [Magic UI Pro](https://pro.magicui.design/) | 50+ sections and 9+ templates, same stack | **$199 lifetime**; commercial use, no resale | Lifetime pricing at the same point as Aceternity |
| [Framer Marketplace](https://www.framer.com/marketplace/templates/) | Finished templates from independent creators | Free to **$129 per template** (observed: $49, $99, $129) | A buyer can skip rebuilding entirely |
| [Mobbin](https://mobbin.com/pricing) | Reference library of real app and site screens, flows and animations; collections; MCP | Free (3 collections); Pro **$10/month** yearly; Team $16 per member | The model the design spec names for a future Inspiration product. Relevant only if that ships |

The free tier of Magic UI was not re-checked in this session; its pricing URLs
returned 404 and only the Pro site loaded.

## Price per year

Lifetime prices are listed as they are sold; they are not comparable to a
subscription, but they are what a buyer will compare against.

| | Recurring | One-time |
|---|---|---|
| **Kinetic Layers (proposed)** | **$288/yr** ($24 × 12) | — |
| MotionSites | $279/yr | $399 lifetime · $49 pack |
| GetLayers | Unlimited: not readable | $129 Full Stack lifetime |
| Aceternity UI Pro | $169/yr | $199 lifetime |
| Magic UI Pro | — | $199 lifetime |
| 21st.dev | $0 or $180/yr | Per template |
| Relume | from $168/yr | — |
| Mobbin | $120/yr | — |
| Framer templates | — | $0–$129 each, plus Framer hosting |

The proposed Founding Membership would be the most expensive recurring option
among the direct competitors, with no lifetime alternative. Both direct
competitors and both component vendors lean on lifetime deals.

## Feature matrix

Legend: ✓ offered · — not offered or not found on the pages reviewed.

| | Free tier | Source | Prompts | MCP | Live tuning | Commercial licence | Community | Custom work | Published rebuild proof |
|---|---|---|---|---|---|---|---|---|---|
| Kinetic Layers (live) | ✓ | ✓ | ✓ | ✓ API key | — | Draft | — | Planned | Planned |
| GetLayers | ✓ | ✓ | ✓ | ✓ OAuth, top plan | ✓ | ✓ | ✓ | — | — |
| MotionSites | 3 prompts | Custom only | ✓ | ✓ OAuth, all paid | — | ✓ | ✓ | ✓ $99–$249 | — |
| 21st.dev | ✓ | ✓ | AI | ✓ free | — | Per author | — | — | — |
| Aceternity UI Pro | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — |
| Magic UI Pro | — | ✓ | — | — | — | ✓ | — | — | — |
| Relume | ✓ | Export | AI | — | — | — | — | — | — |
| Mobbin | ✓ | — | — | ✓ | — | — | — | — | — |

"Published rebuild proof" means a tested reconstruction shown publicly: the tool
and model, the date, side-by-side output, and known limitations. Marketing claims
of fidelity do not count.

## Positioning gaps worth testing

1. **Reconstruction evidence.** The master plan's release standard: freeze the
   reference, test in a fresh project with only the customer package, compare,
   repair, publish with evidence. Nobody reviewed does the last step publicly.
   It is also the only claim a buyer can check before paying.
2. **Adaptation as a deliverable.** Ship the adaptation prompt and the design
   specification as part of each kit, not as a line in a FAQ.
3. **MCP is table stakes, and sign-in friction matters.** Every direct
   competitor and three adjacent ones ship an MCP. Both direct competitors use
   OAuth sign-in with no key to copy; Kinetic Layers asks for an API key.
4. **Depth, not breadth.** MotionSites claims 500+ prompts; Kinetic Layers has 2
   real kits. A few complete, verified kits is a defensible story; a thin
   catalogue next to a full one is not.
5. **Custom work is priced low by the market.** MotionSites anchors a full
   landing page at $249. A Kinetic Layers adaptation service has to justify its
   price with deliverables — source, specification, revisions, ownership terms —
   rather than compete on price.

## Risks, as questions

- **The unreleased homepage hotlinks a competitor.** `lib/kl/motionsites.ts`
  loads all 20 references straight from `motionsites.ai/assets/` and
  MotionSites' Mux account. MotionSites would see the referrer traffic, carries
  the bandwidth, and can replace or remove any of those images at any time. Is
  displaying them covered by their terms? Do you want a first-time visitor to see
  ten of their designs for every one of yours? `DESIGN-REBUILD-SPEC.md` already
  calls the mixed wall "a temporary state"; copying the files locally instead
  would make the licensing question worse, not better. The spec's own answer is a
  separate Inspiration route with a provenance model.
- **The proposed price sits above every direct alternative** on both a yearly
  and a lifetime comparison. What evidence would a buyer see first that justifies
  the difference?
- **Lifetime deals set expectations.** Several competitors show permanent-looking
  "was / now" prices. A buyer arriving from them will expect a lifetime option or
  a clear reason there isn't one.
- **GetLayers now generates original 3D scenes** from a description plus
  reference images. If generation becomes the norm, a fixed catalogue needs the
  verification and adaptation story more, not less.

## Re-running this research

1. Fetch each linked page; note date and price exactly as shown, including any
   crossed-out "was" price.
2. GetLayers' Unlimited price loads client-side. Read it in a real browser.
3. Check each MCP page for plan requirements and auth method.
4. Look specifically for public reconstruction evidence — that is the claim this
   brief turns on, and the first thing to change if a competitor adds it.
5. Update the date at the top and the "Where Kinetic Layers stands" table.
