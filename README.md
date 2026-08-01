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
| `CMS_DATA_DIR` | `./data` | SQLite dosyası **ve** yüklenen medyanın tutulduğu dizin (tek kalıcı dizin) |
| `CMS_ADMIN_EMAIL` | `admin@codex.local` | İlk tohum yöneticisinin e-postası |
| `CMS_ADMIN_PASSWORD` | `admin123!` | İlk tohum yöneticisinin şifresi |

> Hem veritabanı (`cms.db`) hem de yüklenen dosyalar (`uploads/`) **tek bir**
> `CMS_DATA_DIR` altında toplanır — böylece tek bir kalıcı volume tüm durumu kapsar.

## Üretim (Production)

Bu uygulama **kalıcı bir dosya sistemine bağlı tek konteyner** olarak çalışacak
şekilde tasarlanmıştır (Ghost, Plausible, Umami gibi). Bu, harici veritabanı/nesne
depolama bağımlılığı, kimlik bilgisi ve ek maliyet olmadan; yedeklemesi tek dosya
kopyası kadar basit, güvenilir bir yapı sağlar.

### Docker (önerilen)

```bash
docker compose up -d --build
```

- Uygulama `http://localhost:3000` adresinde yayınlanır.
- Tüm durum (SQLite + yüklemeler) `codex-data` adlı kalıcı volume'da (`/data`) tutulur.
- İlk yöneticiyi ortam değişkenleriyle belirleyin:

```bash
CMS_ADMIN_EMAIL=siz@ornek.com CMS_ADMIN_PASSWORD='güçlü-parola' \
  docker compose up -d --build
```

Görüntü Next.js **standalone** çıktısıyla üretilir (küçük imaj, kök olmayan
kullanıcı, dahili `HEALTHCHECK`). `Dockerfile` ve `docker-compose.yml` depoda hazırdır.

### Konteynersiz (VPS / systemd)

```bash
npm ci
npm run build
CMS_DATA_DIR=/var/lib/codex npm start
```

`CMS_DATA_DIR`'i kalıcı bir yola verin ve süreci bir servis yöneticisiyle (systemd,
pm2) çalıştırın. Önüne bir ters vekil (nginx/Caddy) koyup TLS'i orada sonlandırın.

### Dağıtım hedefleri

Kalıcı volume sunan her ortam uygundur: **Fly.io** (volume), **Railway**,
**Render** (disk), herhangi bir **VPS/Docker** veya **Kubernetes** (PVC).

> Not: Salt okunur/efemer dosya sistemli serverless ortamlar (ör. Vercel'in
> varsayılan fonksiyon dosya sistemi) SQLite'a yazamaz. Böyle bir hedef zorunluysa
> depolama katmanı harici Postgres + S3 uyumlu nesne depolamaya taşınmalıdır;
> mevcut mimari bu geçişe uygun biçimde (tek `CMS_DATA_DIR` soyutlaması) tasarlandı.

## Yedekleme

WAL modunda bile tutarlı bir veritabanı yedeği alır:

```bash
# Yerel
node scripts/backup.mjs                 # data/backups/ altına yazar

# Docker (çalışan konteynerde)
docker compose exec cms node scripts/backup.mjs /data/backups
```

Yüklenen medya `CMS_DATA_DIR/uploads` altındadır; volume anlık görüntüsü (snapshot)
veya `uploads/` dizininin kopyalanması medya yedeğini kapsar.
