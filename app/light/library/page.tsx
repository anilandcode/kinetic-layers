import type { Metadata } from "next";
import LibraryView from "@/components/legacy/LibraryView";

/* The same library in the storefront treatment: same grid, same filters, warm
   neutrals, forest green doing the work sage does on dark. Mirrors how
   /light mirrors home. */
export const metadata: Metadata = {
  title: "Library — light",
  /* One canonical library. This is a treatment of the same page, not a second
     copy of it, and two indexed URLs with identical content is exactly the
     duplicate a canonical exists to prevent. */
  alternates: { canonical: "/library" },
};

export default function LibraryLight({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return <LibraryView light searchParams={searchParams} />;
}
