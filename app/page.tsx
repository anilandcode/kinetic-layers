import HomeView from "@/components/kiln/HomeView";

export default function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  return <HomeView searchParams={searchParams} />;
}
