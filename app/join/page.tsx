import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/kl/viewer";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { LIMITS } from "@/lib/kl/limits";
import { HUES } from "@/lib/v2/gradient";
import { enabledProviders } from "@/lib/supabase/providers";
import Shell from "@/components/v2/Shell";
import AuthStage from "@/components/v2/AuthStage";
import AuthForm from "@/components/v2/AuthForm";
import Gradient from "@/components/v2/Gradient";
import Icon from "@/components/v2/Icon";
import s from "@/components/v2/Auth.module.css";

export const metadata: Metadata = {
  title: "Join",
  description: "Start with the free kits. No card needed.",
  robots: { index: false, follow: false },
};

export default async function Join({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const { next, error, mode } = await searchParams;
  const viewer = await getViewer();

  /* Already signed in: a sign-in form they do not need is a dead end, so
     send them where they were going. */
  if (viewer) {
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
    redirect(dest);
  }

  const providers = await enabledProviders();
  const perks = [
    "The free kits, with their specs and prompts",
    `${LIMITS.free.prompt} prompt reads and ${LIMITS.free.download} downloads a day`,
    "An API key for Claude Code and Cursor over MCP",
    "Saved kits and your download history",
  ];

  return (
    <Shell>
      <main>
        <AuthStage
          labelledBy="auth-title"
          aside={
            <Gradient hue={HUES.cobalt} className={s.perks}>
              <p className={s.perksLabel}>What a free account opens</p>
              <ul className={s.perksList}>
                {perks.map((p) => (
                  <li key={p}>
                    <span aria-hidden="true">
                      <Icon name="check" size={14} />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className={s.perksFoot}>
                <p>{EARLY_ACCESS ? "Free while early access is open." : "Free, with Premium planned."}</p>
                <Link href="/pricing">{EARLY_ACCESS ? "What it will cost later" : "See pricing"}</Link>
              </div>
            </Gradient>
          }
        >
          <AuthForm
            next={next}
            initialError={error}
            initialMode={mode === "signin" ? "signin" : "signup"}
            providers={providers}
          />
        </AuthStage>
      </main>
    </Shell>
  );
}
