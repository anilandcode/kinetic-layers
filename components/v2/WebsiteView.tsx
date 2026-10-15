import Link from "next/link";
import type { Viewer, Website } from "@/lib/kl/types";
import { fullShot } from "@/lib/kl/media";
import { gateReason } from "@/lib/kl/gate";
import { websiteHref } from "@/lib/kl/slug";
import { ButtonLink, Tag } from "./Button";
import CopyText from "./CopyText";
import DownloadButton from "./DownloadButton";
import Swatches from "./Swatches";
import WebsiteCard from "./WebsiteCard";
import { SectionHead } from "./PageHero";
import l from "./layout.module.css";
import p from "./Page.module.css";
import s from "./Website.module.css";

const SHOT_W = 1400;

function coloursOf(site: Website): string[] {
  if (site.colors?.length) return site.colors;
  const pal = site.palette;
  const list = [pal?.dominant, pal?.vibrant, pal?.muted, pal?.darkMuted, pal?.lightVibrant].filter(
    (c): c is string => Boolean(c)
  );
  return [...new Set(list.map((c) => c.toLowerCase()))];
}

const size = (bytes?: number | null) =>
  !bytes ? null : bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1_048_576).toFixed(1)} MB`;

/**
 * /websites/[slug] — land-book's layout in this site's language: the whole
 * page on the left, scrolling at full length, and a sticky rail on the right
 * with what it is, its colours, and the three things it comes with.
 *
 * The rail states the gate before anyone clicks; the API routes still decide.
 */
export default function WebsiteView({
  site,
  related,
  viewer,
}: {
  site: Website;
  related: Website[];
  viewer: Viewer | null;
}) {
  const shot = fullShot(site.screenshot, SHOT_W, site);
  const colours = coloursOf(site);
  const gate = gateReason(viewer, site);
  const here = websiteHref(site.slug);
  const nothingYet = !site.zipBytes && !site.codeLength && !site.designLength;

  return (
    <main className={p.page}>
      <div className={`${l.container} ${s.top}`}>
        <nav aria-label="Breadcrumb" className={p.crumbs}>
          <Link href="/websites">Websites</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/websites?category=${encodeURIComponent(site.category)}`}>{site.category}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{site.name}</span>
        </nav>
      </div>

      <div className={`${l.container} ${s.layout}`}>
        <figure className={s.full}>
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element -- sized by lib/kl/media.ts, not next/image
            <img
              src={shot}
              alt={`${site.name} — the full page`}
              width={site.width}
              height={site.height}
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
        </figure>

        <aside className={s.rail} aria-labelledby="website-title">
          <p className={s.kicker}>
            {site.category} · {site.free ? "Free" : "Premium"}
          </p>
          <h1 id="website-title" className={s.title}>
            {site.name}
          </h1>
          {site.tagline ? <p className={s.lede}>{site.tagline}</p> : null}
          {site.tags.length ? (
            <div className={s.tags}>
              {site.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          ) : null}

          {colours.length ? (
            <section className={s.block} aria-label="Colours">
              <h2 className={s.label}>Colours</h2>
              <Swatches colors={colours} />
            </section>
          ) : null}

          <section className={s.block} aria-label="What you get">
            <h2 className={s.label}>What you get</h2>
            <p className={s.gate}>
              {gate === "open" ? (
                "Yours to use — each copy or download counts once toward today's allowance."
              ) : site.free ? (
                <>
                  Free with an account. <Link href={`/join?next=${encodeURIComponent(here)}`}>Join free</Link>
                </>
              ) : (
                <>
                  Included with Premium. <Link href="/pricing">See pricing</Link>
                </>
              )}
            </p>

            {nothingYet ? <p className={s.muted}>The code and design system are being prepared.</p> : null}

            {site.zipBytes ? (
              <div className={s.deliverable}>
                <h3 className={s.deliverableTitle}>
                  Project ZIP <span>{size(site.zipBytes)}</span>
                </h3>
                <DownloadButton slug={site.slug} type="website" label="Download ZIP" size="md" />
              </div>
            ) : null}

            {site.codeLength ? (
              <div className={s.deliverable}>
                <h3 className={s.deliverableTitle}>
                  Code <span>Markdown</span>
                </h3>
                <CopyText
                  endpoint="/api/prompt"
                  body={{ slug: site.slug, type: "website", kind: "code" }}
                  label="Copy code"
                  joinNext={here}
                  filename={`${site.slug}-code.md`}
                  preview
                />
              </div>
            ) : null}

            {site.designLength ? (
              <div className={s.deliverable}>
                <h3 className={s.deliverableTitle}>
                  Design system <span>Markdown</span>
                </h3>
                <CopyText
                  endpoint="/api/prompt"
                  body={{ slug: site.slug, type: "website", kind: "design" }}
                  label="Copy design system"
                  joinNext={here}
                  filename={`${site.slug}-design-system.md`}
                  preview
                />
              </div>
            ) : null}
          </section>

          {site.liveUrl ? (
            <ButtonLink href={site.liveUrl} variant="secondary" icon="arrowUpRight" target="_blank" rel="noopener noreferrer">
              Open the live site
            </ButtonLink>
          ) : null}
        </aside>
      </div>

      {related.length ? (
        <section className={`${l.container} ${p.section}`} aria-labelledby="related-title">
          <SectionHead
            id="related-title"
            kicker="Keep looking"
            title="More like this"
            action={
              <Link href="/websites" className={p.link}>
                All websites
              </Link>
            }
          />
          <div className={s.grid}>
            {related.map((r) => (
              <WebsiteCard key={r.slug} site={r} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
