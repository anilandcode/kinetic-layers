"use client";

import ErrorNotice from "@/components/v2/ErrorNotice";

/* A page failed; the frame around it did not, so only the content changes. */
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorNotice {...props} />;
}
