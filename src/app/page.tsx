import type { Metadata } from "next";
import { getPublicPage } from "@/lib/content";
import { buildPageMetadata } from "@/lib/metadata";
import PublicPage, { SitePreparing } from "@/components/landing/PublicPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(getPublicPage("home"));
}

export default function HomePage() {
  const data = getPublicPage("home");
  if (!data) return <SitePreparing />;
  return <PublicPage data={data} />;
}
