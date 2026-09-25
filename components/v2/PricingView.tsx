import Link from "next/link";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { LIMITS } from "@/lib/kl/limits";
import { getViewer } from "@/lib/kl/viewer";
import { getKits } from "@/lib/v2/data";
import { HUES } from "@/lib/v2/gradient";
import Shell from "./Shell";
import PageHero, { SectionHead } from "./PageHero";
import Gradient from "./Gradient";
import InterestForm from "./InterestForm";
import Icon from "./Icon";
import { ButtonLink } from "./Button";
import { DotNumber } from "./DotMatrix";
import l from "./layout.module.css";
import p from "./Page.module.css";
import s from "./Pricing.module.css";

type Row = [label: string, current: string, founding: string];

function comparison(): Array<[group: string, rows: Row[]]> {
  return [
    [
      "Library",
      [
        ["Browse kits with real previews", "Yes", "Yes"],
        ["Open kits with an account", EARLY_ACCESS ? "Yes" : "Not open", "Yes"],
        ["Verified source files", "When available", "When available"],
        [
          "Prompt reads and downloads a day",
          `${LIMITS.free.prompt} and ${LIMITS.free.download}`,
          `${LIMITS.premium.prompt} and ${LIMITS.premium.download}`,
        ],
      ],
    ],
    [
      "Membership",
      [
        ["Commercial use", "Under each listed licence", "Under each reviewed licence"],
        [
          "Future verified releases",
          EARLY_ACCESS ? "While early access is open" : "Preview when published",
          "Included when membership opens",
        ],
        ["Price", "No charge today", "$24 a month when it opens"],
      ],
    ],
    [
      "Billing",
      [
        ["Payment details", "Not collected", "Not collected today"],
        ["Checkout", "None", "None today"],
      ],
    ],
  ];
}

const FAQS: Array<[string, string]> = [
  [
    "Do I pay today?",
    "No. Joining the Founding Membership interest list does not create a subscription, collect payment details, or bill you.",
  ],
  [
    "What will Founding Membership include?",
    "Verified kits, their available source files and instructions, commercial use under each reviewed licence, and future verified releases when they are ready.",
  ],
  [
    "Is this the newsletter?",
    "No. Membership interest is a separate, confirmation-based list used only for the membership launch.",
  ],
  [
    "When will it open?",
    "There is no date yet. Membership opens only after the kits and their files have been reviewed.",
  ],
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pricing, as two of the deck's glowing cards: what is free today, and the
 * Founding Membership proposal with its interest list. Nothing here sells —
 * there is no checkout anywhere in the product — so the words say so plainly.
 * Allowances come from lib/kl/limits.ts, the same numbers the gate enforces.
 */
export default async function PricingView() {
  const [kits, viewer] = await Promise.all([getKits(), getViewer()]);
  const currentHref = viewer ? "/library" : "/join?next=/library";
  const currentAction = viewer ? "Browse the library" : "Create a free account";

  return (
    <Shell>
      <main className={p.page}>
        <PageHero
          id="pricing-title"
          kicker="Pricing"
          title={EARLY_ACCESS ? "Use the library freely while it grows." : "Founding Membership is being prepared."}
          lede={
            EARLY_ACCESS
              ? "Early access is open today. Founding Membership is a proposed $24 a month for verified kits and the releases that follow — it is not on sale."
              : "There is no subscription or checkout today. Browse the published kits and join the interest list for the proposed $24 a month."
          }
          hue={HUES.cobalt}
          second={HUES.violet}
        />

        <section className={`${l.container} ${s.plans}`} aria-label="Plans">
          {/* ---------- Free / early access ---------- */}
          <Gradient as="article" hue={HUES.ember} second={HUES.rose} className={s.plan}>
            <div className={s.planHead}>
              <p className={s.planLabel}>{EARLY_ACCESS ? "Early access" : "Free"}</p>
              <span className={s.planChip}>Open today</span>
            </div>
            <p className={s.price}>
              <span>$0</span>
              <small>{EARLY_ACCESS ? "while early access is open" : "with an account"}</small>
            </p>
            <dl className={s.allow}>
              <div>
                <dt>Prompt reads a day</dt>
                <dd>
                  <DotNumber value={pad(LIMITS.free.prompt)} label={`${LIMITS.free.prompt} prompt reads a day`} dot={7} />
                </dd>
              </div>
              <div>
                <dt>Downloads a day</dt>
                <dd>
                  <DotNumber value={pad(LIMITS.free.download)} label={`${LIMITS.free.download} downloads a day`} dot={7} />
                </dd>
              </div>
            </dl>
            <ul className={s.list}>
              <li>
                <Icon name="check" size={14} />
                {kits.length} {kits.length === 1 ? "kit" : "kits"} with real previews today
              </li>
              <li>
                <Icon name="check" size={14} />
                Each kit under its listed licence
              </li>
              <li>
                <Icon name="check" size={14} />
                An API key for Claude Code and Cursor over MCP
              </li>
            </ul>
            <div className={s.planAction}>
              <ButtonLink href={currentHref} size="lg" icon="arrowUpRight" className={s.wide}>
                {currentAction}
              </ButtonLink>
            </div>
          </Gradient>

          {/* ---------- Founding Membership (proposal) ---------- */}
          <Gradient as="article" hue={HUES.cobalt} second={HUES.violet} className={s.plan}>
            <div className={s.planHead}>
              <p className={s.planLabel}>Founding Membership</p>
              <span className={s.planChip}>Proposed · not on sale</span>
            </div>
            <p className={s.price}>
              <span>$24</span>
              <small>a month, when it opens</small>
            </p>
            <dl className={s.allow}>
              <div>
                <dt>Prompt reads a day</dt>
                <dd>
                  <DotNumber value={pad(LIMITS.premium.prompt)} label={`${LIMITS.premium.prompt} prompt reads a day`} dot={7} />
                </dd>
              </div>
              <div>
                <dt>Downloads a day</dt>
                <dd>
                  <DotNumber value={pad(LIMITS.premium.download)} label={`${LIMITS.premium.download} downloads a day`} dot={7} />
                </dd>
              </div>
            </dl>
            <ul className={s.list}>
              <li>
                <Icon name="check" size={14} />
                Verified kits as they become available
              </li>
              <li>
                <Icon name="check" size={14} />
                Source files and setup instructions
              </li>
              <li>
                <Icon name="check" size={14} />
                No subscription and no charge today
              </li>
            </ul>
            <div className={s.planForm}>
              <p className={s.formLabel}>Hear when it opens</p>
              <InterestForm />
            </div>
          </Gradient>
        </section>

        <div className={l.container}>
          <p className={s.notice}>
            <Icon name="lock" size={15} />
            <span>
              <strong>Nothing is charged today.</strong> Founding Membership is a proposed price, not a purchase.{" "}
              <Link href="/contact" className={p.link}>
                Questions about a team or studio option?
              </Link>
            </span>
          </p>
        </div>

        <section className={`${l.container} ${p.section}`} aria-labelledby="compare-title">
          <SectionHead id="compare-title" kicker="Compare" title="What is available now, and what is planned." />
          <div className={`${p.panel} ${s.compare}`}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="v-sr">Feature</span>
                  </th>
                  <th scope="col">{EARLY_ACCESS ? "Early access" : "Free"}</th>
                  <th scope="col">Founding Membership</th>
                </tr>
              </thead>
              {comparison().map(([group, rows]) => (
                <tbody key={group}>
                  <tr className={s.group}>
                    <th scope="colgroup" colSpan={3}>
                      {group}
                    </th>
                  </tr>
                  {rows.map(([label, current, founding]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      <td data-label={EARLY_ACCESS ? "Early access" : "Free"}>{current}</td>
                      <td data-label="Founding Membership">{founding}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <section className={`${l.container} ${p.section}`} aria-labelledby="faq-title">
          <div className={s.faqGrid}>
            <SectionHead id="faq-title" kicker="Questions" title="Before you join." />
            <div className={s.faq}>
              {FAQS.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>
                    {q}
                    <span aria-hidden="true" className={s.plus} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Shell>
  );
}
