import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/kl/viewer";
import Shell from "@/components/v2/Shell";
import AuthStage from "@/components/v2/AuthStage";
import PasswordForm from "@/components/v2/PasswordForm";
import f from "@/components/v2/Form.module.css";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false, follow: false } };

/* Reached only through a recovery link, which signs the visitor in first.
   Landing here without a session means the link expired. */
export default async function ResetPassword() {
  const viewer = await getViewer();
  if (!viewer) redirect("/join?error=" + encodeURIComponent("That reset link has expired. Ask for another."));

  return (
    <Shell>
      <main>
        <AuthStage labelledBy="reset-title">
          <div className={f.auth}>
            <div className={f.head}>
              <h1 id="reset-title" className={f.title}>
                Set a new password.
              </h1>
              <p className={f.lede}>
                You’re signed in as {viewer.email}. Choose something at least eight characters long.
              </p>
            </div>
            <PasswordForm />
          </div>
        </AuthStage>
      </main>
    </Shell>
  );
}
