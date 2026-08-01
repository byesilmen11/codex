import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import {
  AllSettings,
  ApiKey,
  AuditEntry,
  DEFAULT_SETTINGS,
  FeatureFlag,
  MediaItem,
  NavigationItem,
  Page,
  Role,
  Section,
  SectionType,
  User,
} from "./types";
import crypto from "crypto";

const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), "data");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(path.join(DATA_DIR, "cms.db"));
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  ensureSchema(_db);
  return _db;
}

function ensureSchema(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'EDITOR',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS navigation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu TEXT NOT NULL DEFAULT 'header',
      label TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '#',
      sort_order INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      external INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feature_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 0,
      value TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL DEFAULT '',
      mime TEXT NOT NULL DEFAULT '',
      size INTEGER NOT NULL DEFAULT 0,
      path TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      uploaded_by INTEGER
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_email TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL,
      entity TEXT NOT NULL DEFAULT '',
      entity_id TEXT NOT NULL DEFAULT '',
      details TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sections_page ON sections(page_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
  `);

  seedIfEmpty(d);
}

// --- Tohum (seed) verisi ----------------------------------------------------

function seedIfEmpty(d: Database.Database) {
  const userCount = d.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (userCount.c > 0) return;

  const tx = d.transaction(() => {
    // Varsayılan yönetici — ilk girişten sonra şifreyi değiştirin.
    const email = process.env.CMS_ADMIN_EMAIL || "admin@codex.local";
    const password = process.env.CMS_ADMIN_PASSWORD || "admin123!";
    d.prepare(
      "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'OWNER')"
    ).run(email, "Site Sahibi", bcrypt.hashSync(password, 10));

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      d.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
        key,
        JSON.stringify(value)
      );
    }

    const pageId = d
      .prepare(
        "INSERT INTO pages (slug, title, description) VALUES ('home', 'Ana Sayfa', 'Landing page')"
      )
      .run().lastInsertRowid as number;

    const insertSection = d.prepare(
      "INSERT INTO sections (page_id, type, label, content, sort_order) VALUES (?, ?, ?, ?, ?)"
    );

    const seedSections: { type: SectionType; label: string; content: unknown }[] = [
      {
        type: "hero",
        label: "Hero",
        content: {
          badge: "🎉 Yeni sürüm yayında",
          title: "İşinizi büyüten akıllı platform",
          highlight: "akıllı",
          subtitle:
            "Codex ile ekiplerinizi, projelerinizi ve müşterilerinizi tek yerden yönetin. Kurulum dakikalar sürer, sonuçlar hemen gelir.",
          primaryCtaText: "Ücretsiz Başla",
          primaryCtaUrl: "#pricing",
          secondaryCtaText: "Özellikleri İncele",
          secondaryCtaUrl: "#features",
          image: "",
          note: "Kredi kartı gerekmez · 14 gün ücretsiz deneme",
        },
      },
      {
        type: "stats",
        label: "İstatistikler",
        content: {
          items: [
            { value: "10.000+", label: "Aktif kullanıcı" },
            { value: "%99,9", label: "Çalışma süresi" },
            { value: "4,9/5", label: "Kullanıcı puanı" },
            { value: "7/24", label: "Destek" },
          ],
        },
      },
      {
        type: "features",
        label: "Özellikler",
        content: {
          eyebrow: "Özellikler",
          title: "İhtiyacınız olan her şey tek platformda",
          subtitle:
            "Karmaşık araç yığınlarına son. Codex, işinizi yönetmek için gereken tüm modülleri tek çatı altında toplar.",
          items: [
            { icon: "⚡", title: "Hızlı Kurulum", description: "Dakikalar içinde hesabınızı açın, ekibinizi davet edin ve çalışmaya başlayın." },
            { icon: "📊", title: "Gerçek Zamanlı Raporlar", description: "Tüm metriklerinizi canlı panolarla takip edin, veriye dayalı kararlar alın." },
            { icon: "🔒", title: "Kurumsal Güvenlik", description: "Uçtan uca şifreleme, rol bazlı erişim ve denetim kayıtları ile verileriniz güvende." },
            { icon: "🤝", title: "Ekip İş Birliği", description: "Görevler, yorumlar ve bildirimlerle ekibiniz her zaman senkronize." },
            { icon: "🔌", title: "Kolay Entegrasyon", description: "API ve hazır bağlantılarla mevcut araçlarınızla sorunsuz çalışır." },
            { icon: "📱", title: "Mobil Uyumlu", description: "Her cihazdan erişin; iş, siz neredeyseniz orada." },
          ],
        },
      },
      {
        type: "testimonials",
        label: "Yorumlar",
        content: {
          eyebrow: "Müşterilerimiz",
          title: "Binlerce ekip Codex'e güveniyor",
          items: [
            { quote: "Codex'e geçtikten sonra operasyon süremiz yarıya indi. Ekipçe vazgeçemiyoruz.", name: "Elif Kaya", role: "Operasyon Müdürü, Nova Tekstil", avatar: "" },
            { quote: "Kurulumun bu kadar kolay olmasını beklemiyordum. İlk gün ekibin tamamı aktifti.", name: "Mert Demir", role: "Kurucu, Bloom Studio", avatar: "" },
            { quote: "Raporlama tarafı muhteşem. Yönetim toplantılarına artık tek ekranla giriyorum.", name: "Zeynep Arslan", role: "Genel Müdür, Atlas Lojistik", avatar: "" },
          ],
        },
      },
      {
        type: "pricing",
        label: "Fiyatlandırma",
        content: {
          eyebrow: "Fiyatlandırma",
          title: "Her ölçeğe uygun planlar",
          subtitle: "Küçük ekiplerden kurumsal yapılara — ihtiyacınıza göre seçin, istediğiniz zaman yükseltin.",
          plans: [
            {
              name: "Başlangıç", price: "₺0", period: "/ay",
              description: "Denemek ve küçük ekipler için.",
              features: "3 kullanıcı\nTemel raporlar\nTopluluk desteği",
              ctaText: "Ücretsiz Başla", ctaUrl: "#", highlighted: false,
            },
            {
              name: "Profesyonel", price: "₺499", period: "/ay",
              description: "Büyüyen ekipler için en popüler plan.",
              features: "Sınırsız kullanıcı\nGelişmiş raporlar\nAPI erişimi\nÖncelikli destek",
              ctaText: "14 Gün Ücretsiz Dene", ctaUrl: "#", highlighted: true,
            },
            {
              name: "Kurumsal", price: "Özel", period: "",
              description: "Büyük organizasyonlar için özel çözümler.",
              features: "Özel kurulum\nSLA garantisi\nÖzel entegrasyonlar\nAtanmış müşteri temsilcisi",
              ctaText: "Bize Ulaşın", ctaUrl: "#", highlighted: false,
            },
          ],
        },
      },
      {
        type: "faq",
        label: "SSS",
        content: {
          eyebrow: "SSS",
          title: "Sıkça Sorulan Sorular",
          items: [
            { question: "Ücretsiz deneme süresi ne kadar?", answer: "Profesyonel planı 14 gün boyunca ücretsiz deneyebilirsiniz. Kredi kartı bilgisi gerekmez." },
            { question: "İstediğim zaman iptal edebilir miyim?", answer: "Evet. Aboneliğinizi dilediğiniz an panelden tek tıkla iptal edebilirsiniz; dönem sonuna kadar erişiminiz sürer." },
            { question: "Verilerim güvende mi?", answer: "Tüm veriler şifreli olarak saklanır, düzenli yedeklenir ve rol bazlı erişim ile korunur." },
            { question: "Ekibimi nasıl davet ederim?", answer: "Panelden e-posta ile davet gönderebilirsiniz; davet edilen kullanıcılar dakikalar içinde çalışmaya başlar." },
            { question: "Entegrasyon desteği var mı?", answer: "REST API ve hazır entegrasyonlarla mevcut araçlarınıza kolayca bağlanır." },
          ],
        },
      },
      {
        type: "cta",
        label: "Kapanış CTA",
        content: {
          title: "Bugün ücretsiz başlayın",
          subtitle: "Binlerce ekip gibi siz de işinizi Codex ile büyütün. Kurulum yalnızca birkaç dakika sürer.",
          ctaText: "Hemen Hesap Aç",
          ctaUrl: "#pricing",
          note: "Kredi kartı gerekmez",
        },
      },
    ];

    seedSections.forEach((s, i) => {
      insertSection.run(pageId, s.type, s.label, JSON.stringify(s.content), i);
    });

    const insertNav = d.prepare(
      "INSERT INTO navigation (menu, label, url, sort_order) VALUES (?, ?, ?, ?)"
    );
    [
      ["header", "Özellikler", "#features", 0],
      ["header", "Fiyatlandırma", "#pricing", 1],
      ["header", "SSS", "#faq", 2],
      ["footer", "Gizlilik Politikası", "#", 0],
      ["footer", "Kullanım Şartları", "#", 1],
      ["footer", "İletişim", "#", 2],
    ].forEach(([menu, label, url, order]) => insertNav.run(menu, label, url, order));

    const insertFlag = d.prepare(
      "INSERT INTO feature_flags (key, name, description, enabled, value) VALUES (?, ?, ?, ?, ?)"
    );
    insertFlag.run("new_onboarding", "Yeni Onboarding Akışı", "Uygulamada yeni kullanıcı karşılama akışını açar.", 0, "{}");
    insertFlag.run("dark_mode", "Karanlık Mod", "Uygulamada karanlık tema seçeneğini açar.", 1, "{}");
    insertFlag.run("beta_reports", "Beta Raporlar", "Yeni rapor ekranlarını beta kullanıcılarına açar.", 0, JSON.stringify({ audience: "beta" }));
  });

  tx();
}

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

// --- Kullanıcılar -----------------------------------------------------------

const USER_COLS = "id, email, name, role, active, created_at, updated_at";

export function listUsers(): User[] {
  return db().prepare(`SELECT ${USER_COLS} FROM users ORDER BY id`).all() as User[];
}

export function getUser(id: number): User | undefined {
  return db().prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).get(id) as User | undefined;
}

export function getUserByEmail(email: string): (User & { password_hash: string }) | undefined {
  return db()
    .prepare(`SELECT ${USER_COLS}, password_hash FROM users WHERE email = ?`)
    .get(email.toLowerCase().trim()) as (User & { password_hash: string }) | undefined;
}

export function createUser(input: { email: string; name: string; password: string; role: Role }): User {
  const res = db()
    .prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(input.email.toLowerCase().trim(), input.name, bcrypt.hashSync(input.password, 10), input.role);
  return getUser(res.lastInsertRowid as number)!;
}

export function updateUser(
  id: number,
  input: Partial<{ email: string; name: string; password: string; role: Role; active: boolean }>
): User | undefined {
  const u = getUser(id);
  if (!u) return undefined;
  const d = db();
  if (input.email !== undefined)
    d.prepare("UPDATE users SET email = ?, updated_at = ? WHERE id = ?").run(input.email.toLowerCase().trim(), now(), id);
  if (input.name !== undefined)
    d.prepare("UPDATE users SET name = ?, updated_at = ? WHERE id = ?").run(input.name, now(), id);
  if (input.password)
    d.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(bcrypt.hashSync(input.password, 10), now(), id);
  if (input.role !== undefined)
    d.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").run(input.role, now(), id);
  if (input.active !== undefined) {
    d.prepare("UPDATE users SET active = ?, updated_at = ? WHERE id = ?").run(input.active ? 1 : 0, now(), id);
    if (!input.active) d.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
  }
  return getUser(id);
}

export function deleteUser(id: number): boolean {
  return db().prepare("DELETE FROM users WHERE id = ?").run(id).changes > 0;
}

// Var olmayan kullanıcılarda karşılaştırmayı atlamak yerine bu sabit hash'e
// karşı bir bcrypt çalıştırılır; böylece yanıt süresi kullanıcının var olup
// olmadığını sızdırmaz (timing tabanlı kullanıcı enumerasyonunu engeller).
const DUMMY_HASH = bcrypt.hashSync("codex-timing-equalizer", 10);

export function verifyPassword(email: string, password: string): User | null {
  const u = getUserByEmail(email);
  if (!u || !u.active) {
    bcrypt.compareSync(password, DUMMY_HASH); // zamanlamayı eşitle
    return null;
  }
  if (!bcrypt.compareSync(password, u.password_hash)) return null;
  const { password_hash: _ph, ...user } = u;
  return user;
}

export function countOwners(): number {
  return (db().prepare("SELECT COUNT(*) c FROM users WHERE role = 'OWNER' AND active = 1").get() as { c: number }).c;
}

// --- Oturumlar --------------------------------------------------------------

const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export function createSession(userId: number, days = 7): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + days * 86400_000).toISOString();
  db().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(hashToken(token), userId, expires);
  return token;
}

export function getSessionUser(token: string): User | null {
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.active, u.created_at, u.updated_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`
    )
    .get(hashToken(token)) as (User & { expires_at: string }) | undefined;
  if (!row) return null;
  if (!row.active || new Date(row.expires_at) < new Date()) {
    db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
    return null;
  }
  const { expires_at: _e, ...user } = row;
  return user;
}

export function deleteSession(token: string) {
  db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

// --- Sayfalar ---------------------------------------------------------------

export function listPages(): Page[] {
  return db().prepare("SELECT * FROM pages ORDER BY id").all() as Page[];
}

export function getPage(id: number): Page | undefined {
  return db().prepare("SELECT * FROM pages WHERE id = ?").get(id) as Page | undefined;
}

export function getPageBySlug(slug: string): Page | undefined {
  return db().prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as Page | undefined;
}

export function createPage(input: { slug: string; title: string; description?: string }): Page {
  const res = db()
    .prepare("INSERT INTO pages (slug, title, description) VALUES (?, ?, ?)")
    .run(input.slug, input.title, input.description ?? "");
  return getPage(res.lastInsertRowid as number)!;
}

export function updatePage(
  id: number,
  input: Partial<{ slug: string; title: string; description: string; published: boolean }>
): Page | undefined {
  const p = getPage(id);
  if (!p) return undefined;
  db()
    .prepare("UPDATE pages SET slug = ?, title = ?, description = ?, published = ?, updated_at = ? WHERE id = ?")
    .run(
      input.slug ?? p.slug,
      input.title ?? p.title,
      input.description ?? p.description,
      input.published === undefined ? p.published : input.published ? 1 : 0,
      now(),
      id
    );
  return getPage(id);
}

export function deletePage(id: number): boolean {
  return db().prepare("DELETE FROM pages WHERE id = ?").run(id).changes > 0;
}

// --- Bölümler ---------------------------------------------------------------

export function listSections(pageId: number, onlyEnabled = false): Section[] {
  const sql = onlyEnabled
    ? "SELECT * FROM sections WHERE page_id = ? AND enabled = 1 ORDER BY sort_order, id"
    : "SELECT * FROM sections WHERE page_id = ? ORDER BY sort_order, id";
  return db().prepare(sql).all(pageId) as Section[];
}

export function getSection(id: number): Section | undefined {
  return db().prepare("SELECT * FROM sections WHERE id = ?").get(id) as Section | undefined;
}

export function createSection(input: {
  page_id: number;
  type: SectionType;
  label: string;
  content: unknown;
}): Section {
  const maxOrder = db()
    .prepare("SELECT COALESCE(MAX(sort_order), -1) m FROM sections WHERE page_id = ?")
    .get(input.page_id) as { m: number };
  const res = db()
    .prepare("INSERT INTO sections (page_id, type, label, content, sort_order) VALUES (?, ?, ?, ?, ?)")
    .run(input.page_id, input.type, input.label, JSON.stringify(input.content ?? {}), maxOrder.m + 1);
  return getSection(res.lastInsertRowid as number)!;
}

export function updateSection(
  id: number,
  input: Partial<{ label: string; content: unknown; enabled: boolean }>
): Section | undefined {
  const s = getSection(id);
  if (!s) return undefined;
  db()
    .prepare("UPDATE sections SET label = ?, content = ?, enabled = ?, updated_at = ? WHERE id = ?")
    .run(
      input.label ?? s.label,
      input.content === undefined ? s.content : JSON.stringify(input.content),
      input.enabled === undefined ? s.enabled : input.enabled ? 1 : 0,
      now(),
      id
    );
  return getSection(id);
}

export function reorderSections(pageId: number, orderedIds: number[]) {
  const stmt = db().prepare("UPDATE sections SET sort_order = ?, updated_at = ? WHERE id = ? AND page_id = ?");
  const tx = db().transaction(() => {
    orderedIds.forEach((id, i) => stmt.run(i, now(), id, pageId));
  });
  tx();
}

export function deleteSection(id: number): boolean {
  return db().prepare("DELETE FROM sections WHERE id = ?").run(id).changes > 0;
}

// --- Navigasyon -------------------------------------------------------------

export function listNavigation(menu?: "header" | "footer", onlyEnabled = false): NavigationItem[] {
  let sql = "SELECT * FROM navigation";
  const conds: string[] = [];
  const params: unknown[] = [];
  if (menu) {
    conds.push("menu = ?");
    params.push(menu);
  }
  if (onlyEnabled) conds.push("enabled = 1");
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  sql += " ORDER BY sort_order, id";
  return db().prepare(sql).all(...params) as NavigationItem[];
}

export function createNavItem(input: {
  menu: "header" | "footer";
  label: string;
  url: string;
  external?: boolean;
}): NavigationItem {
  const maxOrder = db()
    .prepare("SELECT COALESCE(MAX(sort_order), -1) m FROM navigation WHERE menu = ?")
    .get(input.menu) as { m: number };
  const res = db()
    .prepare("INSERT INTO navigation (menu, label, url, sort_order, external) VALUES (?, ?, ?, ?, ?)")
    .run(input.menu, input.label, input.url, maxOrder.m + 1, input.external ? 1 : 0);
  return db().prepare("SELECT * FROM navigation WHERE id = ?").get(res.lastInsertRowid) as NavigationItem;
}

export function updateNavItem(
  id: number,
  input: Partial<{ menu: "header" | "footer"; label: string; url: string; sort_order: number; enabled: boolean; external: boolean }>
): NavigationItem | undefined {
  const n = db().prepare("SELECT * FROM navigation WHERE id = ?").get(id) as NavigationItem | undefined;
  if (!n) return undefined;
  db()
    .prepare("UPDATE navigation SET menu = ?, label = ?, url = ?, sort_order = ?, enabled = ?, external = ? WHERE id = ?")
    .run(
      input.menu ?? n.menu,
      input.label ?? n.label,
      input.url ?? n.url,
      input.sort_order ?? n.sort_order,
      input.enabled === undefined ? n.enabled : input.enabled ? 1 : 0,
      input.external === undefined ? n.external : input.external ? 1 : 0,
      id
    );
  return db().prepare("SELECT * FROM navigation WHERE id = ?").get(id) as NavigationItem;
}

export function deleteNavItem(id: number): boolean {
  return db().prepare("DELETE FROM navigation WHERE id = ?").run(id).changes > 0;
}

// --- Ayarlar ----------------------------------------------------------------

export function getSettings(): AllSettings {
  const rows = db().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const result = structuredClone(DEFAULT_SETTINGS) as AllSettings;
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.value);
      const k = row.key as keyof AllSettings;
      if (k in result) result[k] = { ...result[k], ...parsed };
    } catch {
      // bozuk kayıt — varsayılan kalır
    }
  }
  return result;
}

export function updateSettings(patch: Partial<AllSettings>): AllSettings {
  const current = getSettings();
  const stmt = db()
    .prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
  const tx = db().transaction(() => {
    for (const [key, value] of Object.entries(patch)) {
      if (!(key in DEFAULT_SETTINGS)) continue;
      const merged = { ...current[key as keyof AllSettings], ...(value as object) };
      stmt.run(key, JSON.stringify(merged), now());
    }
  });
  tx();
  return getSettings();
}

// --- Feature flag'ler -------------------------------------------------------

export function listFlags(): FeatureFlag[] {
  return db().prepare("SELECT * FROM feature_flags ORDER BY key").all() as FeatureFlag[];
}

export function getFlag(id: number): FeatureFlag | undefined {
  return db().prepare("SELECT * FROM feature_flags WHERE id = ?").get(id) as FeatureFlag | undefined;
}

export function createFlag(input: { key: string; name: string; description?: string; enabled?: boolean; value?: unknown }): FeatureFlag {
  const res = db()
    .prepare("INSERT INTO feature_flags (key, name, description, enabled, value) VALUES (?, ?, ?, ?, ?)")
    .run(
      input.key.trim(),
      input.name,
      input.description ?? "",
      input.enabled ? 1 : 0,
      JSON.stringify(input.value ?? {})
    );
  return getFlag(res.lastInsertRowid as number)!;
}

export function updateFlag(
  id: number,
  input: Partial<{ key: string; name: string; description: string; enabled: boolean; value: unknown }>
): FeatureFlag | undefined {
  const f = getFlag(id);
  if (!f) return undefined;
  db()
    .prepare("UPDATE feature_flags SET key = ?, name = ?, description = ?, enabled = ?, value = ?, updated_at = ? WHERE id = ?")
    .run(
      input.key ?? f.key,
      input.name ?? f.name,
      input.description ?? f.description,
      input.enabled === undefined ? f.enabled : input.enabled ? 1 : 0,
      input.value === undefined ? f.value : JSON.stringify(input.value),
      now(),
      id
    );
  return getFlag(id);
}

export function deleteFlag(id: number): boolean {
  return db().prepare("DELETE FROM feature_flags WHERE id = ?").run(id).changes > 0;
}

// --- Medya ------------------------------------------------------------------

export function listMedia(): MediaItem[] {
  return db().prepare("SELECT * FROM media ORDER BY id DESC").all() as MediaItem[];
}

export function getMedia(id: number): MediaItem | undefined {
  return db().prepare("SELECT * FROM media WHERE id = ?").get(id) as MediaItem | undefined;
}

export function createMedia(input: {
  filename: string;
  original_name: string;
  mime: string;
  size: number;
  path: string;
  uploaded_by?: number;
}): MediaItem {
  const res = db()
    .prepare("INSERT INTO media (filename, original_name, mime, size, path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)")
    .run(input.filename, input.original_name, input.mime, input.size, input.path, input.uploaded_by ?? null);
  return getMedia(res.lastInsertRowid as number)!;
}

export function updateMediaAlt(id: number, alt: string): MediaItem | undefined {
  db().prepare("UPDATE media SET alt = ? WHERE id = ?").run(alt, id);
  return getMedia(id);
}

export function deleteMedia(id: number): MediaItem | undefined {
  const m = getMedia(id);
  if (!m) return undefined;
  db().prepare("DELETE FROM media WHERE id = ?").run(id);
  return m;
}

// --- Denetim kaydı ----------------------------------------------------------

export function addAudit(input: {
  user_id?: number | null;
  user_email?: string;
  action: string;
  entity?: string;
  entity_id?: string | number;
  details?: unknown;
}) {
  db()
    .prepare("INSERT INTO audit_log (user_id, user_email, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      input.user_id ?? null,
      input.user_email ?? "",
      input.action,
      input.entity ?? "",
      String(input.entity_id ?? ""),
      typeof input.details === "string" ? input.details : JSON.stringify(input.details ?? "")
    );
}

export function listAudit(limit = 100, offset = 0): AuditEntry[] {
  return db()
    .prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as AuditEntry[];
}

// --- API anahtarları --------------------------------------------------------

export function listApiKeys(): ApiKey[] {
  return db()
    .prepare("SELECT id, name, prefix, active, created_at, last_used_at FROM api_keys ORDER BY id")
    .all() as ApiKey[];
}

/** Yeni anahtar üretir; ham anahtar YALNIZCA bu çağrının dönüşünde görünür. */
export function createApiKey(name: string): { key: string; record: ApiKey } {
  const raw = "cms_" + crypto.randomBytes(24).toString("hex");
  const prefix = raw.slice(0, 12);
  db()
    .prepare("INSERT INTO api_keys (name, prefix, key_hash) VALUES (?, ?, ?)")
    .run(name, prefix, hashToken(raw));
  const record = db()
    .prepare("SELECT id, name, prefix, active, created_at, last_used_at FROM api_keys WHERE key_hash = ?")
    .get(hashToken(raw)) as ApiKey;
  return { key: raw, record };
}

export function verifyApiKey(raw: string): boolean {
  if (!raw) return false;
  const row = db()
    .prepare("SELECT id FROM api_keys WHERE key_hash = ? AND active = 1")
    .get(hashToken(raw)) as { id: number } | undefined;
  if (!row) return false;
  db().prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(now(), row.id);
  return true;
}

export function setApiKeyActive(id: number, active: boolean): boolean {
  return db().prepare("UPDATE api_keys SET active = ? WHERE id = ?").run(active ? 1 : 0, id).changes > 0;
}

export function deleteApiKey(id: number): boolean {
  return db().prepare("DELETE FROM api_keys WHERE id = ?").run(id).changes > 0;
}

export function countActiveApiKeys(): number {
  return (db().prepare("SELECT COUNT(*) c FROM api_keys WHERE active = 1").get() as { c: number }).c;
}
