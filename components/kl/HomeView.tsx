import Link from "next/link";
import Header from "./Header";
import Shell from "./Shell";
import GlassButton from "./GlassButton";
import AssetCard from "./AssetCard";
import DotFieldCta from "./DotFieldCta";
import { UpgradeCard, HireCard, NewsCard } from "./PromoCards";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";
import { MOODS, SHELVES, type Asset } from "@/lib/kiln/types";
import { EARLY_ACCESS } from "@/lib/kiln/access";

/**
 * The Kinetic Layers home: the library itself, not a pitch in front of it.
 *
 * Filters live in the URL rather than in client state, so a filtered view is
 * shareable and the back button works — the project's own convention, and the
 * reason the rail is links rather than buttons.
 *
 * Every number on this screen is counted from Sanity. The prototype's copy
 * says "two hundred and forty" and "twelve free"; those were placeholders, and
 * a stored count was wrong the day after it was written.
 */

type Search = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/* Promo cards are seeded into the grid rather than appended, so the masonry
   stays ragged and the upgrade card is met while browsing, not after it. */
const PROMO_AT = { upgrade: 4, hire: 9, news: 14 };

export default async function HomeView({ searchParams }: { searchParams?: Promise<Search> }) {
  const params = (await searchParams) ?? {};
  const shelf = one(params.shelf);
  const mood = one(params.mood);
  const freeOnly = one(params.free) === "1";

  const [all, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);

  const items = all.filter(
    (a) =>
      (!shelf || shelf === "All" || a.shelf === shelf) &&
      (!mood || a.mood === mood) &&
      (!freeOnly || a.free)
  );

  /* Early access hands the whole vault to anyone with an account, so nothing
     is locked and no card should claim otherwise. */
  const unlocked = EARLY_ACCESS || Boolean(viewer?.unlimited);

  const href = (next: Partial<{ shelf: string; mood: string; free: string }>) => {
    const q = new URLSearchParams();
    const s = next.shelf ?? shelf;
    const m = next.mood ?? mood;
    const f = next.free ?? (freeOnly ? "1" : undefined);
    if (s && s !== "All") q.set("shelf", s);
    if (m) q.set("mood", m);
    if (f === "1") q.set("free", "1");
    const qs = q.toString();
    return qs ? `/?${qs}#library` : "/#library";
  };

  const isEmpty = items.length === 0;

  return (
    <Shell>
      <Header />

      <main data-view>
        {/* ---------- Hero ---------- */}
        <div className="kl-hero-wrap">
          <div className="kl-grid-pattern" aria-hidden="true" />
          <div className="kl-rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="kl-pad kl-hero" data-hero>
            <div className="kl-eyebrow">
              {settings.currentDrop ? (
                <span className="kl-drop-tag">{settings.currentDrop}</span>
              ) : null}
              <span className="kl-eyebrow-text" data-letters>
                One studio · shipped Thursday
              </span>
            </div>

            {/* data-mask rebuilds this into per-word spans, so it must stay
                plain text — no markup inside. */}
            <h1 className="kl-h1" data-mask data-h1>
              {`${settings.totalAssets} things worth stealing.`}
            </h1>

            <p className="kl-pull" data-rise data-pull>
              Prompts, templates, scenes and workflows built in one studio and shipped every
              Thursday.
            </p>

            <div className="kl-cta-row" data-rise>
              <GlassButton href="/pricing" premium size="lg" pull={7}>
                {EARLY_ACCESS ? "Free while in early access" : `Premium — $${settings.monthlyPrice}/mo`}
              </GlassButton>
              <GlassButton href="#library" size="lg" pull={5}>
                {`Browse ${settings.freeThisMonth} free`}
              </GlassButton>
            </div>
          </div>
        </div>

        {/* ---------- Filter rail ---------- */}
        <div className="kl-rail" id="library" data-rail>
          <div className="kl-pad kl-rail-inner">
            {SHELVES.map((s) => {
              const active = s === "All" ? !shelf : shelf === s;
              return (
                <Link
                  key={s}
                  href={href({ shelf: s })}
                  className="kl-pill"
                  aria-current={active ? "true" : undefined}
                  scroll={false}
                >
                  {s}
                </Link>
              );
            })}

            <span className="kl-divider" aria-hidden="true" />

            {MOODS.map((m) => (
              <Link
                key={m}
                href={href({ mood: mood === m ? "" : m })}
                className="kl-pill"
                aria-current={mood === m ? "true" : undefined}
                scroll={false}
              >
                {m}
              </Link>
            ))}

            <span className="kl-spacer" />

            <Link
              href={href({ free: freeOnly ? "" : "1" })}
              className="kl-pill"
              aria-current={freeOnly ? "true" : undefined}
              scroll={false}
            >
              Free only
            </Link>

            <span className="kl-count">
              {items.length} of {all.length}
            </span>
          </div>
        </div>

        {/* ---------- Grid ---------- */}
        <div className="kl-pad" style={{ paddingTop: 30 }}>
          {isEmpty ? (
            <div className="kl-empty">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                style={{ color: "var(--muted)" }}
                aria-hidden="true"
              >
                <path d="M0.5 39.5V0.5H39.5" strokeOpacity="0.7" />
                <path d="M12.5 39.5V12.5H39.5" strokeOpacity="0.45" />
                <path d="M24.5 39.5V24.5H39.5" strokeOpacity="0.25" />
              </svg>
              <h2>Nothing on that shelf yet.</h2>
              <p>
                That combination is empty for now. Drop the mood filter, or tell the studio what you
                were looking for — requests jump the drop queue.
              </p>
              <GlassButton href="/" ghost>
                Clear filters
              </GlassButton>
            </div>
          ) : (
            <div className="kl-masonry" data-masonry>
              {items.flatMap((asset: Asset, i: number) => {
                const card = (
                  <AssetCard
                    key={asset.slug}
                    asset={asset}
                    index={i}
                    locked={!unlocked && !asset.free}
                  />
                );
                if (i === PROMO_AT.upgrade && !unlocked)
                  return [card, <UpgradeCard key="promo-upgrade" price={settings.monthlyPrice} />];
                if (i === PROMO_AT.hire) return [card, <HireCard key="promo-hire" />];
                if (i === PROMO_AT.news) return [card, <NewsCard key="promo-news" />];
                return [card];
              })}
            </div>
          )}
        </div>

        {/* ---------- Closing CTA ---------- */}
        <DotFieldCta
          heading={`Start with the ${settings.freeThisMonth} free ones.`}
          body={
            EARLY_ACCESS
              ? "No card, no trial timer. Everything is open while the library is in early access."
              : `No card, no trial timer. If the source files are what you hoped, the rest is $${settings.monthlyPrice} a month.`
          }
          secondaryHref="#library"
          secondaryLabel={`Browse ${settings.freeThisMonth} free`}
          primaryHref="/pricing"
          primaryLabel={EARLY_ACCESS ? "See what's included" : "Go Premium"}
        />
      </main>
    </Shell>
  );
}
