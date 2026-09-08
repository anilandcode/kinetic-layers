import type { Metadata } from "next";
import Shell from "@/components/kl/Shell";
import { redirect } from "next/navigation";
import { Mark } from "@/components/legacy/Chrome";
import { getViewer } from "@/lib/kl/viewer";
import PasswordForm from "@/components/legacy/PasswordForm";
import Link from "next/link";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false, follow: false } };

/* Reached only through a recovery link, which signs the visitor in first.
   Landing here without a session means the link expired. */
export default async function ResetPassword() {
  const viewer = await getViewer();
  if (!viewer) redirect("/join?error=" + encodeURIComponent("That reset link has expired. Ask for another."));

  return (
    <Shell>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a className="skip-link" href="#reset">Skip to the form</a>
      <header style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="kl-pad" style={{ height: 66, display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}>
            <Mark />
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kinetic Layers</span>
          </Link>
        </div>
      </header>

      <main id="reset" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "70px 32px" }}>
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
          <h1 style={{ fontSize: 38, lineHeight: 1.12, fontWeight: 500, letterSpacing: "-0.03em", textWrap: "pretty" }}>
            Set a new password.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>
            You&rsquo;re signed in as {viewer.email}. Choose something at least eight characters long.
          </p>
          <PasswordForm />
        </div>
      </main>
      </div>
    </Shell>
  );
}
