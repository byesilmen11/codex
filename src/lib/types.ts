// ---------------------------------------------------------------------------
// Merkezi tip tanımları ve bölüm (section) şema meta verileri.
// Admin paneli formları SECTION_DEFINITIONS üzerinden otomatik üretilir;
// landing bileşenleri de aynı içerik tiplerini tüketir. Yeni bir bölüm tipi
// eklemek için: 1) content arayüzünü, 2) SECTION_DEFINITIONS kaydını,
// 3) landing render bileşenini ekleyin.
// ---------------------------------------------------------------------------

export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export const ROLES: Role[] = ["OWNER", "ADMIN", "EDITOR", "VIEWER"];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  EDITOR: "Editör",
  VIEWER: "İzleyici",
};

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  description: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export type SectionType =
  | "hero"
  | "logos"
  | "features"
  | "stats"
  | "pricing"
  | "testimonials"
  | "faq"
  | "cta"
  | "content";

export interface Section {
  id: number;
  page_id: number;
  type: SectionType;
  label: string;
  content: string; // JSON string — tip başına şema SECTION_DEFINITIONS'ta
  sort_order: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: number;
  menu: "header" | "footer";
  label: string;
  url: string;
  sort_order: number;
  enabled: number;
  external: number;
}

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: number;
  value: string; // JSON — flag'e bağlı opsiyonel konfigürasyon
  updated_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  mime: string;
  size: number;
  path: string;
  alt: string;
  created_at: string;
  uploaded_by: number | null;
}

export interface AuditEntry {
  id: number;
  user_id: number | null;
  user_email: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  active: number;
  created_at: string;
  last_used_at: string | null;
}

// --- Ayarlar ---------------------------------------------------------------

export interface SiteSettings {
  title: string;
  tagline: string;
  description: string;
  logoText: string;
  logoImage: string;
  favicon: string;
  footerText: string;
  contactEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  robotsIndex: boolean;
}

export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  backgroundStyle: "light" | "dark";
}

export interface SocialSettings {
  twitter: string;
  linkedin: string;
  instagram: string;
  github: string;
  youtube: string;
}

export interface ScriptSettings {
  headScripts: string;
  bodyScripts: string;
}

export interface AllSettings {
  site: SiteSettings;
  seo: SeoSettings;
  branding: BrandingSettings;
  social: SocialSettings;
  scripts: ScriptSettings;
}

export const DEFAULT_SETTINGS: AllSettings = {
  site: {
    title: "Codex",
    tagline: "İşinizi büyüten akıllı platform",
    description:
      "Codex; ekiplerin işlerini tek yerden yönetmesini sağlayan modern bir platformdur.",
    logoText: "Codex",
    logoImage: "",
    favicon: "",
    footerText: "© {year} Codex. Tüm hakları saklıdır.",
    contactEmail: "info@codex.app",
    maintenanceMode: false,
    maintenanceMessage: "Kısa bir bakım çalışması yapıyoruz. Birazdan buradayız.",
  },
  seo: {
    metaTitle: "Codex — İşinizi büyüten akıllı platform",
    metaDescription:
      "Ekipler için modern iş yönetim platformu. Ücretsiz deneyin.",
    keywords: "codex, platform, iş yönetimi, saas",
    ogImage: "",
    canonicalUrl: "",
    robotsIndex: true,
  },
  branding: {
    primaryColor: "#4f46e5",
    accentColor: "#10b981",
    backgroundStyle: "light",
  },
  social: {
    twitter: "",
    linkedin: "",
    instagram: "",
    github: "",
    youtube: "",
  },
  scripts: {
    headScripts: "",
    bodyScripts: "",
  },
};

// --- Bölüm form meta şeması -------------------------------------------------
// Admin paneli bu meta veriden formları otomatik üretir.

export type FieldKind =
  | "text"
  | "textarea"
  | "image"
  | "url"
  | "boolean"
  | "number"
  | "select"
  | "color"
  | "list";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  options?: { value: string; label: string }[]; // kind === "select"
  itemFields?: FieldDef[]; // kind === "list"
  itemLabel?: string; // kind === "list" — "Özellik", "Plan" vb.
  help?: string;
}

export interface SectionDefinition {
  type: SectionType;
  name: string; // Admin panelinde görünen ad
  description: string;
  fields: FieldDef[];
  defaultContent: Record<string, unknown>;
}

export const SECTION_DEFINITIONS: Record<SectionType, SectionDefinition> = {
  hero: {
    type: "hero",
    name: "Hero (Giriş)",
    description: "Sayfanın en üstündeki büyük tanıtım alanı.",
    fields: [
      { key: "badge", label: "Rozet metni", kind: "text", placeholder: "Yeni: v2.0 yayında" },
      { key: "title", label: "Başlık", kind: "text" },
      { key: "highlight", label: "Vurgulanan kelime", kind: "text", help: "Başlık içinde renkli gösterilecek bölüm." },
      { key: "subtitle", label: "Alt başlık", kind: "textarea" },
      { key: "primaryCtaText", label: "Ana buton metni", kind: "text" },
      { key: "primaryCtaUrl", label: "Ana buton bağlantısı", kind: "url" },
      { key: "secondaryCtaText", label: "İkincil buton metni", kind: "text" },
      { key: "secondaryCtaUrl", label: "İkincil buton bağlantısı", kind: "url" },
      { key: "image", label: "Görsel", kind: "image" },
      { key: "note", label: "Buton altı not", kind: "text", placeholder: "Kredi kartı gerekmez" },
    ],
    defaultContent: {
      badge: "",
      title: "Yeni başlık",
      highlight: "",
      subtitle: "",
      primaryCtaText: "Hemen Başla",
      primaryCtaUrl: "#",
      secondaryCtaText: "",
      secondaryCtaUrl: "",
      image: "",
      note: "",
    },
  },
  logos: {
    type: "logos",
    name: "Logolar / Referanslar",
    description: "Güven veren marka logoları şeridi.",
    fields: [
      { key: "title", label: "Başlık", kind: "text", placeholder: "Bize güvenen ekipler" },
      {
        key: "items",
        label: "Logolar",
        kind: "list",
        itemLabel: "Logo",
        itemFields: [
          { key: "name", label: "Marka adı", kind: "text" },
          { key: "image", label: "Logo görseli", kind: "image" },
        ],
      },
    ],
    defaultContent: { title: "", items: [] },
  },
  features: {
    type: "features",
    name: "Özellikler",
    description: "Ürün özelliklerini kartlar halinde listeler.",
    fields: [
      { key: "eyebrow", label: "Üst etiket", kind: "text", placeholder: "Özellikler" },
      { key: "title", label: "Başlık", kind: "text" },
      { key: "subtitle", label: "Alt başlık", kind: "textarea" },
      {
        key: "items",
        label: "Özellikler",
        kind: "list",
        itemLabel: "Özellik",
        itemFields: [
          { key: "icon", label: "İkon (emoji)", kind: "text", placeholder: "⚡" },
          { key: "title", label: "Başlık", kind: "text" },
          { key: "description", label: "Açıklama", kind: "textarea" },
        ],
      },
    ],
    defaultContent: { eyebrow: "", title: "Özellikler", subtitle: "", items: [] },
  },
  stats: {
    type: "stats",
    name: "İstatistikler",
    description: "Rakamlarla güven veren metrik şeridi.",
    fields: [
      {
        key: "items",
        label: "Metrikler",
        kind: "list",
        itemLabel: "Metrik",
        itemFields: [
          { key: "value", label: "Değer", kind: "text", placeholder: "10.000+" },
          { key: "label", label: "Etiket", kind: "text", placeholder: "Mutlu kullanıcı" },
        ],
      },
    ],
    defaultContent: { items: [] },
  },
  pricing: {
    type: "pricing",
    name: "Fiyatlandırma",
    description: "Plan ve fiyat kartları.",
    fields: [
      { key: "eyebrow", label: "Üst etiket", kind: "text" },
      { key: "title", label: "Başlık", kind: "text" },
      { key: "subtitle", label: "Alt başlık", kind: "textarea" },
      {
        key: "plans",
        label: "Planlar",
        kind: "list",
        itemLabel: "Plan",
        itemFields: [
          { key: "name", label: "Plan adı", kind: "text" },
          { key: "price", label: "Fiyat", kind: "text", placeholder: "₺499" },
          { key: "period", label: "Dönem", kind: "text", placeholder: "/ay" },
          { key: "description", label: "Açıklama", kind: "textarea" },
          { key: "features", label: "Özellikler (her satır bir madde)", kind: "textarea" },
          { key: "ctaText", label: "Buton metni", kind: "text" },
          { key: "ctaUrl", label: "Buton bağlantısı", kind: "url" },
          { key: "highlighted", label: "Öne çıkar", kind: "boolean" },
        ],
      },
    ],
    defaultContent: { eyebrow: "", title: "Fiyatlandırma", subtitle: "", plans: [] },
  },
  testimonials: {
    type: "testimonials",
    name: "Müşteri Yorumları",
    description: "Sosyal kanıt: kullanıcı yorumları.",
    fields: [
      { key: "eyebrow", label: "Üst etiket", kind: "text" },
      { key: "title", label: "Başlık", kind: "text" },
      {
        key: "items",
        label: "Yorumlar",
        kind: "list",
        itemLabel: "Yorum",
        itemFields: [
          { key: "quote", label: "Yorum", kind: "textarea" },
          { key: "name", label: "İsim", kind: "text" },
          { key: "role", label: "Ünvan / Şirket", kind: "text" },
          { key: "avatar", label: "Avatar görseli", kind: "image" },
        ],
      },
    ],
    defaultContent: { eyebrow: "", title: "Müşterilerimiz ne diyor?", items: [] },
  },
  faq: {
    type: "faq",
    name: "SSS",
    description: "Sıkça sorulan sorular (akordeon).",
    fields: [
      { key: "eyebrow", label: "Üst etiket", kind: "text" },
      { key: "title", label: "Başlık", kind: "text" },
      {
        key: "items",
        label: "Sorular",
        kind: "list",
        itemLabel: "Soru",
        itemFields: [
          { key: "question", label: "Soru", kind: "text" },
          { key: "answer", label: "Cevap", kind: "textarea" },
        ],
      },
    ],
    defaultContent: { eyebrow: "", title: "Sıkça Sorulan Sorular", items: [] },
  },
  cta: {
    type: "cta",
    name: "Çağrı (CTA)",
    description: "Sayfa sonunda aksiyon çağrısı bandı.",
    fields: [
      { key: "title", label: "Başlık", kind: "text" },
      { key: "subtitle", label: "Alt başlık", kind: "textarea" },
      { key: "ctaText", label: "Buton metni", kind: "text" },
      { key: "ctaUrl", label: "Buton bağlantısı", kind: "url" },
      { key: "note", label: "Not", kind: "text" },
    ],
    defaultContent: { title: "", subtitle: "", ctaText: "", ctaUrl: "#", note: "" },
  },
  content: {
    type: "content",
    name: "Serbest İçerik",
    description: "Başlık + serbest metin bloğu (satır sonları korunur).",
    fields: [
      { key: "title", label: "Başlık", kind: "text" },
      { key: "body", label: "İçerik", kind: "textarea" },
      { key: "image", label: "Görsel", kind: "image" },
      {
        key: "align",
        label: "Hizalama",
        kind: "select",
        options: [
          { value: "left", label: "Sola" },
          { value: "center", label: "Ortala" },
        ],
      },
    ],
    defaultContent: { title: "", body: "", image: "", align: "left" },
  },
};

// --- İzinler ----------------------------------------------------------------

export type Capability =
  | "content" // sayfa, bölüm, menü, medya
  | "settings" // site ayarları, flag'ler, api anahtarları
  | "users" // kullanıcı yönetimi
  | "audit"; // denetim kaydını görüntüleme

const ROLE_CAPS: Record<Role, Capability[]> = {
  OWNER: ["content", "settings", "users", "audit"],
  ADMIN: ["content", "settings", "audit"],
  EDITOR: ["content"],
  VIEWER: [],
};

export function can(role: Role, cap: Capability): boolean {
  return ROLE_CAPS[role]?.includes(cap) ?? false;
}
