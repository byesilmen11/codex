# Master Studio — Tasarım Yönleri Ortak Spesifikasyonu

Bu depo, **Master Studio** adlı SaaS ürününün arayüzü için 10 bağımsız tasarım yönü içerir.
Her yön tek bir `.html` dosyasıdır ve claude.ai Artifact olarak yayınlanır (dosya içeriği
`<body>` içine gömülür — dosyada `<!doctype>`, `<html>`, `<head>`, `<body>` etiketi OLMAZ).

## Ürün nedir?

Master Studio, KOBİ e-ticaret satıcıları için **yapay zekâ destekli ürün fotoğraf stüdyosu**:
satıcı ürün görselini yükler, sektör ve çekim türlerini seçer, sistem manken üzerinde /
flat-lay / detay kareleri üretir; her kare otomatik **QA karnesi** (Renk, Doku, Logo, Poz)
ile puanlanır; onaylanan kareler galeriye düşer ve pazaryerlerine (Trendyol, Hepsiburada,
Shopify, Amazon) aktarılır. Ekonomi **işlem birimi** (kredi) üzerinedir.

## Paylaşılan içerik modeli (tüm yönlerde AYNI veri)

- Marka: **Master Studio** (alt başlık: "Ürün fotoğraf stüdyosu")
- Ana gezinme: **Stüdyo · Galeri · Toplu Üretim · Entegrasyonlar**
- Kullanıcı: avatar **YG**, **Yeşilmen Ltd.**, e-posta `info@masterstudio.ai`, plan **Stüdyo Pro** (ekip: 3 üye)
- Kredi bakiyesi: **1.240 işlem birimi** (mono yazıtipiyle, tabular-nums)
- Örnek ürünler:
  - **Bel Ceketi · Lacivert** — SKU `BSGMARS25337` (giysi)
  - **Deri Omuz Çantası · Taba** — SKU `BSGTOT9021` (çanta)
  - Gerekirse ek: **Süet Bot · Kum** — SKU `BSGAYK4412` (ayakkabı)
- Sektörler: Moda & Giyim, Ayakkabı, Çanta, Takı, Kozmetik
- 8 çekim türü: Önden tam boy (Manken üzerinde, varsayılan), Yandan görünüm, Arkadan görünüm,
  Yakın detay (Kumaş & dikiş), Bel üstü kadraj, Düz zemin / flat-lay (Mankensiz),
  Askıda görünüm, 360° dönüş — tipik seçim: **6 seçili**
- Kalite kademeleri ve kare başı maliyet: **1K = 3 · 2K = 6 · 4K = 12 işlem birimi**
  (6 kare × 2K = **36 işlem birimi**)
- QA karnesi boyutları ve tipik skorlar: Renk 92 (İyi), Doku 88 (İyi), Logo 64 (Normal), Poz 92 (İyi);
  not örneği: "Renk sadakati ΔE 3.1 ile hedefte. Logo netliği kadraj kenarında hafif düşük."
- Kare rozetleri: **İyi / Normal / Zayıf** · Galeri durumları: **Onaylı / İncele / Taslak**
- Ayarlar: En-boy oranı (1:1, **4:5**, 3:4, 9:16) · Arka plan (**Stüdyo**, Sade, Mekân) ·
  Manken (**Otomatik**, Kadın, Erkek)
- Eylemler: **Oluştur** (maliyet etiketiyle) · Yeniden üret · Onayla
- Ekip üyeleri (çok kullanıcılı ekranlarda): **Yeşilmen (YG)**, **Ayşe K. (AK)**, **Deniz T. (DT)**
- Dil: **Türkçe** (mükemmel yazım; İngilizce arayüz metni yok)

## Görsel yer tutucular

Harici görsel YOK. Her dosya şu SVG sembollerini kendi içinde tanımlar ve `<use>` ile çağırır:

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ms-figure" viewBox="0 0 200 340"><circle cx="100" cy="42" r="23"/><path d="M93 66h14v10H93z"/><path d="M74 78 Q100 70 126 78 L133 150 Q118 158 100 158 Q82 158 67 150 Z"/><path d="M69 149 Q100 160 131 149 L151 302 Q100 318 49 302 Z"/><path d="M74 80 Q57 122 61 182 L71 180 Q69 122 84 86 Z"/><path d="M126 80 Q143 122 139 182 L129 180 Q131 122 116 86 Z"/></symbol>
  <symbol id="ms-garment" viewBox="0 0 200 210"><path d="M70 34 Q100 22 130 34 L164 60 Q170 64 166 72 L149 92 L146 84 L146 188 Q146 194 140 194 L60 194 Q54 194 54 188 L54 84 L51 92 L34 72 Q30 64 36 60 Z"/><path d="M80 34 Q100 54 120 34" fill="none" stroke="currentColor" stroke-width="4" opacity=".5"/></symbol>
  <symbol id="ms-bag" viewBox="0 0 200 200"><path d="M64 84 h72 q10 0 11 10 l7 78 q1 10 -9 10 H55 q-10 0 -9 -10 l7 -78 q1 -10 11 -10 Z"/><path d="M74 84 Q74 48 100 48 Q126 48 126 84" fill="none" stroke="currentColor" stroke-width="7" opacity=".55"/></symbol>
</svg>
```

Not: `id` çakışmasını önlemek için semboller sayfada yalnız bir kez tanımlanır.
İkonlar için inline `stroke="currentColor"` SVG kullanılır (Lucide çizgi stili, stroke-width 2).

## Dosya yapısı (her yön)

1. `<title>Master Studio — Yön X · Ad</title>`
2. `<style>` — başında yönü anlatan blok yorum (ad, konsept, tema kararı, accent, namespace)
3. SVG sembol bloğu
4. Arayüz işaretlemesi — tamamı tek bir kök `<div class="XX">` (namespace sınıfı) içinde
5. `<script>` — küçük, bağımsız, IIFE; `querySelector` null-korumalı

## Kalite çıtası (hepsi ZORUNLU)

- **Namespace:** tüm CSS seçicileri yönün kök sınıfı altında (`.mc .x`, `.mc-y`); çıplak
  `button { }` gibi global seçici yok (yalnız `.XX button` olabilir). ID'ler namespace önekli.
- **Çift tema:** jetonlar (custom properties) kök sınıfta tanımlanır; `@media (prefers-color-scheme: dark)`
  altında yalnız jetonlar yeniden atanır; ardından `:root[data-theme="dark"] .XX` ve
  `:root[data-theme="light"] .XX` blokları her iki yönde de kazanacak şekilde aynı jetonları atar.
  Bileşenler renkleri YALNIZ jetonlar üzerinden kullanır. (Bilinçli tek-tema bir yön bunu
  yorum satırıyla gerekçelendirir — Yön A ve Yön D gibi.)
- **Kontrast:** her iki temada da metin/zemin okunaklı (gövde ≥ 4.5:1 hedefi), accent her iki zeminde çalışır.
- **Duyarlılık:** ~1140px ve ~760px kırılımları; gövde asla yatay kaydırmaz; geniş içerik
  (tablo, zaman çizelgesi, kanban, tuval) kendi kabında `overflow-x: auto`.
- **Erişilebilirlik:** ikon düğmelerinde `aria-label`; `:focus-visible` görünür; `::selection` stillenmiş;
  `@media (prefers-reduced-motion: reduce)` tüm animasyon/geçişleri kapatır.
- **Tipografi:** sistem yığınları (`ui-sans-serif…`, mono için `ui-monospace…`; Yön I serif:
  `ui-serif, "New York", Georgia, "Times New Roman", serif`). Rakam sütunlarında
  `font-variant-numeric: tabular-nums`. Başlıklarda `text-wrap: balance` uygun yerde.
- **Ağ yok:** hiçbir `http(s)://` kaynağı (görsel, font, script) yok; `href` yalnız `#`.
- **Etkileşim:** en az 2 çalışan mikro-etkileşim (ör. seçim/maliyet yeniden hesabı, sekme/filtre
  değişimi, hover durumları). JS küçük ve savunmacı.
- **Bilgi tasarımı:** özet ayrıntıdan önce; durum renk + biçimle kodlanır (rozet, şerit, nokta);
  semantik renkler (iyi/uyarı/zayıf) accent'ten ayrı; tıklanabilir olan tıklanabilir görünür.
- **Kopya:** kullanıcı dilinden, aktif çatı; düğme tam olarak ne yapacağını söyler.

## Yön kataloğu

| Yön | Dosya | Namespace | Tema | Konsept |
|-----|-------|-----------|------|---------|
| A | `yon-a-studyo-sinematik.html` | `.sa` | Koyu (bilinçli) | Renk-derecelendirme masası; altın accent |
| B | `yon-b-berrak-fayda.html` | `.lb` | Çift | Linear/Vercel çizgisi; klavye-öncelikli; indigo |
| C | `yon-c-sicak-yaratici.html` | `.wc` | Çift | KOBİ'ye sıcak rehberli akış; turuncu |
| D | `yon-d-komuta-merkezi.html` | `.mc` | Koyu (bilinçli) | Toplu Üretim operasyon paneli; canlı telemetri |
| E | `yon-e-bento-monokrom.html` | `.bt` | Çift | Genel Bakış panosu; bento ızgara; monokrom + tek sinyal |
| F | `yon-f-copilot-studyo.html` | `.cp` | Çift | Komut/istem-öncelikli üretim; yapay zekâ yardımcısı |
| G | `yon-g-onay-hatti.html` | `.kb` | Çift | Galeri onay hattı; kanban; SLA ve toplu işlem |
| H | `yon-h-sonsuz-tuval.html` | `.cv` | Çift | Figma-vari uzamsal tuval; çok oyunculu |
| I | `yon-i-editoryal-atolye.html` | `.ed` | Çift | Moda editoryali; serif; lookbook |
| J | `yon-j-akis-kurucu.html` | `.fb` | Çift | Düğüm tabanlı otomasyon kurucu; koşum geçmişi |

Accent aileleri çakışmasın: A altın · B indigo · C turuncu · D buz camgöbeği · E kobalt sinyal ·
F gül/magenta · G erik · H çelik mavisi + imleç renkleri · I bordo · J petrol/teal.
