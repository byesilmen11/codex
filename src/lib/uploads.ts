import path from "path";

// Yüklenen dosyalar public/ yerine kalıcı veri dizininde tutulur; böylece
// `next start` (production) build sonrası eklenen dosyaları da servis edebilir
// ve dosyalar SQLite ile aynı kalıcı diskte kalır. Servis işi /uploads/[filename]
// route handler'ı üzerinden, güvenlik başlıklarıyla yapılır.
const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), "data");

export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "svg",
  "ico",
  "pdf",
]);

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// Yüklenen dosya adları crypto.randomUUID() + uzantı biçimindedir; bu regex
// hem doğrulama hem de path traversal koruması sağlar.
export const UPLOAD_NAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpe?g|webp|gif|svg|ico|pdf)$/i;

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  pdf: "application/pdf",
};

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}
