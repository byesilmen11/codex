# 02 · Durum — Kaldığımız Yer

> **Yaşayan dosya.** Her iş bloğunun sonunda güncellenir; oturuma dönünce İLK bu okunur.

**Son güncelleme:** 2026-08-30 · oturum O-06 · dal `claude/surprise-egg-collection-game-eycqiq` · son commit: proje yönetim katmanının kurulumu

## Tek paragraf özet

HTML5 prototip **özellik-tamamlanmış ve yayın öncesi cilalanmış** durumda: tam oyun döngüsü
(FTUE → ritüel → albüm → oturum döngüsü → gün kapanışı), 2 biyom / 62 Pufi, ebeveyn DEMO
mağazası, araştırma temelli psikolojik kancaların tamamı (P1-P6) uygulanmış; motor testi
tümü yeşil + duman testi 55 adım sıfır konsol hatasıyla geçiyor. Unity taşıma planı yazıldı
(`docs/v2/07`) ve U0 boru hattının içerik + altın vektör araçları bitti. Şu an U0'ın kalan
ihraç araçlarındayız.

## Sıradaki adım (buradan devam et)

➡️ **`tools/export-art.mjs` ilk sürümü** — SVG→PNG boru hattı kanıtı: yumurta (6 nadirlik ×
crack 0-3) + 5 örnek Pufi'yi @2x/@3x PNG'ye render et (`resvg`/`sharp`), `content/art/` altına
deterministik çıktı + `--check` modu (docs/v2/07 §5 ve §13 madde 6). Sonrası: `export-audio.mjs`
(docs/v2/07 §6), sonra Unity proje iskeleti (U1).

## Ne bitti (kanıtlarıyla)

| İş | Kanıt |
|---|---|
| v1 kılavuz (11 bölüm) + v2 derin araştırma (8 bölüm) | `docs/`, `docs/v2/` |
| Prototip: tam döngü + 2 biyom + ritüel + ebeveyn paneli + cila (P1-P6) | `prototype/`; commit `d3e5d51`→`b40509f` |
| Testler: motor (statik+simülasyon+migrasyon+P3) ve duman (55 adım) | `tools/proto-engine-test.mjs`, `tools/proto-smoke.mjs` — ikisi de yeşil |
| Yayın öncesi araştırma (3 paralel ajan) yazıya döküldü | `docs/v2/08-yayin-oncesi-arastirma.md` |
| Unity taşıma planı | `docs/v2/07-unity-tasima-plani.md` |
| U0: içerik ihracı + altın vektörler (`--check` CI kapılarıyla) | `tools/export-content.mjs`, `tools/export-golden-vectors.mjs`, `content/` |
| Proje yönetim katmanı | `proje/` (bu klasör) |

## Canlı referanslar

- **Oynanabilir prototip (artifact, hep aynı URL):**
  `https://claude.ai/code/artifact/04cdcb1e-4e8b-4edf-9081-7e16ff8114ef`
- **Test komutları:** `node tools/proto-engine-test.mjs` · `node tools/proto-smoke.mjs`
  (önce `node tools/build-proto.mjs`)
- **İhraç güncellik kapıları:** `node tools/export-content.mjs --check` ·
  `node tools/export-golden-vectors.mjs --check`
- **Ekran görüntüleri:** `prototype/screenshots/01-18*.png` (duman testi her koşuda tazeler)

## Açık konular / bekleyen kararlar

1. **Park edilenler** (gerekçeleriyle `01-yol-haritasi.md` alt tablosu): hukuk, bölge matrisi,
   mağaza kategorisi, sosyallik, sponsorlu seriler.
2. **Unity proje iskeleti ne zaman açılacak** — U0 ihraç araçları bitince (export-art +
   export-audio) karar anı: repo içinde `/client` mi, ayrı repo mu (öneri: aynı repo `/client`,
   docs/11 §7 depo yapısına uygun).
3. **Bilinen küçük kozmetik pürüz:** yuvada "Sürpriz posta!" çipi tezgâhın arkasına taşabiliyor
   (ekran görüntüsü 15-16'da görünür; işlevsel değil, `03-yapilacaklar.md`'de düşük öncelik).
