# Codex — CMS Tabanlı Landing Page ve Yönetim Sistemi

Landing page, uygulama konfigürasyonu ve yönetim panelini **tek çatı altında** toplayan,
kendi kendine yeten (self-hosted) bir CMS sistemi.

- **Landing page** (`/`) — içeriğin tamamı CMS'ten gelir; kod değişikliği olmadan panelden yönetilir.
- **Yönetim paneli** (`/admin`) — sayfalar, bölümler, menüler, medya, site ayarları, SEO,
  marka renkleri, özellik bayrakları, kullanıcılar, API anahtarları ve denetim kaydı.
- **Public API** (`/api/v1`) — mobil/web uygulamanızın içerik ve özellik bayraklarını
  tüketmesi için API anahtarı korumalı uçlar.

## Teknoloji

| Katman | Teknoloji |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript (strict) |
| Stil | Tailwind CSS v4 |
| Veritabanı | SQLite (better-sqlite3) — `data/cms.db`, ilk çalıştırmada otomatik oluşturulur ve örnek içerikle doldurulur |
| Kimlik doğrulama | Veritabanı destekli oturumlar (httpOnly çerez), bcrypt şifre özeti |

## Hızlı Başlangıç

```bash
npm install
npm run dev        # http://localhost:3000
```

- Landing page: `http://localhost:3000`
- Yönetim paneli: `http://localhost:3000/admin`

**Varsayılan yönetici hesabı** (ilk çalıştırmada otomatik oluşturulur):

- E-posta: `admin@codex.local`
- Şifre: `admin123!`

> ⚠️ İlk girişten sonra **Kullanıcılar** sayfasından şifrenizi mutlaka değiştirin.
> İsterseniz ilk çalıştırmadan önce `CMS_ADMIN_EMAIL` ve `CMS_ADMIN_PASSWORD`
> ortam değişkenleriyle farklı bir hesap tanımlayabilirsiniz (bkz. `.env.example`).

## Mimari

```
src/
├── app/
│   ├── page.tsx              # Landing page (CMS'ten beslenir, server-side)
│   ├── admin/
│   │   ├── login/            # Giriş ekranı
│   │   └── (panel)/          # Korumalı yönetim paneli sayfaları
│   └── api/
│       ├── admin/            # Panelin kullandığı korumalı REST API
│       └── v1/               # Uygulamanızın kullanacağı public API (x-api-key)
├── components/
│   ├── landing/              # Landing bölüm bileşenleri (hero, pricing, faq…)
│   └── admin/                # Panel UI kütüphanesi + form bileşenleri
├── lib/
│   ├── types.ts              # İçerik modeli + bölüm şemaları (SECTION_DEFINITIONS)
│   ├── db.ts                 # SQLite şema, CRUD katmanı, tohum verisi
│   ├── auth.ts               # Oturum + rol/yetki guard'ları
│   └── content.ts            # Landing ve public API okuma katmanı
└── middleware.ts             # /admin çerez ön kontrolü
```

### İçerik modeli

Landing page **sayfa → bölüm (section)** modeliyle yönetilir. Her bölümün tipi
(`hero`, `features`, `stats`, `pricing`, `testimonials`, `faq`, `cta`, `logos`, `content`)
ve tipe özel içerik şeması vardır. Şemalar `src/lib/types.ts` içindeki
`SECTION_DEFINITIONS`'ta tanımlıdır; **admin panelindeki formlar bu meta veriden
otomatik üretilir**. Yeni bir bölüm tipi eklemek üç adımdır:

1. `types.ts` → `SECTION_DEFINITIONS`'a şema ekle
2. `src/components/landing/sections/` → render bileşeni yaz
3. `SectionRenderer.tsx` → eşlemeye ekle

### Roller ve yetkiler

| Rol | İçerik | Ayarlar/Bayraklar/API | Kullanıcılar | Denetim |
| --- | :-: | :-: | :-: | :-: |
| Sahip (OWNER) | ✓ | ✓ | ✓ | ✓ |
| Yönetici (ADMIN) | ✓ | ✓ | — | ✓ |
| Editör (EDITOR) | ✓ | — | — | — |
| İzleyici (VIEWER) | — | — | — | — |

Tüm yazma işlemleri **denetim kaydına** (audit log) işlenir.

## Uygulama Entegrasyonu (Public API)

Panelden **API Anahtarları** sayfasında bir anahtar oluşturun, ardından:

```bash
# Sayfa içeriği (bölümler + ayarlar + menüler)
curl -H "x-api-key: cms_..." "https://siteniz.com/api/v1/content?page=home"

# Özellik bayrakları (uygulama davranışını uzaktan yönetin)
curl -H "x-api-key: cms_..." "https://siteniz.com/api/v1/flags"
```

`/api/v1/flags` yanıtı `{ "flags": { "dark_mode": { "enabled": true, "value": {} }, … } }`
biçimindedir — uygulamanızda özellikleri yayına almadan önce panelden açıp kapatabilirsiniz.

## Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
| --- | --- | --- |
| `CMS_DATA_DIR` | `./data` | SQLite dosyasının tutulduğu dizin |
| `CMS_ADMIN_EMAIL` | `admin@codex.local` | İlk tohum yöneticisinin e-postası |
| `CMS_ADMIN_PASSWORD` | `admin123!` | İlk tohum yöneticisinin şifresi |

## Üretim (Production)

```bash
npm run build
npm start
```

Kalıcı disk gerektirir (SQLite + `public/uploads`). Bu nedenle VPS/Docker/Fly.io/Railway
gibi kalıcı dosya sistemi sunan ortamlar uygundur; salt okunur serverless ortamlar
(ör. Vercel'in varsayılan dosya sistemi) veritabanı yazamaz.
