import type { Metadata } from "next";
import LibraryView from "@/components/kl/LibraryView";

export const metadata: Metadata = {
  alternates: { canonical: "/library" },
  title: "Library",
  description:
    "Every prompt, template, scene and workflow in the library — filter by type, category and theme. Every card opens on its source files.",
};

export default function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return <LibraryView searchParams={searchParams} />;
}
