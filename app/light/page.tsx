import type { Metadata } from "next";
import HomeView from "@/components/kiln/HomeView";

/* The same library, in the storefront treatment. Same grid, same type, warm
   neutrals, forest green doing the work sage does on dark. */
export const metadata: Metadata = {
  title: "Library — light",
};

export default function HomeLight() {
  return <HomeView light />;
}
