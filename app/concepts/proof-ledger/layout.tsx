import type { Metadata } from "next";

/* The page itself is a client component (the treatment toggle owns state), so
   its metadata lives here. */
export const metadata: Metadata = {
  title: "Proof Ledger — results section — Direction Kit",
  description:
    "Proof Ledger: an original results and case-study section with editorial figures and a chart that is a real data table.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
