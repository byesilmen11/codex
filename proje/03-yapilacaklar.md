# 03 · Yapılacaklar — Statülü İş Listesi

> **Yaşayan dosya.** Statüler: 🔄 yapılıyor · ⬜ sırada · 🔵 ileride · ⏸ park · ✅ bitti
> (bitti maddeleri bir sonraki faz kapanışında `05-oturum-gunlugu.md`'ye devredilip buradan silinir).
> Faz bağlamı: [`01-yol-haritasi.md`](01-yol-haritasi.md) · teknik ayrıntı: [`docs/v2/07`](../docs/v2/07-unity-tasima-plani.md)

## F7 · Unity Köprüsü (U0) — aktif faz

- ✅ Unity taşıma planı (`docs/v2/07`) — commit `3192049`
- ✅ `tools/export-content.mjs` → `content/*.json` + `--check` kapısı — commit `22d1eda`
- ✅ `tools/export-golden-vectors.mjs` → `content/golden/` 5 senaryo / 3.800 vektör — commit `22d1eda`
- 🔄 **`tools/export-art.mjs` ilk sürümü** — SVG→PNG kanıtı: yumurta (6 nadirlik × crack 0-3)
  + 5 örnek Pufi, @2x/@3x, deterministik çıktı + `--check` (v2·07 §5, §13/6) ← SIRADAKİ
- ⬜ `export-art` tam kapsam: 62 Pufi × (happy/sleep/silüet) + oyuncak parçaları + ambalajlar
  (6 seri × 8 varyant × yırtılma) + kapsül/çevre/UI/portreler
- ⬜ `tools/export-audio.mjs` — SOUNDS offline render + 62 pufiChirp (v2·07 §6)
- ⬜ Unity LTS proje iskeleti: `/client`, 4 assembly, CI (test + bağımlılık denetimi) (v2·07 §13/1)
- ⬜ `Yuvo.Core` C# portu: GachaEngine + GameState + SaveService; NUnit altın vektör +
  davranış asertleri (v2·07 §3, §7)

## F8-F10 · Unity U1-U3 (sırada — ayrıntı v2·07 §10)

- 🔵 U1: Home/Ceremony/Assembly/Album ekranları, tek biyom, 22 adım ritüel paritesi
- 🔵 U2: Intro/FTUE, oturum döngüsü, Minigame+ÇıtÇıt, Orman+Şako, FoilBook, ebeveyn paneli
  (DEMO), bildirim altyapısı; 55 adım duman paritesi; gülümseme testi
- 🔵 U2 (küçük): övünme kartı — OS paylaşım sayfası, backend'siz (v2·07 §11)
- 🔵 U3: Unity IAP + makbuz doğrulama, remote config, anonim telemetri, kidSAFE ön denetim,
  mağaza sayfası varlıkları (ikon: maskot + KAPALI parlayan yumurta; ilk 3 görsel:
  kapalı → kırılma → dolu albüm; "Sürpriz Yumurta" arama hedefi; reklamsız konumlanma)

## Prototip küçük işler (fırsat buldukça)

- ⬜ Kozmetik: "Sürpriz posta!" çipinin tezgâhla çakışması (bkz. `02-durum.md` açık konu 3)
- ⬜ Duman testine `--fast` modu (yalnız Bölüm B) — geliştirme döngüsünü kısaltır (opsiyonel)

## ⏸ Park (gerekçeler `01-yol-haritasi.md` alt tablosunda)

- ⏸ Hukuk/mevzuat değerlendirmesi (kullanıcı kararıyla ertelendi — K-04)
- ⏸ Belçika/Hollanda bölge matrisi kapsamı (U3'te bayrak altyapısı kurulur)
- ⏸ Mağaza kategorisi kararı (Kids vs genel + yaş kapısı)
- ⏸ Gerçek sosyallik: arkadaş/hediye + backend (F12)
- ⏸ Sponsorlu ambalaj serileri (yayın sonrası)
