import type { ReactNode } from "react";
import { getViewer } from "@/lib/kl/viewer";
import { ShellFrame } from "./ShellFrame";

export { ShellFrame };

/**
 * The frame, with whoever is looking already resolved. getViewer is wrapped
 * in React `cache`, so a page that also asks for it costs no second round trip.
 */
export default async function Shell({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  return (
    <ShellFrame viewer={viewer}>
      {children}
    </ShellFrame>
  );
}
