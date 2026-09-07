import HomeView from "@/components/kl/HomeView";

export default function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  return <HomeView searchParams={searchParams} />;
}
