import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/kl/site";
import { HUES } from "@/lib/v2/gradient";
import { ContentPage, ProseHero } from "@/components/v2/Prose";
import Gradient from "@/components/v2/Gradient";
import { Arrow } from "@/components/v2/Button";
import l from "@/components/v2/layout.module.css";
import s from "@/components/v2/Contact.module.css";

export const metadata: Metadata = { title: "Contact", description: "Contact Kinetic Layers." };

const mail = (subject: string) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Kinetic Layers ${subject}`)}`;

/**
 * Three ways in, as three of the deck's cards. Each is a real link — two
 * open an email with the subject filled in, one goes to the library — so
 * there is no form here collecting anything.
 */
export default function ContactPage() {
  const options = [
    {
      href: mail("library question"),
      title: "Library and licensing",
      body: "Ask about a kit, its files, or the licence attached to it.",
      foot: CONTACT_EMAIL,
      hue: HUES.ember,
      second: HUES.rose,
    },
    {
      href: mail("membership question"),
      title: "Membership and studios",
      body: "Ask about Founding Membership, a future team option, or the interest list.",
      foot: CONTACT_EMAIL,
      hue: HUES.cobalt,
      second: HUES.violet,
    },
    {
      href: "/library",
      title: "Start with the library",
      body: "Browse the kits, running, before writing in — the answer may already be on a kit page.",
      foot: "Browse kits",
      hue: HUES.violet,
      second: HUES.rose,
    },
  ];

  return (
    <ContentPage>
      <ProseHero
        eyebrow="Contact"
        title="Bring a useful brief."
        lead="Questions about a kit, a licence, a future studio option or a collaboration all start here."
      />
      <section className={`${l.container} ${s.options}`} aria-label="Ways to get in touch">
        {options.map((o) => (
          <Gradient key={o.title} as="a" href={o.href} hue={o.hue} second={o.second} className={s.option}>
            <span className={s.optionHead}>
              <strong>{o.title}</strong>
              <Arrow className={s.arrow} />
            </span>
            <span className={s.optionBody}>{o.body}</span>
            <span className={s.optionFoot}>{o.foot}</span>
          </Gradient>
        ))}
      </section>
    </ContentPage>
  );
}
