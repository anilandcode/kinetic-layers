"use client";

import { ShellFrame } from "@/components/v2/ShellFrame";
import ErrorNotice from "@/components/v2/ErrorNotice";

/**
 * The last boundary: it catches an error thrown by app/(site)/layout.tsx
 * itself, so it cannot rely on that frame and draws its own — with the account
 * slot as a placeholder, rather than asking for a session on the one screen
 * that exists because a fetch just failed.
 */
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ShellFrame>
      <ErrorNotice {...props} />
    </ShellFrame>
  );
}
