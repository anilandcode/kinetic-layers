import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAsset, getAssetSlugs, getRelated } from "@/lib/sanity/queries";
import { getViewer, gateReason } from "@/lib/kiln/viewer";
import { createClient } from "@/lib/supabase/server";
import ItemView from "@/components/kiln/ItemView";

export async function generateStaticParams() {
  const slugs = await getAssetSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAsset(slug);
  if (!asset) return { title: "Not found" };
  return { title: asset.name, description: asset.tagline };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [asset, viewer] = await Promise.all([getAsset(slug), getViewer()]);
  if (!asset) notFound();

  const related = await getRelated(slug);

  /* Whether it is already saved needs the viewer's own session, so it reads
     through the RLS-scoped client rather than the service role. */
  let saved = false;
  if (viewer) {
    const supabase = await createClient();
    const { data } = (await supabase!
      .from("saved_assets")
      .select("asset_slug")
      .eq("asset_slug", slug)
      .maybeSingle()) ?? { data: null };
    saved = Boolean(data);
  }

  return (
    <ItemView
      asset={asset}
      related={related}
      viewer={viewer}
      gate={gateReason(viewer, asset)}
      saved={saved}
    />
  );
}
