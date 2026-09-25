import type { Metadata } from "next";
import { ContentPage, ProseHero, ProseSection } from "@/components/v2/Prose";
import s from "@/components/v2/Prose.module.css";
import { getDrops } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/changelog" },
  title: "Changelog",
  description: "Every drop, newest first.",
};

/**
 * The changelog is the drops.
 *
 * `drop` documents already carry a title, a meta line and a ship date — which
 * is a changelog entry in everything but name. Reading them here means the page
 * maintains itself: publish a drop in the Studio and it appears, with no second
 * place to remember to update.
 */
export default async function Changelog() {
  const drops = await getDrops();

  return (
    <ContentPage>
      <ProseHero
        eyebrow="Changelog"
        title="Every drop, newest first."
        lead="New work appears when it is ready. This log records what has been added."
      />

      <ProseSection id="log" last>
        {drops.length === 0 ? (
          <p>No drops published yet.</p>
        ) : (
          <ol className={s.log}>
            {drops.map((d) => (
              <li key={d.slug}>
                <span className={s.logTag} data-soon={d.tag === "SOON" ? "" : undefined}>
                  {d.tag ?? "LIVE"}
                </span>
                <span className={s.logWords}>
                  <strong>{d.title}</strong>
                  {d.meta ? <span>{d.meta}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        )}
      </ProseSection>
    </ContentPage>
  );
}
