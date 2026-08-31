import type { Metadata } from "next";
import LibraryView from "@/components/kiln/LibraryView";

export const metadata: Metadata = {
  alternates: { canonical: "/library" },
  title: "Library",
  description:
    "Every prompt, template, scene and workflow in the vault — filter by type, tone and what it was built for.",
};

export default function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return <LibraryView searchParams={searchParams} />;
}
