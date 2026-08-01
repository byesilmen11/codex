import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPage } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import PublicPage from "@/components/landing/PublicPage";

export const dynamic = "force-dynamic";

// CMS'te oluşturulan yayınlanmış sayfaları /{slug} adresinden servis eder.
// (Ana sayfa "home" slug'ı ile / rotasında ayrıca ele alınır.)
type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata(ctx: Ctx): Promise<Metadata> {
  const { slug } = await ctx.params;
  return buildPageMetadata(getPublicPage(slug));
}

export default async function DynamicPage(ctx: Ctx) {
  const { slug } = await ctx.params;
  const data = getPublicPage(slug);
  if (!data) notFound();
  return <PublicPage data={data} />;
}
