import Header from "./Header";
import Shell from "./Shell";
import Footer from "./Footer";
import GlassButton from "./GlassButton";
import DotFieldCta from "./DotFieldCta";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import { checkoutConfigured } from "@/lib/kl/stripe";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { CONTACT_EMAIL } from "@/lib/kl/site";
import { LIMITS } from "@/lib/kl/limits";
import type { Asset } from "@/lib/kl/types";

/**
 * Pricing.
 *
 * This is the screen where the prototype and the product disagree most. The
 * design says "Twelve are free. The other two hundred and twenty-eight are
 * $24", and lists 240 assets across five invented tiers. None of that is true
 * today: the catalogue is what Sanity holds, and NEXT_PUBLIC_EARLY_ACCESS
 * currently hands the whole vault to anyone with an account.
 *
 * So the layout is the design's and every figure is the product's. While early
 * access is on, the Premium card shows $24 struck through, says plainly that
 * nothing is being charged, and its button creates an account rather than
 * starting a checkout that would take money for something already free.
 */

const FAQS = [
  {
    q: "What exactly do I get with an asset?",
    a: "The output, the source project that made it, and a note on where it shipped. For a scene that means the project file and config; for a prompt, the full chain and the model it was tuned against.",
  },
  {
    q: "What happens if I cancel?",
    a: "Everything you downloaded stays yours under the same commercial license. You stop getting new drops, and you lose access to the library until you resubscribe.",
  },
  {
    q: "Can I use these for client work?",
    a: "Yes, on Free and Premium both, for unlimited clients. You cannot resell an asset as an asset — the file itself can't become your product.",
  },
  {
    q: "Who makes them?",
    a: "One studio, which is the point. The same hands file every item, so the naming, structure and quality don't drift between shelves.",
  },
  {
    q: "What lands in a Thursday drop?",
    a: "Nine items, usually a mix of one shelf's worth of depth and a few one-offs, always with the brief they were built for attached.",
  },
];

/** One row per asset type, counted — never the prototype's invented tiers. */
function shelfRows(all: Asset[]) {
  const byType = new Map<string, { items: number; free: number; stacks: Set<string> }>();
  for (const a of all) {
    const row = byType.get(a.type) ?? { items: 0, free: 0, stacks: new Set<string>() };
    row.items += 1;
    if (a.free) row.free += 1;
    if (a.stack) row.stacks.add(a.stack);
    byType.set(a.type, row);
  }
  return [...byType.entries()]
    .sort((a, b) => b[1].items - a[1].items)
    .map(([type, r]) => ({
      type,
      items: r.items,
      free: r.free,
      /* The design's "SHIPS WITH" column was invented — PROJECT + CONFIG, REPO,
         MD + JSON. The list query does not fetch per-asset files, so that
         cannot be derived without a query per asset. `stack` is real, is
         already loaded, and answers a near-enough question honestly.

         Joined with a comma, not " · ": stack values contain that separator
         themselves, so "NEXT · TW" beside "ASTRO" read as three stacks. */
      stack: [...r.stacks].slice(0, 2).join(", ") || "—",
    }));
}

export default async function PricingView() {
  const [all, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);

  const rows = shelfRows(all);
  const free = all.filter((a) => a.free).length;
  const paid = all.length - free;
  const price = settings.monthlyPrice;
  const canCheckout = checkoutConfigured();

  const plans = [
    {
      name: "Free",
      blurb: `${free} assets, picked so you can judge the rest.`,
      price: "$0",
      unit: "FOREVER",
      cta: viewer ? "Browse the library" : `Browse ${free} free`,
      href: viewer ? "/library" : "/join?next=/library",
      featured: false,
      features: [
        `${free} assets across every shelf`,
        "Full source files",
        "Personal and client work",
        `Fair use: ${LIMITS.free.prompt} prompt reads and ${LIMITS.free.download} downloads a day`,
      ],
    },
    {
      name: "Premium",
      blurb: "The whole library, and every drop that follows.",
      price: EARLY_ACCESS ? "$0" : `$${price}`,
      unit: EARLY_ACCESS ? "WHILE IN EARLY ACCESS" : "/ MONTH",
      was: EARLY_ACCESS ? `$${price}` : null,
      cta: EARLY_ACCESS
        ? viewer
          ? "Open the library"
          : "Create a free account"
        : canCheckout
          ? "Go Premium"
          : "Checkout is not connected yet",
      href: EARLY_ACCESS ? (viewer ? "/library" : "/join?next=/library") : "/pricing",
      featured: true,
      features: [
        `All ${all.length} assets, source included`,
        "New assets every Thursday",
        "Commercial license, unlimited clients",
        `Fair use: ${LIMITS.premium.prompt} prompt reads and ${LIMITS.premium.download} downloads a day`,
        "Cancel and keep everything downloaded",
      ],
    },
    {
      name: "Studio",
      blurb: "For teams sharing one library, or commissioned work.",
      price: "Custom",
      unit: "ANNUAL",
      cta: "Talk to us",
      href: `mailto:${CONTACT_EMAIL}?subject=Studio%20plan`,
      featured: false,
      features: [
        "Seats for the whole team",
        "Commissioned assets, never filed publicly",
        "Priority requests in the drop queue",
        "Invoice billing",
      ],
    },
  ];

  return (
    <Shell>
      <Header />

      <main data-view className="kl-pad" style={{ paddingTop: 48 }}>
        <div className="kl-section-head">
          <span className="kl-kicker">PRICING</span>
          {/* data-mask rebuilds this into per-word spans, so it stays plain text. */}
          <h1 className="kl-h1 kl-h1--pricing" data-mask data-h1>
            {EARLY_ACCESS
              ? `All ${all.length} assets are free while this is early access.`
              : `${free} are free. The other ${paid} are $${price}.`}
          </h1>
          <p className="kl-lede" data-rise>
            One subscription, the whole library, every source file. Cancel and keep everything you
            downloaded.
          </p>
        </div>

        {/* ---------- Plans ---------- */}
        <div className="kl-3col" data-3col style={{ marginTop: 44, alignItems: "start" }}>
          {plans.map((p) => (
            <div key={p.name} className="kl-glow" data-glow2="6">
              <span className="kl-glow-bloom" data-glow-bloom aria-hidden="true" />
              <span className="kl-glow-rim" data-glow-rim aria-hidden="true" />

              <div className={`kl-plan${p.featured ? " kl-plan--featured" : ""}`}>
                {p.featured ? (
                  <div className="kl-plan-lamp" data-lamp="10" aria-hidden="true" />
                ) : null}

                <div className="kl-plan-head">
                  <span className="kl-plan-name">{p.name}</span>
                  {p.featured ? (
                    <span className="kl-plan-flag">
                      {EARLY_ACCESS ? "FREE RIGHT NOW" : "MOST PICKED"}
                    </span>
                  ) : null}
                </div>

                <p className="kl-plan-blurb">{p.blurb}</p>

                <div className="kl-plan-price">
                  <span className="kl-plan-amount">{p.price}</span>
                  {"was" in p && p.was ? (
                    <span className="kl-plan-was" aria-label={`normally ${p.was} a month`}>
                      {p.was}
                    </span>
                  ) : null}
                  <span className="kl-plan-unit">{p.unit}</span>
                </div>

                <GlassButton href={p.href} premium={p.featured} pull={5}>
                  {p.cta}
                </GlassButton>

                <div className="kl-plan-features">
                  {p.features.map((f) => (
                    <div key={f} className="kl-feature">
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {EARLY_ACCESS ? (
          <div className="kl-notice" data-reveal>
            <p>
              <strong>Nothing is being charged yet.</strong> Every asset is open to anyone with an
              account while the library is in early access. The ${price} price is what Premium will
              cost when that ends — you will not be billed automatically, because there is no card
              on file to bill.
            </p>
          </div>
        ) : null}

        {/* ---------- What's on the shelves ---------- */}
        <div className="kl-table" data-reveal>
          <div className="kl-table-head">
            <span className="kl-table-title">What&rsquo;s on the shelves</span>
            <span className="kl-table-meta">
              {all.length} ITEMS · {settings.addedThisWeek} ADDED THIS WEEK
            </span>
          </div>

          <div className="kl-tr kl-tr--head" data-table-row>
            <span>TYPE</span>
            <span>ITEMS</span>
            <span>FREE</span>
            <span>STACK</span>
            <span>LICENSE</span>
          </div>

          {rows.map((r) => (
            <div key={r.type} className="kl-tr kl-tr--body" data-table-row>
              <span>{r.type}</span>
              <span>{r.items}</span>
              <span>{r.free}</span>
              <span>{r.stack}</span>
              <span>COMMERCIAL</span>
            </div>
          ))}
        </div>

        {/* ---------- FAQ ---------- */}
        <div className="kl-split" data-split style={{ alignItems: "start" }}>
          <div className="kl-split-copy">
            <span className="kl-kicker">FAQ</span>
            <h2 style={{ fontSize: 34 }}>Before you subscribe.</h2>
            <p style={{ maxWidth: 320 }}>
              Anything else, the license page goes deeper and email gets answered the same day.
            </p>
          </div>

          {/* <details>, not a click handler: the answers open with no
              JavaScript, and the keyboard gets summary semantics for free. */}
          <div className="kl-faq">
            {FAQS.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  <span>{f.q}</span>
                  <span className="kl-faq-icon" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <DotFieldCta
          heading={
            EARLY_ACCESS ? "Take the whole thing, free." : `Start with the ${free} free ones.`
          }
          body={
            EARLY_ACCESS
              ? "No card, no trial timer. An account is the only thing standing between you and the source files."
              : `No card, no trial timer. If the source files are what you hoped, the rest is $${price} a month.`
          }
          secondaryHref="/library"
          secondaryLabel="Browse the library"
          primaryHref={viewer ? "/library" : "/join?next=/library"}
          primaryLabel={viewer ? "Open the library" : "Create a free account"}
        />
      </main>

      <Footer total={all.length} />
    </Shell>
  );
}
