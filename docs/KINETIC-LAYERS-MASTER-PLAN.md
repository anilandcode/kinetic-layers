# Kinetic Layers: from design library to a complete design-delivery business

## Current implementation note — 2026-09-17

This is a strategy document, not a live product description. The current local
site has a Bench-led public refinement: free early access, a proposed future
$24/month Founding Membership, a standalone Contact page, and 20 clearly
attributed MotionSites visual references next to two real Kinetic Layers
previews. Those references are not catalogue inventory and have no download,
entitlement, or Premium action.

Collections are retained for local development and return HTTP 404 in
production until they are ready to relaunch. Process is archived. No production
deployment, payment activation, membership billing, or customer outcome is
implied by this implementation note. See `HANDOFF.md` for operational status
and `BENCH-REDESIGN.md` for the current visual implementation.

Planned: 2026-09-10. Saved: 2026-09-11.

Status: proposed roadmap, saved at the owner's request. This document does not mean the changes have been implemented or deployed. Customer-demand targets are hypotheses, not achieved results.

## 1. Direction and competitive position

Build a system that helps people discover an original design, recreate it reliably, adapt it to their brand, and finish a usable website.

Start with websites and motion kits, free starter content, demonstrations, and teaching. Grow the catalogue from observed demand, introduce paid collections and custom services, then consider an integrated builder.

Serve founders, designers, freelancers, and agencies through the same assets. Give them different starting instructions rather than maintaining separate products.

### Competitive landscape

| Competitor                                                                          | Public offering                                                          | Implication for Kinetic Layers                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [MotionSites](https://motionsites.ai/unlimited)                                     | Prompts, sections, backgrounds, templates, MCP, and community access     | A prompt catalogue with MCP is already an established offer.         |
| [GetLayers](https://www.getlayers.ai/docs)                                          | Prompts, source, configurable layers, and composition                    | Prompts plus source are necessary, but insufficient differentiation. |
| [21st](https://21st.dev/)                                                           | Multi-author components, templates, themes, and AI-assisted installation | Competing on component volume would be difficult.                    |
| [Relume](https://www.relume.ai/)                                                    | Brief-to-site workflow with sitemap, wireframes, publishing, and exports | Customers also value the work before and after visual design.        |
| [Aceternity](https://ui.aceternity.com/pro) and [Magic UI](https://magicui.design/) | Animated components and finished templates                               | Individual effects face strong free and paid alternatives.           |
| [Framer Marketplace](https://www.framer.com/marketplace/templates/)                 | Finished website templates                                               | Buyers can choose a ready-made site instead of reconstructing one.   |

These are useful benchmarks, not a verified ranking of revenue or commercial success. Public offerings were reviewed on 2026-09-10; refresh them before publishing comparative marketing.

The differentiation to validate: distinctive art direction, demonstrated reconstruction quality, coherent brand adaptation, and dependable handoff. Prove these through actual outputs and customer projects.

## 2. The product and design-to-prompt system

Make each original design a versioned design kit, with three clearly explained ways to use it:

- **Use the source:** start from the supplied implementation for the closest match.
- **Recreate the design:** give an AI tool the structured specification, references, and assets.
- **Adapt the design:** change brand, content, imagery, and selected layout choices while preserving its visual character.

Do not promise identical generation across tools. Publish the combinations actually tested and show their results.

### Turn finished code into a reusable kit

1. **Freeze the reference.** Record the source revision, dependencies, fonts, assets, and working setup. Capture desktop, tablet, mobile, and important interaction states.
2. **Extract the design decisions.** Document typography, spacing, grids, colors, image crops, section hierarchy, responsive changes, and motion.
3. **Separate fixed and editable choices.** Identify what gives the design its identity and what customers may replace: business name, copy, palette, images, sections, and calls to action.
4. **Write the reconstruction instructions.** Describe the actual implementation precisely. Include asset mappings, breakpoint behavior, interaction triggers, duration, easing, and reduced-motion behavior.
5. **Test in a fresh project.** Give the test agent only the customer package. For prompt-reconstruction tests, exclude the original source so the test measures reconstruction rather than copying.
6. **Compare and repair.** Assess screenshots, motion, responsiveness, functionality, and setup failures. Revise the reusable instructions instead of fixing only that test output.
7. **Release with evidence.** Publish the kit version, tested tool/model configuration, date, known limitations, and comparison images.

Structured instructions, explicit context, and staged tasks are consistent with [Google prompting guidance](https://ai.google.dev/gemini-api/docs/prompting-strategies). The testing and evidence process is the proposed Kinetic Layers standard.

### Customer package

| Part                            | Purpose                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| Quick start                     | First successful result with minimal decisions               |
| Reconstruction prompt           | Rebuild the reference                                        |
| Adaptation prompt               | Apply the customer's brand and content                       |
| Design specification            | Preserve layout, typography, responsive behavior, and motion |
| References and assets           | Remove ambiguity about what the design should look like      |
| Source and setup instructions   | Provide a dependable starting implementation                 |
| Checks and troubleshooting      | Help customers identify and repair common differences        |
| License, version, and changelog | Explain permitted use and what changed                       |

A prompt should follow this structure: goal → supplied references → environment → design rules → section specifications → motion → responsive behavior → editable inputs → acceptance checks.

Maintain one underlying specification. Generate convenient prompt variants from it rather than hand-maintaining unrelated prompts for every AI product.

Support any configured coding agent. Initially, label only tested source stacks and tool configurations as verified; other framework conversions remain adaptations.

## 3. Improve the website and operating system

### Make the offer understandable

The homepage observed in this review leads with “17 things worth stealing,” includes an item called “Asset,” mixes Premium and early-access messages, and links to an old contact domain.

Replace the count-led introduction with a concrete outcome, such as “Original websites and motion kits you can recreate, customize, and ship.”

Use this homepage sequence:

Outcome → interactive example → what a kit contains → three ways to use it → free starters → reconstruction evidence → teaching and custom help.

- Curate the homepage manually; remove unfinished and placeholder items from public promotion.
- Use consistent early-access wording across navigation, cards, pricing, account pages, and MCP.
- Give every kit a working preview, package contents, setup requirements, tested configurations, and known limitations.
- Add “Start here” guidance for building a personal site, delivering client work, or learning the design.
- Keep browsing focused on websites, sections, and motion assets. Avoid expanding into unrelated asset categories during the first release.
- Replace unsupported publishing promises with a cadence the production process can sustain.

The separate [live UI review](KINETIC-LAYERS-UI-REVIEW.md) records visual observations and a more focused design direction.

### Extend the existing platform

Keep Next.js, Sanity, Supabase, and the current media infrastructure.

Add a lightweight kit release record containing:

- Version and release status.
- Reference source revision.
- Supported stack and setup instructions.
- Reconstruction and adaptation instructions.
- Private package manifest.
- Public verification summary and compatibility results.
- License reference and changelog.

Sanity remains the editorial source. Source packages stay in private storage, with existing server-side access checks. Existing assets remain readable; only complete releases receive verification labels.

Extend current item pages and MCP responses with optional version and compatibility metadata. Preserve existing slugs and tools. A later `get_kit` tool can return the authorized manifest and retrieval instructions; it must use the same entitlement and allowance rules as the website.

### Fix foundational inconsistencies

- Centralize entitlement calculation for browser sessions and MCP keys. Code inspected during planning differed on early access and expiry; this was a static finding, not a live authenticated reproduction.
- Verify signup, confirmation email, redirects, prompt retrieval, downloads, and revoked-key behavior.
- Repair tag references and configure content revalidation.
- Review private-storage access, administrative credentials, and legal drafts before monetization.
- Reconcile README, handoff, public copy, and the historical strategy page.
- Update graphify after implementation changes.

### Measure completed outcomes

Track discovery, signup, kit retrieval, first successful setup, reconstruction feedback, returning usage, and voluntarily submitted projects.

A download is not proof of success. Ask a short follow-up: Did it run? Did it resemble the reference? Did you use it in a real project?

Keep project submissions optional. Do not collect source code or customer briefs through ordinary analytics.

## 4. Audience, catalogue, and revenue roadmap

The owner's chosen order is free adoption → catalogue depth → paid growth.

| Stage                              | Deliverables                                                                                                               | Exit condition                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Weeks 1–2: foundation              | Clear homepage, access consistency, one complete kit, onboarding and measurement                                           | Five external users attempt the kit; their failures are documented and addressed              |
| Weeks 3–6: free collection         | Three complete starter kits: product/SaaS, editorial business, and creative portfolio; matching reusable sections          | Ten observed successful setups, with at least five recognizable reconstructions               |
| Weeks 7–10: catalogue              | Three additional complete kits shaped by feedback; a total of twelve reusable sections with clear parent-kit relationships | Repeat use from at least five users and evidence of which designs people actually need        |
| Weeks 11–12: commercial validation | Paid-collection previews, custom adaptation offer, and customer interviews                                                 | Five paid purchases or clearly scoped paid pilot commitments before expanding paid production |

These are planning targets, not forecasts. If a stage fails, improve its content or onboarding before adding scope. Week numbers run from implementation kickoff, not automatically from the date of this document.

**Free offer:** three complete starter kits with prompts, source, assets, and clear usage terms. Preserve that starter collection when paid products arrive. Do not abruptly change existing early-access promises.

**Publishing loop:** each kit produces a demonstration, a design breakdown, a reconstruction comparison, an adaptation example, and a short lesson. Combine screen recordings with personal teaching, as requested.

Start with YouTube for durable tutorials, one short-form channel, and an opt-in email list. Use one weekly newsletter; do not require daily new designs.

For a full-time solo schedule, allocate approximately 40% to design production, 20% to verification, 20% to distribution, and 20% to platform improvements and support.

### Revenue sequence

1. Free starters build trust and reveal friction.
2. Paid collections package a coherent set of designs and assets.
3. Fixed-scope custom adaptation earns revenue and exposes recurring customer needs.
4. Workshops teach the workflow using existing kits.
5. Membership becomes appropriate only when repeat usage and sustained releases justify recurring payment.

Initial price testing should use actual customer conversations and paid pilots. Do not publish old research prices as validated willingness to pay.

Custom work should have explicit deliverables, revision limits, and ownership terms. Only generalize client work into public kits when the agreement permits it.

## 5. Expansion and quality gates

Prioritize future capabilities in this order:

1. **Brand adaptation assistant:** apply one brand system consistently across a kit.
2. **Coherent collection composer:** combine compatible sections without conflicting typography, spacing, or motion.
3. **Reconstruction diagnostics:** compare a customer's result with the reference and produce targeted repair instructions.
4. **Client handoff package:** setup guide, editable content map, dependency notes, and launch checklist.
5. **Private team libraries:** reusable brand-specific kits and shared project collections.
6. **Integrated builder:** assemble and edit the tested kit system inside Kinetic Layers.

Start a builder prototype only after there are at least twenty observed successful kit projects, ten repeat users, and five customers willing to pay for the integrated workflow. These are investment gates, not proof of product-market fit.

### Release acceptance

For every starter kit:

- Source installs and builds in a clean environment.
- Pages work at 1440, 768, and 390 pixels without horizontal overflow.
- Navigation, controls, keyboard use, and reduced-motion behavior are checked.
- Asset and font rights are recorded; required files are included.
- Reconstruction is attempted twice from fresh context in each of two available agent configurations.
- Each advertised configuration passes both attempts after the final prompt revision; failed configurations remain explicitly unverified.
- Evidence covers composition, typography, imagery, responsive behavior, and motion. Human visual review is required.
- A changed prompt, source package, or dependency produces a new version and re-verification of affected claims.

Platform acceptance includes consistent website/MCP permissions, expiry and revocation checks, concurrent allowance enforcement, private-package protection, valid content updates, and a complete signup-to-kit journey.

### Assumptions and defaults

Global English audience; solo, full-time operation; websites and motion first; existing infrastructure retained; no hosted AI generation costs in the initial release; no claim of guaranteed reconstruction or commercial success.

Earlier research supported a prompt-plus-source offer, but its customer-demand assumptions remain unverified. The owner's current choices supersede earlier agency-only or paid-first recommendations.

## Dated source appendix

Public research reviewed on 2026-09-10:

- [MotionSites pricing and included offers](https://motionsites.ai/unlimited)
- [MotionSites MCP](https://motionsites.ai/mcp)
- [MotionSites custom requests](https://motionsites.ai/request)
- [GetLayers overview](https://www.getlayers.ai/)
- [GetLayers documentation](https://www.getlayers.ai/docs)
- [GetLayers pricing](https://www.getlayers.ai/pricing)
- [GetLayers MCP](https://www.getlayers.ai/mcp)
- [21st](https://21st.dev/)
- [Relume](https://www.relume.ai/)
- [Aceternity UI Pro](https://ui.aceternity.com/pro)
- [Magic UI](https://magicui.design/)
- [Framer Marketplace](https://www.framer.com/marketplace/templates/)
- [Google prompt design guidance](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Local grounding: HANDOFF.md, README.md, graphify-out/GRAPH_REPORT.md, graph queries, and targeted inspection of catalogue schemas, access logic, homepage content, checkout, and analytics. The working tree was clean on main when this planning session began. Prior graph inspection showed 1,141 nodes and 2,323 edges; these are a dated snapshot, not a permanently current metric.

Live visual observations from 2026-09-10/11 are recorded separately in the UI review. No production configuration or application code was changed while saving these plans.
