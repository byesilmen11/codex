// Gerçek uygulama rotalarıyla (ve API'lerle) çakışabilecek slug'lar rezervedir;
// bir CMS sayfası bunları gölgeleyemez.
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "uploads",
  "_next",
  "home", // ana sayfa / rotasında ele alınır
]);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Slug geçerliyse null, değilse Türkçe hata mesajı döndürür. */
export function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) {
    return "Slug yalnızca küçük harf, rakam ve tire içerebilir (örn. hakkimizda)";
  }
  if (RESERVED_SLUGS.has(slug)) {
    return "Bu slug sistem tarafından ayrılmıştır, başka bir slug seçin";
  }
  return null;
}
