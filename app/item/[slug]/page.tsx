import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ASSETS, findAsset } from "@/lib/kiln/data";
import ItemView from "@/components/kiln/ItemView";

export function generateStaticParams() {
  return ASSETS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const asset = findAsset(slug);
  if (!asset) return { title: "Not found" };
  return {
    title: asset.name,
    description: `${asset.type} for ${asset.stack}. Included with Kiln unlimited.`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const asset = findAsset(slug);
  if (!asset) notFound();
  return <ItemView asset={asset} />;
}
