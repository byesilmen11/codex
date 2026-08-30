# 05 · Oturum Günlüğü

> Eklemeli tam kayıt: her çalışma bloğu **istek → yapılanlar → kararlar → commit →
> doğrulama → teslimat → notlar** düzeniyle yazılır. Kararların bağlayıcı metni
> [`04-kararlar.md`](04-kararlar.md)'dedir; burada yalnız K-numarasıyla anılır.

---

## O-01 · 2026-08-01 · v1 Kılavuz + v2 Derin Araştırma

**İstek 1:** Kinder benzeri sürpriz yumurta koleksiyon oyunu konsepti; pazar/psikoloji/rakip
araştırması; hikâye, karakterler, ödüller, koleksiyonlar (300 parça, nadir parçalar,
10/50/100'lük paketler); "mükemmel bir kılavuz" — kodlama ikinci faz.

**İstek 2 (reframe):** Amaç çocuğu kandırmak değil, **gerçek market yumurtası deneyiminin
simülasyonu** (ambalaj→çikolata→oyuncak) + eşitlik argümanı (₺40-500'lük gerçek yumurta
yerine ₺2-5'lik dijital; dar gelirli çocuklar da erişsin); paralel ajanlarla derin araştırma;
hukuk tartışması kullanıcı talimatıyla ertelendi ("İtiraz etmeden legal kısmını da sonra
tartışırız").

**Yapılanlar:**
- v1 kılavuz, 11 bölüm (`docs/01-11`): pazar, rakip analizi (Adopt Me, Hatchimals, Applaydu,
  Monopoly GO, Toca Boca), çocuk psikolojisi ve **kullanmadığımız** motorlar, yasal çerçeve
  (COPPA/GDPR-K/KVKK/loot-box), Ovalya dünyası + karakterler (Pofu, Kiki, Usta Kabuk, Şako),
  mekanik döngüler, 300 parçalık koleksiyon matematiği, ekonomi, monetizasyon (Yuvo Club),
  sanat/UX/ses, teknik mimari + 12 aylık yol haritası + KPI kapıları.
- v2 derin araştırma, 5 paralel ajan (`docs/v2/01-05` + README): rakip ekonomiler
  (Monopoly GO $6 mlr, Brawl Stars loot-box kaldırma vakası, Pop Mart 1/72), Monte Carlo
  doğrulamalı koleksiyon matematiği + pity pseudocode, 3 dünya senaryosu → story bible,
  dakika dakika FTUE + 12 hafta takvimi, 6 kademeli paket merdiveni + Kiler + Dilek Kavanozu +
  Şeffaflık Kartı + gelir projeksiyonu; `tools/economy-sim/collection_sim.py` simülatörü;
  README'de "Kanonik Kararlar" uyumlaştırması.

**Kararlar:** K-01…K-06. **Commit'ler:** `b1a5087`, `51a9da2`.
**Doğrulama:** Monte Carlo — medyan tamamlama 70-80 gün bandında; Panini 7,1× israfa karşı Yuvo 1,35×.
**Teslimat:** kılavuz dosyaları + Türkçe özet raporlar.

---

## O-02 · 2026-08-28 · Prototip Dikey Dilim

**İstek (3-5):** Masaüstüne indirme/klasör soruları (oturum lojistiği); ardından "sıradaki
adımdan devam edelim: prototip fazı — çıtlatma töreni + Güneş Çayırı ailesi + albüm
çekirdeğiyle dikey dilim… oyunu mobil için yapacağız ilk başta değil mi?" → mobil portre onayı.

**Yapılanlar:**
- `prototype/ARCHITECTURE.md` bağlayıcı mimari sözleşme; iskelet (index.html, router/HUD/nav/
  modal/toast, build betiği `tools/build-proto.mjs` → dist/index.html + dist/artifact.html).
- Dikey dilim: `ceremony` (5 aşamalı tören), `assembly` (3 parça sürükle-bırak, mıknatıs+snap),
  `home` (yuva, gezinen Pufiler, gün sonu), `album` (30+1 hücre, kilometre taşları, Atölye/craft),
  `minigame` (Eşle & Bul, ödül tavanlı), 31 Pufi verisi + prosedürel SVG sanat (`pufi-svg.js`) +
  WebAudio sentez sesler (`audio.js`), gacha motoru (mulberry32, pity 15/40/50, onboarding,
  akıllı düşüş), state + localStorage kalıcılık.
- Test altyapısı: `tools/proto-engine-test.mjs` (sandbox eval + 5.000'lik simülasyon) ve
  `tools/proto-smoke.mjs` (playwright-core, headless Chromium, 390×844, ekran görüntüleri,
  sıfır konsol hatası şartı).
- Artifact ilk yayın: `https://claude.ai/code/artifact/04cdcb1e-4e8b-4edf-9081-7e16ff8114ef`.

**Kararlar:** K-08, K-09. **Commit'ler:** `2eb95d5`, `d3e5d51`.
**Doğrulama:** iki test paketi yeşil. **Teslimat:** artifact + ekran görüntüleri.

---

## O-03 · 2026-08-28→29 · Marka Sürümü + Ritüel Tasarımı

**İstek (6):** "grafikleri ve tasarım iyi değil. çok daha iyi tasarım ve grafikler yap.
arayüz dahil. **tam bir marka gibi olsun**."

**Yapılanlar:**
- Google Fonts entegrasyonu (Baloo 2 + Nunito, tam fallback yığını) + sanat dosya düzeni.
- `prototype/BRAND.md` marka kitabı: sticker reçetesi (beyaz hale + koyu kontur + şeker
  paleti), logo, ikon dili, yuva atmosferi kuralları ("boş bant yasak").
- `ui-icons.js` (Yuvo.icons — logo + ikon seti), HUD/nav yeniden çizimi, 31 karakterin
  tamamının final "vinil oyuncak" çizimi (`pufi-kinds-1..3.js`), çevre sanatı (`env.js`).
- Paralelde ritüel tasarım dokümanı `docs/v2/06` yazıldı (İstek 7'nin spec'i — aşağıda).
- Oturum kesintileri yaşandı ("Try again" ×2, "Uygulama kapandı. kaldığın yerden devam et.");
  ara güvenlik commit'i (`aa63ff4`) sayesinde kayıpsız devam edildi.

**Kararlar:** K-10. **Commit'ler:** `8d82f1e`, `aa63ff4`, `a9616f3`, `1e8fb8d`.
**Doğrulama:** testler yeşil; görsel gözden geçirme ekran görüntüleriyle.
**Ders:** uzun işlerde ara commit ("güvenlik anlık görüntüsü") kesinti maliyetini sıfırlıyor —
bu ders `proje/README.md` oturum ritüelinin gerekçelerinden.

---

## O-04 · 2026-08-29 · Gerçek Yumurta Ritüeli + Tam Oyun Döngüsü

**İstek (7):** Gerçek yumurta ritüeli spec'i: önce folyo ambalaj ("üstüne isim; marka
isimlerini alıp reklam bile alabiliriz — almayı düşünüyoruz"), çikolata ("hop diye yiyecek"),
kapsülün çeşitli açılışları ("çekiçle kırma olsun, elle açma olsun"), birleştirme daha
profesyonel; seçim aşaması cezbedici; "gerçek hayattaki simülasyonu gibi olsun".
**İstek (11-12):** "bitti mi" → durum raporu; "**devam et. her şeyi bitir.**"

**Yapılanlar (ritüel — commit `c62a687`):**
- 6 aşamalı ritüel: vitrin (ambalajlı yumurtalar, eline al / 400ms basılı tut = salla-dinle) →
  folyo yırtma (3 şerit, kulakçık) → çikolata (Ye! +2⭐ tavan 40 / Biriktir → Kumbara, 15'te
  Çikolata Şöleni = +1 yumurta) → **Tomurcuk Kapsülü** (4 açma aracı: burgu/çekiç/fırlat/sihir —
  saf kozmetik) → birleştirme → **Ambalaj Defteri** (`foilbook.js`: 6 seri × 8 varyant pul
  koleksiyonu + Altın Şeref Yuvası).
- Altın Folyo katmanı (%2 + hard 40); `wrappers.js` (6 seri, RITUAL sabitleri); dürüstlük
  sözleşmesi §1.3 motora işlendi (nadirlik açılışta çekilir; `makeEgg` golden:null).
- v1→v2 kayıt migrasyonu; testlere ritüel bölümleri.

**Yapılanlar (tam döngü — commit `c3e722a`):**
- FTUE/intro (`intro.js`): karanlık→yıldız→ısıtma; Luna gün batımı ritüeli (`playDusk`).
- Diyalog sistemi (`ui-dialog.js` + `dialogue.js` replik havuzları; anlatıcı/Kiki/Luna/
  Usta Kabuk/Şako).
- Ebeveyn paneli (`parent.js` + `store.js`): PIN kapısı (3 deneme → 30 sn kilit), DEMO mağaza
  (6 paket + Club + Şeffaflık Kartı), aylık limit + 24 sa soğuma, **Kiler** (günde ≤5 çekim),
  **Dilek Kavanozu** (7 gün / 5 dilek / fiyatsız), harcama raporu.
- İkinci biyom **Fısıltı Ormanı**: 31 orman Pufi'si (`pufis-forest.js`, `pufi-kinds-4..6.js`),
  kilit Çayır 10/30, biyom-filtreli havuz, ortak pity, per-biyom gizli; **Şako Saklambaç**
  (`sako.js`) — saklanan parça yok olmaz, geri kazanılır.
- v3 migrasyon + motor API'leri (buyPack/drawFromKiler/addWish/…); duman testi 3 bölüm / 43 adıma çıktı.

**Kararlar:** K-07, K-11, K-12, K-15. **Doğrulama:** motor + duman (43 adım) yeşil.
**Teslimat:** artifact republish + 8 ekran görüntüsü + Türkçe rapor.
**Notlar/dersler:** modal butonları `#overlay-root`'ta yaşadığından sahne click-delegasyonuna
düşmez → `getElementById` dinleyici deseni; PIN kapısı 4. hanede otomatik onaylıyor →
testlerde "ok'a yalnız kapı hâlâ açıksa bas".

---

## O-05 · 2026-08-29→30 · Yayın Öncesi Cila + Unity Köprüsü

**İstek (13 — büyük):** "sıradaki adımları sen yap. **tüm testleri yap**" + oyun geliştiricisi
gözüyle denetim: hedef yaş grubunun merakını yakalamak ("çocuk sürpriz yumurtayı HEMEN açmak
ister, çikolatasını belki yemez, sadece içindeki oyuncağı merak eder"); ilk sayfa tasarımından
yumurta seçimine, sosyalleşmeye, ödül/koleksiyon zorluğuna ve özellikle ücretsiz haklar bitince
**satın aldırma psikolojisine** kadar her şeyi gözden geçir; çok indirilen basit çocuk
oyunlarının indirme/tutundurma/başında-tutma psikolojisini araştır; "**bu psikolojik klikleri
biz de kullanalım… onları yapalım yayına çıkmadan**".
**İstek (14):** "çıkar" (Unity taşıma planını üret). **İstek (15):** "yap" (U0 araçlarını yaz).

**Yapılanlar (araştırma):**
- 3 paralel web araştırma ajanı: (1) çocuk oyunları indirme/tutundurma psikolojisi,
  (2) unboxing/gacha reveal sahnelemesi, (3) monetizasyon etiği + emsaller. Bulgular +
  geliştirici teşhisi + bulgu→özellik izlenebilirlik tablosu `docs/v2/08`'e yazıldı (O-06'da).
  Not: bazı alan adları ağ politikasında engelli çıktı; o bulgular arama özetlerinden geldi.

**Yapılanlar (P0-P6 uygulaması — commit `b40509f`):**
- **P1 Reveal:** POP öncesi 420 ms hush (sessizlik+vinyet+zoom); nadirliğe dallanan kutlama
  (900/1300/2200/2600 ms); "◆ NADİR!" splash rozeti; tier≥2'de Kiki balonu; kart flip +
  dönen huzme + seri numarası satırı ("Güneş Çayırı · 7/30"); **pufiChirp** — her Pufi'ye
  FNV-1a id-hash imzalı özgün cıvıltı; salla = olabilirlik karuseli (eksik dostlardan 3
  dürüst silüet).
- **P2 Albüm:** soundboard (sahipli hücre → zıplama + kendi cıvıltısı); "🎯 Hedefim Bu!"
  hedef parça (yuvada çip; bulununca kutlama); son-3 ışıltısı; kilitli **Altın Yumurta**
  ödül teaser'ı (baskı dili yok).
- **P3 Oturum döngüsü:** kuluçka yumurtası (Şako gece uçuşu bırakır → sabah İLK sırada
  "☀️ Hazır!", tavana sayılmaz); haklar birikir (kalan+3, tavan 9); günlük görev zinciri
  (🥚3·🎮1·📔 → 🎁 +1, bir kez); Bekçi Takvimi (cezasız 7 yıldız → +25 Kabuk + rozet);
  kapanış ritüeli (Bugünün Dostları + yarının seri silueti, SAYAÇSIZ).
- **P4 İlk 60 saniye:** intro hızlandırma (yıldız serpintisi + kuyruk + yıldıza yüz; balonlar
  otomatik akar; hedef ≤25 sn); yuva canlılığı (periyodik hop+parıltı, ilk oturum el ipucu,
  Pufi selam balonları); 180 ms sahne geçiş fade'i (senkron mount korunarak).
- **P5 Ebeveyn güveni:** Dilek Kartı+ ("N gündür kavanozda" + "ücretsiz yumurtalarla ~X günde
  gelebilir" + Şimdi değil / 🎂 doğum günü notu); satın almada yayılım önizlemesi; güven şeridi
  (Reklam yok · Fiyat yok · Oranlar açık · Kalıcı); **geri sayımsız Hoş Geldin Sepeti**
  (₺14,99, tek seferlik); yıl toplamı KPI'ı; kilerden çekim = kargo balonu animasyonu.
- **P6:** Çıt Çıt Köşesi (ödülsüz sonsuz kabuk çıtlatma — testle "⭐ dağıtmıyor" doğrulanır).
- Testler: motor testine P3 bölümü (birikim tavanı, kuluçka, görev zinciri, cezasız streak,
  Hoş Geldin); duman 43→**55 adım** (görev çipleri, kapanış ritüeli, Şako uçuşu, kuluçka
  sabahı, NADİR splash + seri satırı, Çıt Çıt, güven şeridi/baskı-dili denetimleri).

**Yapılanlar (Unity planı — commit `3192049`):** `docs/v2/07` — bkz. K-16; v2 README indeksine satır.

**Yapılanlar (U0 araçları — commit `22d1eda`):** `export-content.mjs` → `content/*.json`
(6 dosya; ritual.json'da tüm sabitler) ve `export-golden-vectors.mjs` → `content/golden/`
(5 senaryo / 3.800 vektör; determinizm çift koşumla kanıtlı; pity tavanları koşumda denetli;
akıl sağlığı: 3. açılış Nadir+, ilk 10 hep yeni, altın 32/1000, orman 0 yabancı, ilk gizli
30/30 sonrası). Her ikisi `--check` CI kapılı.

**Kararlar:** K-13, K-14, K-16, K-17. **Doğrulama:** motor tümü yeşil; duman 55 adım sıfır
konsol hatası; artifact republish; 6+1 ekran görüntüsü + plan dosyası kullanıcıya gönderildi.
**Notlar/dersler:** (a) JS `/i` bayrağı Türkçe ı/İ katlamaz → testlerde `/satılmaz|SATILMAZ/`
gibi açık alternatifler; (b) test regex'i kendi baskı-KARŞITI metnimizi ("geri sayımı yok")
yakaladı → denetimler pozitif güvence cümlesi + gerçek baskı kalıpları olarak ayrıldı;
(c) sonsuz animasyonlu öğeye playwright tıklaması `{force:true}` ister; (d) tam ekran
sahnelerde alt nav görünmez → testte `Yuvo.go` kancası.

---

## O-06 · 2026-08-30 · Proje Yönetim Katmanı (bu oturum)

**İstek (16):** Cloud projelerindeki düzen buraya da kurulsun: klasör yapısı + planlama/takip
dosyaları (ne yapacağız/nasıl/ne zaman; ne yapıldı/ne yapılacak), karar ve iş kayıtları —
"**bir işin düzeni onu yapmaktan daha önemli**"; bu oturumdaki TÜM kontekst (özet değil,
içerikten) kaydedilsin; bundan sonra her kontekst dolmadan kayıt bitirilip sonraki kontekstte
kaldığımız yerden devam edilsin.

**Yapılanlar:**
- `proje/` katmanı kuruldu: README (sistem + oturum ritüeli), 01-yol-haritasi, 02-durum,
  03-yapilacaklar, 04-kararlar (K-01…K-19), 05-oturum-gunlugu (bu dosya — O-01'den bugüne
  tam geçmiş), 06-dosya-haritasi.
- Kaydedilmemiş araştırma yazıya döküldü: `docs/v2/08-yayin-oncesi-arastirma.md` (3 ajan
  bulguları + geliştirici teşhisi + bulgu→özellik izlenebilirliği + mağaza sayfası notları).
- Kök `README.md` güncellendi (prototip/proje/content bölümleri + v2·06-08 satırları);
  `docs/v2/README.md` indeksine 08 eklendi.

**Kararlar:** K-18. **Commit:** `ecbe560`.

**Devamı (aynı oturum, "kaldığımız yerden"):** `tools/export-art.mjs` v1 yazıldı — sanat
ihracı boru hattı KANITI: 78 PNG (yumurta 6 nadirlik × crack 0-3 + 5 örnek Pufi ×
happy/sleep/silüet, @2x/@3x) + `content/art/manifest.json` (boyut+sha256) + `--check`
(manifest↔disk doğrular, yeniden render etmez — PNG baytları Chromium sürümüne bağlı olduğu
için bilinçli karar). Yeni bağımlılık YOK: render playwright-core + kurulu Chromium'la
(duman testiyle aynı ikili), şeffaf arka plan. Örnek çıktılar gözle doğrulandı (sticker
dili, aura, crack çizgisi korunuyor). Tam kapsam (~1.300 PNG) bilinçli olarak Unity projesi
açılışına bırakıldı (git şişmesin — `03-yapilacaklar.md` notu).
**Doğrulama:** üretim + `--check` yeşil; 78/78 manifest tutarlı.
**Sıradaki:** `02-durum.md` → `tools/export-audio.mjs` v1 (Chromium içinde
OfflineAudioContext yolu önerildi).

---

## O-07 · 2026-08-30 · Ses İhracı v1 (U0 boru hatları tamam)

**İstek:** "uygulama kapandı. devam ettiğin bir işlemin yarım kaldıysa devam et."

**Yapılanlar:**
- Durum kontrolü: çalışma ağacı temiz, dal origin ile senkron, son commit `aebe62a` —
  yarım iş YOK (oturum ritüeli ilk gerçek kesintisinde işini yaptı). `02-durum.md`'deki
  sıradaki adımdan devam edildi.
- `tools/export-audio.mjs` v1: 19 WAV (çekirdek sesler + ritüel dorukları — foilTear/bite/
  capsulePop/goldenFanfare — + shakeRattle çayır/orman + 5 örnek pufiChirp; mono 16-bit
  44,1 kHz) + `content/audio/manifest.json` + `--check`.
- Yöntem: `audio.js` kaynağı DEĞİŞMEDEN Chromium'da değerlendirildi; `window.AudioContext`
  → OfflineAudioContext şimi (state/resume yamalı), her ses taze bağlamda render;
  Math.random render başına sabit tohumlu mulberry32.

**Doğrulama:** 19/19 sessiz-değil (peak eşiği); 5 cıvıltının 5'i benzersiz imza (id-hash
çalışıyor); çift koşum: 17/19 bit-özdeş — yalnız en uzun iki graf (fanfareBig,
goldenFanfare) son-bit kayan nokta oynaması gösterdi (peak/boyut aynı, duyulmaz) →
araç yorumu dürüstçe güncellendi; `--check` bu yüzden manifest↔disk doğrular (yeniden
render etmez — export-art ile aynı bilinçli karar).

**Kayıt:** U0 ihraç boru hatlarının dördü de tamam (content / golden / art / audio).
**Sıradaki:** `02-durum.md` → Unity proje iskeleti + `Yuvo.Core` C# portu (önce Unity'siz
`dotnet test` ile koşan NUnit yolu önerildi).

---

## O-08 · 2026-08-30 · Yuvo.Core C# Portu (U1 çekirdeği — dotnet test yolu)

**İstek:** "devam" (+ ultracode modu: her önemli iş workflow'la, çekişmeli doğrulamayla).

**Yapılanlar:**
- Ortam kapıları: dotnet-sdk-8.0 apt'ten kuruldu (8.0.130); NuGet proxy'den erişilebilir doğrulandı.
- `client/` iskeleti ELLE kuruldu (ajanlara ortak zemin): Yuvo.Core (netstandard2.1,
  UnityEngine'siz) + Yuvo.Core.Tests (net8.0/NUnit) csproj'ları, `GameState.cs` (state.js
  defaults şeması), `GameContent.cs` (içerik modeli; Core JSON okumaz), `Rng.cs` (mulberry32 —
  bit düzeyi eşleme notlarıyla), `PORT-CONTRACT.md` (BAĞLAYICI: API imzaları, JS→C# anlam
  kuralları, rand tüketim sırası, test kapsamı).
- **Workflow 1 (port, 4 paralel ajan):** `StateEngine.cs` (state.js API'lerinin tamamı),
  `GachaEngine.cs` (openEgg birebir), `Fixtures.cs`+`GoldenVectorTests.cs` (content yükleyici +
  5 senaryo), `ContentTests.cs`+`BehaviorTests.cs` (proto-engine-test çevirisi).
  Doğrulama: `dotnet test` → **25/25** (5 altın senaryo / 3.800 açılış BİT DÜZEYİNDE bire bir
  + 13 davranış + 7 içerik).
- **Workflow 2 (parite denetimi, 4 avcı + bulgu başına 2 çürütücü, 20 ajan):**
  GachaEngine → SIFIR bulgu. Doğrulanan davranışsal sapma YOK; tüm yüksek/orta bulgular
  "test-kapsamı önerisi, sapma değil" gerekçesiyle çürütüldü. Düşük-önem sadakat notları
  ve değerli test önerileri UYGULANDI:
  * `Round2` NaN/∞ koruması (JS `Number(n)||0` paritesi — SetLimit(NaN) kapıyı ters
    etkisizleştirebilirdi), `Craft` null-rarity koruması (JS fırlatmaz), `Version=2`
    (JS defaults birebir; 3'ü migrasyon damgalar).
  * 5.000'lik pity testi ÇIKTIDAN ölçer hale getirildi (döngüsellik giderildi: boşluklar
    res.Rarity dizisinden ≤14/39/49) + gizli kapısı sayacı + altın folyo pity/oran +
    wrapper bütünlüğü + Ambalaj Defteri muhasebesi (5.000 pul) asertleri eklendi.
  * `BuildSpendReport` çıktı asertleri, dilek budamasının SEÇİCİLİĞİ (taze kalır/eski düşer),
    yeni `ForceGoldenNextVeSetTool` testi.
- Not: 2 çürütücü ajan API güvenlik filtresine takıldı (workflow bunları null sayıp devam
  etti); ilgili bulguyu (spendReport kapsamı) kendim hakem olarak değerlendirip uyguladım.

**Doğrulama:** `dotnet test` → **26/26**; prototip motor testi + içerik/vektör `--check`
kapıları değişmeden yeşil.
**Commit'ler:** `cfad742` (iskelet+sözleşme), `52cfd82` (port 25/25), + bu kapanış commit'i.
**Sıradaki:** SaveService (atomik JSON + çift yuva + migrasyon fuzz — saf C#, burada test
edilebilir); Unity kabuğu (`/client` Unity projesi) Unity kurulu makine işi olarak notlandı.

---

## O-09 · 2026-08-30 · SaveService: Kalıcılık + Migrasyon (altın fikstür felsefesiyle)

**İstek:** "devam" (ultracode sürüyor).

**Yapılanlar:**
- PORT-CONTRACT.md'ye **EK: SaveService sözleşmesi** yazıldı (SaveValue/JsonCodec API'si,
  SaveCodec serileştirme şekil kuralları, load() portunun rastgelelik tüketim hizalaması,
  ISaveStore + çift yuvalı zarf, altın migrasyon fikstür şeması, test kapsamı) — commit `f8b12bc`.
- **Workflow (4 paralel ajan):**
  * `SaveValue.cs` — bağımlılıksız mini JSON modeli + JsonCodec (tam gramer, hatada null,
    derinlik 512, JSON.stringify uyumlu yazım; Core'a dış bağımlılık girmedi).
  * `SaveCodec.cs` — GameState→JSON (defaults() anahtar sırası birebir) + `load()` migrasyon
    portu (bilinen-anahtar birleştirme + tüm tip onarımları; v1 fillTodayEggs rastgelelik
    hizalaması ölçülerek doğrulandı: boş depo 7, v1 n=2→6, v2→4 çağrı).
  * `SaveService.cs` — çift yuva + zarf (sira + FNV-1a sum); hedef yuva depodan taze taranır;
    sum, kayit'in yeniden-yazımı üzerinden; hiçbir yol fırlatmaz.
  * `tools/export-migration-fixtures.mjs` — **migrasyona altın vektör felsefesi**: JS load()
    GERÇEK çıktıları fikstür oldu (sabit Date=2026-01-15 + tohumlu Math.random=42 stub'ları,
    çift koşum determinizm kanıtı, --check kapısı) → `content/golden/migration/` 6 vaka.
  * `SaveTests.cs` — 6 MigrationGolden + RoundTrip + 6 yuva senaryosu + 200 girdilik fuzz.
- Bütünleştirme İLK denemede geçti: **dotnet test 40/40** (26 + 14 yeni); migrasyon fikstür
  --check ve prototip motor testi yeşil. Commit `c5e1622`.
- Kapsam eleştirmeni (tek ajan): load() onarım dallarının 6 fikstürce kapsam haritası —
  eksik dallar için yeni fikstür vakaları önerilecek; sonucu bu oturumda işlenir.

**Sıradaki:** eleştirmen bulgularıyla fikstür kapsamını tamamla; sonra `02-durum.md` →
Unity kabuğu (Unity kurulu makine işi) / U0 kapanışı.
