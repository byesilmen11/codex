# 06 · Dosya Haritası — Depoda Ne Nerede?

> Yeni dosya eklenince buraya satırı da eklenir (oturum ritüeli, adım 3).
> Üst düzey düzen `docs/11 §7` depo yapısı önerisini izler; Unity fazında `/client`
> (Unity projesi) ve ileride `/server` eklenecek.

```
/README.md          ← projenin vitrin sayfası (özet, içindekiler, etik manifesto, künye)
/proje/             ← PROJE YÖNETİM KATMANI (hafıza) — bkz. proje/README.md
/docs/              ← v1 kılavuz (11 bölüm)
/docs/v2/           ← v2 derin araştırma + tasarım (8 bölüm + indeks)
/prototype/         ← HTML5 prototip = oynanabilir spesifikasyon
/content/           ← Unity için ihraç edilen içerik JSON'ları + altın vektörler (ÜRETİLİR, elle düzenlenmez)
/tools/             ← build, test ve ihraç araçları (node) + ekonomi simülatörü (python)
```

## docs/ — v1 kılavuz (2026-08-01)

| Dosya | İçerik |
|---|---|
| `01-pazar-arastirmasi.md` | Pazar büyüklüğü, unboxing ekonomisi trendleri |
| `02-rakip-analizi.md` | Adopt Me, Hatchimals, Applaydu, Monopoly GO, Toca Boca; pazar boşluğu |
| `03-cocuk-psikolojisi-ve-motivasyon.md` | Kullanılan ve BİLİNÇLİ kullanılmayan psikolojik motorlar |
| `04-yasal-cerceve-ve-uyum.md` | COPPA, GDPR-K, KVKK, loot-box yasaları, mağaza politikaları |
| `05-oyun-vizyonu-dunya-hikaye.md` | Ovalya, karakterler, sezon hikâyesi |
| `06-oyun-mekanikleri-ve-donguler.md` | Çekirdek döngü, tören, birleştirme, mini oyunlar |
| `07-koleksiyon-sistemi.md` | 300 parçalık albüm, nadirlik, pity, Atölye |
| `08-ekonomi-ve-odul-sistemi.md` | Para birimleri, kaynak/gider, ödül takvimi |
| `09-monetizasyon-modeli.md` | Yuvo Club, deterministik paketler, ebeveyn paneli (v1 hali) |
| `10-sanat-ux-ses.md` | Görsel dil, çocuk UX kuralları, ses tasarımı |
| `11-teknik-mimari-ve-yol-haritasi.md` | Motor seçimi, mimari ilkeler, ekip, 12 aylık plan, KPI, depo yapısı |

## docs/v2/ — derin araştırma + tasarım

| Dosya | İçerik |
|---|---|
| `README.md` | v2 indeksi + KANONİK KARARLAR (çelişki çözümleri) + açık konular |
| `01-rakip-ekonomiler.md` | Emsal ekonomiler, 15 kesişen tasarım deseni |
| `02-koleksiyon-sistemi-ve-algoritma.md` | Kanonik oranlar/pity + Monte Carlo + 31'lik aile listesi |
| `03-hikaye-ve-karakterler.md` | Story bible, replikler, sezon tohumları |
| `04-oyun-akisi-ve-zorluk.md` | FTUE, 7 gün / 12 hafta planı, DDA, Altın Yumurta storyboard'u |
| `05-magaza-ve-yumurta-paketleri.md` | Paket merdiveni, Kiler, Dilek Kavanozu, limit UX, projeksiyon |
| `06-gercek-yumurta-ritueli.md` | 6 aşamalı ritüel, Altın Folyo, dürüstlük sözleşmesi §1.3, tempo |
| `07-unity-tasima-plani.md` | Prototip→Unity: portlar, altın vektörler, boru hatları, U0-U3 |
| `08-yayin-oncesi-arastirma.md` | Yayın öncesi 3 ajan araştırması + teşhis + bulgu→özellik izlenebilirliği |

## prototype/ — HTML5 prototip

| Dosya | Rol |
|---|---|
| `ARCHITECTURE.md` | BAĞLAYICI mimari sözleşme (isim alanı, sahne API'si, motor API'leri, test kancaları) |
| `BRAND.md` | BAĞLAYICI marka kitabı (sticker reçetesi, renkler, tipografi, ikon dili) |
| `index.html` | Kabuk + script yükleme sırası (data → art → audio → engine → sahneler → main) |
| `css/style.css` | Temel/marka stilleri (iskelet) |
| `css/scenes-core.css` | Tören + birleştirme stilleri |
| `css/scenes-meta.css` | Yuva + albüm + mini oyun + defter stilleri |
| `css/parent.css` | Ebeveyn paneli stilleri |
| `css/story.css` | En son yüklenen katman: diyalog/intro/dusk/Şako/biyom + P1-P6 cila stilleri |
| `js/main.js` | Router (Yuvo.go + fade), HUD, nav, modal, toast, refresh |
| `js/ui-dialog.js` | Konuşma balonu kuyruğu (`say/clear`, `sure` otomatik akış) |
| `js/ui-icons.js` | Yuvo.icons — logo + ikon seti |
| `js/data/pufis.js` | RARITIES + Çayır 31 Pufi |
| `js/data/pufis-forest.js` | Orman 31 Pufi + BIOMES + biome damgalama |
| `js/data/wrappers.js` | Ambalaj serileri (6), varyantlar, RITUAL sabitleri, araçlar |
| `js/data/store.js` | PACKS (6+Hoş Geldin), CLUB, ODDS, STORE_LIMITS, DEMO uyarısı |
| `js/data/dialogue.js` | DIALOG replik havuzları + pufiSelam |
| `js/engine/state.js` | State + kalıcılık + migrasyon + ekonomi/ritüel/oturum-döngüsü/mağaza API'leri |
| `js/engine/gacha.js` | openEgg: pity, akıllı düşüş, onboarding, biyom havuzu, Altın Folyo, görev sayacı |
| `js/art/pufi-svg.js` | Çekirdek sanat: eggSVG (crack 0-3), pufiSVG, silüet, oyuncak parçaları |
| `js/art/pufi-kinds-1..6.js` | 62 karakterin çizim kayıtları (1-3 çayır, 4-6 orman) |
| `js/art/env.js` | Çevre sanatı (gök/bulut/çayır katmanları) |
| `js/art/ritual-svg.js` | Ritüel sanatı (folyo, çikolata, kapsül, araçlar) |
| `js/art/story-svg.js` | Hikâye portreleri (Pofu, Kiki, Luna, Usta Kabuk, Şako) |
| `js/audio.js` | WebAudio sentez ses sözlüğü + pufiChirp (id-hash imzalı cıvıltı) |
| `js/scenes/home.js` | Yuva: vitrin/jestler, görev çipleri, hedef çipi, kuluçka, kapanış ritüeli, Şako uçuşu, kargo balonu |
| `js/scenes/ceremony.js` | Tören: folyo→çikolata→kapsül; hush, nadirlik splash, kart |
| `js/scenes/assembly.js` | Oyuncak birleştirme (sürükle-bırak) |
| `js/scenes/album.js` | Albüm: biyom sekmeleri, soundboard, Hedefim Bu!, Altın Yumurta teaser, Atölye |
| `js/scenes/foilbook.js` | Ambalaj Defteri (pul koleksiyonu) |
| `js/scenes/minigame.js` | Eşle & Bul + Çıt Çıt Köşesi |
| `js/scenes/intro.js` | FTUE açılışı + Luna günbatımı (playDusk) |
| `js/scenes/parent.js` | PIN kapısı + DEMO mağaza + güven kancaları + rapor |
| `js/scenes/sako.js` | Şako Saklambaç mini oyunu |
| `dist/` | Build çıktısı (index.html + artifact.html) — ÜRETİLİR |
| `screenshots/` | Duman testinin ürettiği 01-18 ekran görüntüleri |

## tools/ ve content/

| Dosya | Rol |
|---|---|
| `tools/build-proto.mjs` | Prototipi tek dosyaya derler (dist/) |
| `tools/proto-engine-test.mjs` | Motor testi: statik veri + simülasyon + migrasyon + davranış asertleri |
| `tools/proto-smoke.mjs` | Duman testi: headless Chromium, 55 adım, sıfır konsol hatası, ekran görüntüleri |
| `tools/export-content.mjs` | Prototip verisi → `content/*.json` (`--check` = CI kapısı) |
| `tools/export-golden-vectors.mjs` | Gacha altın vektörleri → `content/golden/` (`--check`) |
| `tools/export-art.mjs` | SVG→PNG sanat ihracı v1 (Chromium render) → `content/art/` (`--check` = manifest↔disk) |
| `tools/economy-sim/collection_sim.py` | Monte Carlo koleksiyon simülatörü (v2·02 eğrileri) |
| `content/*.json` | pufis / rarities / wrappers / dialogue / packs / ritual — Unity'nin okuyacağı tek kaynak |
| `content/golden/*.json` | 5 senaryo × deterministik açılış dizileri (C# port doğrulama fikstürü) |
| `content/art/` | Sanat ihracı: `proof/*.png` (v1 kanıt seti, 78 dosya) + `manifest.json` |
| `package.json` | Node bağımlılıkları (playwright-core vb.) |
