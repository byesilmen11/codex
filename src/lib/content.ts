// Landing ve public API için okuma katmanı.
import {
  getPageBySlug,
  getSettings,
  listFlags,
  listNavigation,
  listSections,
} from "./db";
import { AllSettings, NavigationItem, Page, Section } from "./types";

export interface PublicSection {
  id: number;
  type: string;
  content: Record<string, unknown>;
}

export interface PublicPageContent {
  page: Pick<Page, "slug" | "title" | "description">;
  sections: PublicSection[];
}

export interface PublicContent extends PublicPageContent {
  settings: AllSettings;
  navigation: { header: NavigationItem[]; footer: NavigationItem[] };
}

function toPublicSection(s: Section): PublicSection {
  let content: Record<string, unknown> = {};
  try {
    content = JSON.parse(s.content);
  } catch {
    // bozuk içerik — boş obje döner
  }
  return { id: s.id, type: s.type, content };
}

/** Yayınlanmış bir sayfanın tüm içeriğini döndürür (landing + public API). */
export function getPublicPage(slug: string): PublicContent | null {
  const page = getPageBySlug(slug);
  if (!page || !page.published) return null;
  const sections = listSections(page.id, true).map(toPublicSection);
  return {
    page: { slug: page.slug, title: page.title, description: page.description },
    sections,
    settings: getSettings(),
    navigation: {
      header: listNavigation("header", true),
      footer: listNavigation("footer", true),
    },
  };
}

/** Uygulama tarafının tüketeceği feature flag seti. */
export function getPublicFlags(): Record<string, { enabled: boolean; value: unknown }> {
  const flags = listFlags();
  const out: Record<string, { enabled: boolean; value: unknown }> = {};
  for (const f of flags) {
    let value: unknown = {};
    try {
      value = JSON.parse(f.value);
    } catch {
      // bozuk değer — boş obje
    }
    out[f.key] = { enabled: !!f.enabled, value };
  }
  return out;
}
