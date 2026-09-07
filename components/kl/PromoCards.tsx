import GlassButton from "./GlassButton";
import NewsletterForm from "./NewsletterForm";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { CONTACT_EMAIL } from "@/lib/kl/site";

/**
 * The three cards seeded into the masonry.
 *
 * They share the asset cards' glow treatment so the grid reads as one surface
 * rather than as content with adverts dropped into it. Each carries a drifting
 * backdrop on `data-parallax`, which is inert without the motion layer.
 */

function Glow({ children }: { children: React.ReactNode }) {
  return (
    <div className="kl-grid-item" data-grid-item>
      <div className="kl-glow" data-glow2="6">
        <span className="kl-glow-bloom" data-glow-bloom aria-hidden="true" />
        <span className="kl-glow-rim" data-glow-rim aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function UpgradeCard({ price }: { price: number }) {
  return (
    <Glow>
      <div className="kl-promo kl-promo--upgrade">
        <div className="kl-promo-dots" data-parallax="22" aria-hidden="true" />
        <div className="kl-promo-body">
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="klLit" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8C6A46" />
                <stop offset="0.55" stopColor="#C97A32" />
                <stop offset="1" stopColor="#F0A45E" />
              </linearGradient>
            </defs>
            <path d="M0 0H40V40H10C4.5 40 0 35.5 0 30V0Z" fill="url(#klLit)" />
            <path d="M10 10H40V40H15C12.2 40 10 37.8 10 35V10Z" fill="#FFFFFF" fillOpacity="0.32" />
            <path d="M20 20H40V40H22C20.9 40 20 39.1 20 38V20Z" fill="#FFFFFF" fillOpacity="0.5" />
          </svg>
          <h3>Take the whole library.</h3>
          <p>Every prompt, template and scene — plus the source files and all future drops.</p>
          <div className="kl-promo-grow" />
          <GlassButton href="/pricing" premium pull={6} className="kl-btn--lg">
            {EARLY_ACCESS ? "Free while in early access" : `Premium — $${price}/mo`}
          </GlassButton>
        </div>
      </div>
    </Glow>
  );
}

export function HireCard() {
  return (
    <Glow>
      <div className="kl-promo kl-promo--hire">
        <div className="kl-promo-hatch" data-parallax="18" aria-hidden="true" />
        <div className="kl-promo-body">
          <span className="kl-promo-eyebrow">Hire the studio</span>
          <h3>Want something built only for you?</h3>
          <p>Commissioned work never enters the library.</p>
          {/* A mailto, not a /contact route that does not exist. */}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Commission`}
            style={{ fontSize: 15, color: "var(--amber)", marginTop: 4 }}
          >
            Start a project →
          </a>
        </div>
      </div>
    </Glow>
  );
}

export function NewsCard() {
  return (
    <Glow>
      <div className="kl-promo kl-promo--news">
        <div className="kl-promo-graph" aria-hidden="true" />
        <div className="kl-promo-body">
          <h3>Fresh drops, every Thursday.</h3>
          <p style={{ marginBottom: 4 }}>
            Nine new assets and what they were built for, once a week.
          </p>
          <NewsletterForm />
          <span style={{ fontSize: 12, lineHeight: 1.5, color: "var(--muted)" }}>
            One email a week. Unsubscribe whenever.
          </span>
        </div>
      </div>
    </Glow>
  );
}
