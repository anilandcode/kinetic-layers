import { getViewer } from "@/lib/kl/viewer";
import { ShellFrame } from "@/components/v2/ShellFrame";
import NotFoundNotice from "@/components/v2/NotFoundNotice";

/* An unmatched URL renders under the root layout alone, outside app/(site),
   so it draws its own frame. notFound() inside a page uses (site)/not-found. */
export default function NotFound() {
  return (
    <ShellFrame viewer={getViewer().catch(() => null)}>
      <NotFoundNotice />
    </ShellFrame>
  );
}
