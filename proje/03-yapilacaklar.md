# 03 · Yapılacaklar — Statülü İş Listesi

> **Yaşayan dosya.** Statüler: 🔄 yapılıyor · ⬜ sırada · 🔵 ileride · ⏸ park · ✅ bitti
> (bitti maddeleri bir sonraki faz kapanışında `05-oturum-gunlugu.md`'ye devredilip buradan silinir).
> Faz bağlamı: [`01-yol-haritasi.md`](01-yol-haritasi.md) · teknik ayrıntı: [`docs/v2/07`](../docs/v2/07-unity-tasima-plani.md)

## F7 · Unity Köprüsü (U0) — aktif faz

- ✅ Unity taşıma planı (`docs/v2/07`) — commit `3192049`
- ✅ `tools/export-content.mjs` → `content/*.json` + `--check` kapısı — commit `22d1eda`
- ✅ `tools/export-golden-vectors.mjs` → `content/golden/` 5 senaryo / 3.800 vektör — commit `22d1eda`
- ✅ `tools/export-art.mjs` v1 (kanıt) — 78 PNG (yumurta 6×crack0-3 + 5 Pufi × 3 hâl, @2x/@3x)
  + manifest + `--check`; Chromium ile render, yeni bağımlılık yok
- ✅ `tools/export-audio.mjs` v1 (kanıt) — 19 WAV (çekirdek + ritüel dorukları + salla ×2 aile
  + 5 pufiChirp; mono 16-bit 44,1 kHz) + manifest + `--check`; OfflineAudioContext şimi,
  sabit tohumlu PRNG, bağımlılıksız
- ✅ `Yuvo.Core` C# portu — GachaEngine + StateEngine + NUnit katmanı (altın vektörler 5
  senaryo bit-düzeyi bire bir; parite denetimi 4 avcı + çürütücü panel: doğrulanan sapma 0;
  `dotnet test` 26/26) — `client/`, PORT-CONTRACT.md
- ✅ SaveService + migrasyon — SaveValue/JsonCodec (bağımlılıksız), load() portu, çift yuvalı
  zarf, JS load() gerçek çıktılarından 6 altın fikstür + fuzz (`dotnet test` 40/40)
- 🔄 **Migrasyon fikstür kapsam tamamlama** — eleştirmen ajanın bulduğu kapsanmamış load()
  onarım dalları için ek fikstür vakaları ← SIRADAKİ (sonuç bekleniyor)
- ⬜ Unity LTS proje kabuğu — `/client` Unity projesi + assembly bağları (v2·07 §13/1)
  — UNITY KURULU MAKİNE İŞİ (bu ortamda editor yok)
- 🔵 `export-art` tam kapsam: 62 Pufi × (happy/sleep/silüet) + oyuncak parçaları + ambalajlar
  (6 seri × 8 varyant × yırtılma) + kapsül/çevre/UI/portreler. NOT: ~1.300 PNG / 15-30 MB —
  Unity projesi açılırken üretilmesi daha doğru (git şişmesin; gerekirse LFS kararı o gün)
- 🔵 `export-audio` tam kapsam: tüm SOUNDS + 62 pufiChirp (Unity açılışında, export-art tam
  kapsamla birlikte)
- 🔵 Test iyileştirme notları (parite denetimi önerileri, düşük öncelik): Sim B tamamlama
  medyanı (çoklu-seed), Sim C zorlaEksik bağımsız invaryantı, vitrin-boşken no-egg savunma
  üçlüsü, RITUAL UI sabitleri (ISIRIK/SERIT) içerik aserti

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
