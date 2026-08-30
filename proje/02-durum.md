# 02 · Durum — Kaldığımız Yer

> **Yaşayan dosya.** Her iş bloğunun sonunda güncellenir; oturuma dönünce İLK bu okunur.

**Son güncelleme:** 2026-08-30 · oturum O-12 · dal `claude/surprise-egg-collection-game-eycqiq` · son iş: **Unity kurulumu TAMAMLANDI** (duman testi 9/9, çekirdek Unity'de doğrulandı)

## Tek paragraf özet

HTML5 prototip **özellik-tamamlanmış ve yayın öncesi cilalanmış** durumda: tam oyun döngüsü
(FTUE → ritüel → albüm → oturum döngüsü → gün kapanışı), 2 biyom / 62 Pufi, ebeveyn DEMO
mağazası, araştırma temelli psikolojik kancaların tamamı (P1-P6) uygulanmış; motor testi
tümü yeşil + duman testi 55 adım sıfır konsol hatasıyla geçiyor. Unity taşıma planı yazıldı
(`docs/v2/07`); U0 ihraç boru hatlarının dördü de tamam (içerik/altın vektör/sanat/ses).
**Unity çekirdeği `Yuvo.Core` bitti**: gacha+state portu (3.800 açılış bit-düzeyi altın vektör
paritesi) + SaveService/kalıcılık (11 altın migrasyon fikstürü) + kültür bağımsızlığı —
`dotnet test` 50/50. Şu an Unity kabuğu KULLANICIDA (talimat: `proje/07`).

## Sıradaki adım (buradan devam et)

➡️ **U1 — İçerik boru hattı + ilk ekranlar** (v2·07 §10). Unity kurulumu bitti; çekirdek
Unity içinde çalıştığı KANITLANDI (duman testi 9/9, O-12).

**Önce kullanıcıda (küçük):** proje ayarları (Player ▸ Portrait, Linear renk uzayı, Game
penceresi 390×844) ve `client/UnityProject`'in commit+push edilmesi — proje depoya girmeden
bu taraftan Unity kodu yazılamaz (`proje/07` adım 7-8).

**Sonra bu tarafta (U1 sırası):**
1. **İçerik yükleyici:** `content/*.json` → StreamingAssets kopyalama adımı + `GameContent`
   doldurucu (test tarafındaki `Fixtures.LoadContent` mantığının Unity karşılığı; Core JSON
   okumaz kuralı korunur — yükleme `Yuvo.Data` katmanında).
2. **Sanat/ses varlıkları:** `export-art`/`export-audio` tam kapsam koşulur, atlas + ses
   klasörleri Unity'ye alınır.
3. **Ekranlar:** Home → Ceremony → Assembly → Album (tek biyom), hedef prototipteki
   22 adımlık ritüel paritesi.

## Ne bitti (kanıtlarıyla)

| İş | Kanıt |
|---|---|
| v1 kılavuz (11 bölüm) + v2 derin araştırma (8 bölüm) | `docs/`, `docs/v2/` |
| Prototip: tam döngü + 2 biyom + ritüel + ebeveyn paneli + cila (P1-P6) | `prototype/`; commit `d3e5d51`→`b40509f` |
| Testler: motor (statik+simülasyon+migrasyon+P3) ve duman (55 adım) | `tools/proto-engine-test.mjs`, `tools/proto-smoke.mjs` — ikisi de yeşil |
| Yayın öncesi araştırma (3 paralel ajan) yazıya döküldü | `docs/v2/08-yayin-oncesi-arastirma.md` |
| Unity taşıma planı | `docs/v2/07-unity-tasima-plani.md` |
| U0: içerik ihracı + altın vektörler (`--check` CI kapılarıyla) | `tools/export-content.mjs`, `tools/export-golden-vectors.mjs`, `content/` |
| U0: sanat ihracı v1 kanıtı — 78 PNG + manifest (Chromium render, bağımlılıksız) | `tools/export-art.mjs`, `content/art/` |
| U0: ses ihracı v1 kanıtı — 19 WAV + manifest (OfflineAudioContext şimi, 5 benzersiz cıvıltı) | `tools/export-audio.mjs`, `content/audio/` |
| U1 çekirdeği: Yuvo.Core C# portu — GachaEngine + StateEngine + NUnit (altın vektörler 3.800 açılış bit-düzeyi bire bir; parite denetimi: GachaEngine 0 bulgu, doğrulanan sapma yok) | `client/` — `dotnet test client/Yuvo.Core.Tests` → 50/50 |
| U1 çekirdeği: SaveService — bağımlılıksız JSON codec, load() migrasyon portu, çift yuvalı zarf; JS load() gerçek çıktılarından 11 altın fikstür + 200 girdilik fuzz | `client/Yuvo.Core/Save*.cs`, `tools/export-migration-fixtures.mjs`, `content/golden/migration/` |
| U1 köprüsü: Unity paketleme (UPM manifesti + asmdef), derleme çıktısı yönlendirmesi, kültür bağımsızlığı düzeltmesi + 5 regresyon testi, Unity duman testi scripti, kurulum talimatı | `client/Yuvo.Core/package.json`, `*.asmdef`, `client/Directory.Build.props`, `client/unity-smoke/`, `proje/07-…md` |
| U1 köprüsü DOĞRULANDI: Unity 6.3 LTS'te paket derlendi, RNG bit-paritesi + kayıt katmanı Unity içinde geçti | Kullanıcı makinesi, Console: "TÜMÜ GEÇTİ" (9/9) — O-12 |
| Proje yönetim katmanı | `proje/` (bu klasör) |

## Canlı referanslar

- **Oynanabilir prototip (artifact, hep aynı URL):**
  `https://claude.ai/code/artifact/04cdcb1e-4e8b-4edf-9081-7e16ff8114ef`
- **Test komutları:** `node tools/proto-engine-test.mjs` · `node tools/proto-smoke.mjs`
  (önce `node tools/build-proto.mjs`)
- **İhraç güncellik kapıları:** `node tools/export-content.mjs --check` ·
  `node tools/export-golden-vectors.mjs --check` · `node tools/export-art.mjs --check` ·
  `node tools/export-audio.mjs --check` · `node tools/export-migration-fixtures.mjs --check`
- **C# çekirdek testi:** `dotnet test client/Yuvo.Core.Tests` (50 test)
- **Ekran görüntüleri:** `prototype/screenshots/01-18*.png` (duman testi her koşuda tazeler)

## Açık konular / bekleyen kararlar

1. **Park edilenler** (gerekçeleriyle `01-yol-haritasi.md` alt tablosu): hukuk, bölge matrisi,
   mağaza kategorisi, sosyallik, sponsorlu seriler.
2. ~~Unity proje iskeleti nereye~~ → KARAR: aynı repo, `client/UnityProject` (docs/11 §7);
   çekirdek `client/Yuvo.Core` yerel UPM paketi olarak bağlanır (`file:../../Yuvo.Core`).
3. **Bilinen küçük kozmetik pürüz:** yuvada "Sürpriz posta!" çipi tezgâhın arkasına taşabiliyor
   (ekran görüntüsü 15-16'da görünür; işlevsel değil, `03-yapilacaklar.md`'de düşük öncelik).
