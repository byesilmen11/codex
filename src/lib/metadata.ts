import type { Metadata } from "next";
import type { PublicContent } from "./content";

// Landing sayfaları için SEO meta üretir. Sayfaya özel başlık/açıklama
// öncelikli, site geneli SEO ayarları yedek olarak kullanılır.
export function buildPageMetadata(data: PublicContent | null): Metadata {
  if (!data) return { title: "Site hazırlanıyor" };

  const { site, seo } = data.settings;
  const isHome = data.page.slug === "home";

  const title = isHome
    ? seo.metaTitle || site.title
    : data.page.title || site.title;
  const description =
    (isHome ? seo.metaDescription : data.page.description) ||
    seo.metaDescription ||
    site.description;

  const meta: Metadata = {
    title,
    description,
    keywords: seo.keywords || undefined,
    openGraph: {
      title,
      description,
      ...(seo.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    robots: seo.robotsIndex ? undefined : { index: false, follow: false },
  };
  if (site.favicon) {
    meta.icons = { icon: site.favicon };
  }
  if (isHome && seo.canonicalUrl) {
    meta.alternates = { canonical: seo.canonicalUrl };
  }
  return meta;
}
