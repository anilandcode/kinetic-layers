import type { Metadata } from "next";
import HomeView from "@/components/legacy/HomeView";

/* The same library in the storefront treatment: same grid, same type, warm
   neutrals, forest green doing the work sage does on dark. */
export const metadata: Metadata = { title: "Library — light" };

export default function HomeLight({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  return <HomeView light searchParams={searchParams} />;
}
