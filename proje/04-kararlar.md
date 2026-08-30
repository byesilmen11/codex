# 04 · Karar Günlüğü

> Bir karar **yalnız burada yazıyorsa alınmış sayılır.** Maddeler silinmez; değişen karar
> yeni maddeyle revize edilir ve eskisine "revize → K-xx" notu düşülür.
> Biçim: numara · tarih · karar · gerekçe · kaynak · nerede uygulandı.

## Kimlik ve vizyon

**K-01 · 2026-08-01 · Proje kimliği.** Ad: **Yuvo — Sürpriz Yumurta Adası**; hedef kitle
çekirdek 4-9 yaş (ikincil 9-12); dünya: Ovalya Adası, Pufi yaratıkları, çocuk = Yumurta
Bekçisi; iOS+Android portre mobil. *Kaynak:* kullanıcı brief'i + v1 araştırma. *Uygulama:* `README.md`, `docs/05`.

**K-02 · 2026-08-01 · Deneyim çekirdeği = gerçek sürpriz yumurta simülasyonu.** Merak →
çıtlatma → sürpriz → birleştirme → koleksiyon; "kumarhane değil oyuncak kutusu" dili.
*Kaynak:* kullanıcı: oyunun amacı market yumurtası deneyimini dijitalde yaşatmak. *Uygulama:* tüm tasarım.

**K-03 · 2026-08-01 · Motor hedefi Unity (C#).** Godot yedek, Flutter red. *Gerekçe:* juice
gücü + tek kod iki platform + işe alım havuzu. *Uygulama:* `docs/11 §1`, `docs/v2/07`.

## Monetizasyon ve etik çerçeve

**K-04 · 2026-08-01 · v2 senaryosu: doğrudan yumurta satışı EKLENDİ; hukuk tartışması
ERTELENDİ.** v1'deki "paralı şans yok" ilkesi, kullanıcının eşitlik argümanıyla
(market yumurtası ₺40-500 → dijital ₺2-5; dar gelirli çocuk da merakını giderebilsin) v2'de
revize edildi: yumurtalar oyunla kazanılır VE ebeveyn panelinden satın alınabilir. Hukuk/
mevzuat değerlendirmesi kullanıcı talimatıyla sonraya park edildi ("İtiraz etmeden legal
kısmını da sonra tartışırız"). *Kaynak:* kullanıcı (2. mesaj). *Uygulama:* `docs/v2/*`.

**K-05 · 2026-08-01 · Emniyet rayları (değişmez).** Çocuk arayüzü fiyat/mağaza GÖRMEZ
(Dilek Kavanozu + "Sürpriz posta!" dili); mağaza ebeveyn-PIN arkasında; aylık limit
(varsayılan ₺400, artırım 24 sa soğumalı); satın alınan yumurta **Kiler**'e düşer (günde ≤5
açılır — binge freni) ve çocuk tarafında sıradan yumurtadan ayırt edilemez; oran tablosu
satın alma öncesi ekranda; **Efsanevi vaat olarak satılmaz**; ara para birimi yok (TL-net);
ters whale alarmı. *Gerekçe:* JAMA 2022, FTC/Epic 520M$ emsalleri + mağaza politikaları;
etik model daha çok kazandırıyor (Toca Boca, Applaydu kanıtı). *Uygulama:* `docs/v2/05`, `parent.js`, `store.js`, motor API'leri.

**K-06 · 2026-08-01 · Kanonik sayılar.** Oranlar %55 / %25 / %14 / %4,6 / %0,9 (+soft pity)
/ Gizli %0,5; pity: Nadir 15 · Destansı 40 · Efsanevi soft 35 / hard 50; onboarding 10 (3.
yumurta Nadir+); kopya serisi eşiği 6; paket merdiveni 6 kademe ₺9,99→₺199,99 (birim ₺9,99→₺2,00);
aile = 30 parça + 1 gizli. Çelişen taslak sayıları geçersiz. *Kaynak:* `docs/v2/README`
"Kanonik Kararlar" + Monte Carlo doğrulaması. *Uygulama:* `pufis.js`, `gacha.js`, `store.js`, `content/*.json`.

**K-07 · 2026-08-29 · DEMO ilkesi.** Prototipte (ve Unity U2 sonuna dek) mağaza tamamen
simülasyondur; her satın alma özetinde "DEMO — gerçek ödeme alınmaz" yazar. Gerçek IAP ancak
U3'te, kidSAFE ön denetiminden sonra bağlanır. *Uygulama:* `parent.js`, `docs/v2/07 §8`.

## Prototip teknik sözleşmesi

**K-08 · 2026-08-28 · Prototip teknolojisi ve mimari.** Saf vanilla JS + CSS + inline SVG;
ES module YOK, her dosya IIFE + `window.Yuvo` isim alanı ({data, art, audio, engine, scenes,
test, dialog, icons}); sahne sözleşmesi `{mount(rootEl, params), unmount()}`; dış kaynak
istisnası yalnız Google Fonts; localStorage anahtarı `yuvo-proto-v1`; **migrasyon deseni:
yalnız bilinen anahtarları birleştir + tip onarımı** (yeni varsayılan alan eklemek her zaman
güvenli); RNG mulberry32 (tohum state'te); tüm UI Türkçe; pointer event + her jestin tap
fallback'i; referans ekran 390×844 portre. `prototype/ARCHITECTURE.md` bağlayıcı. *Uygulama:* tüm `prototype/`.

**K-09 · 2026-08-28 · Test disiplini (Definition of Done'ın parçası).** Her teslimat öncesi:
`proto-engine-test.mjs` (node sandbox; statik veri + 5.000'lik simülasyon + migrasyon + davranış
asertleri) ve `proto-smoke.mjs` (headless Chromium, gerçek dokunuş akışı, ekran görüntüleri,
SIFIR konsol hatası şartı) yeşil olmak zorunda. Artifact hep aynı URL'ye republish; ekran
görüntüleri kullanıcıya gönderilir. *Uygulama:* `tools/`, oturum ritüeli (`proje/README.md`).

**K-10 · 2026-08-29 · Marka kitabı bağlayıcı.** `prototype/BRAND.md`: sticker görsel dili
(beyaz hale + koyu kontur + şeker paleti), Baloo 2 + Nunito, Yuvo.icons seti, "ekranın tamamı
kompozisyondur; boş bant yasak". *Kaynak:* kullanıcı: "grafikleri ve tasarım iyi değil…
tam bir marka gibi olsun". *Uygulama:* commit `1e8fb8d` ve sonrası tüm UI.

## Ritüel ve dürüstlük

**K-11 · 2026-08-29 · Gerçek yumurta ritüeli 6 aşama.** Vitrin/salla-dinle → folyo yırtma
(3 şerit) → çikolata (Ye! +2⭐ tavan 40 / Biriktir → Kumbara 15'te şölen=+1 yumurta) →
Tomurcuk Kapsülü (4 açma aracı — saf kozmetik, orana ASLA etki etmez) → birleştirme →
Ambalaj Defteri (koleksiyon kozmetiği). Altın Folyo: %2 + hard pity 40 — tören katmanı,
çekiliş matematiğinden bağımsız. Kullanıcının "reklam alabiliriz" fikri **sponsorlu ambalaj
serisi** olarak gelir mimarisine yazıldı (park). *Kaynak:* kullanıcı ritüel spec mesajı.
*Uygulama:* `docs/v2/06`, `ceremony.js`, `wrappers.js`, `foilbook.js`.

**K-12 · 2026-08-29 · Dürüstlük sözleşmesi §1.3 (değişmez).** Nadirlik AÇILIŞ anında çekilir
→ açılış öncesi hiçbir görsel/ses (ambalaj, sallama) sonucu SIZDIRAMAZ; sallama ipuçları
yalnız gerçekten olası eksik dostları gösterir; kapsül aşamasından itibaren ipucu merdiveni
meşrudur (sonuç zaten çekilmiş). *Gerekçe:* çocuğa yalan sinyal = güven mimarisinin sonu.
*Uygulama:* `gacha.js` (openEgg akışı), `home.js` shakeHints, `ceremony.js`.

**K-13 · 2026-08-29 · Oturum döngüsü ilkeleri (araştırma temelli, değişmez).**
(a) POP öncesi 420 ms TAM sessizlik + vinyet; nadirlikte dallanan kutlama 900/1300/2200/2600 ms;
(b) "yarın sebebi" = ekranda fiziksel duran kanca (**kuluçka yumurtası**) — geri sayım sayacı
ASLA; (c) haklar birikir: newDay sıfırlamaz, kalan+3, tavan 9, kuluçka tavana sayılmaz;
(d) **cezasızlık**: Bekçi Takvimi 7 yıldız → +25 Kabuk; kaçan gün zinciri KIRMAZ, "kaybettin"
dili yasak; (e) günlük görev zinciri 3 aç · 1 oyun · albüm → BİR KEZ +1 bonus; (f) kapanış
ritüeli: Bugünün Dostları + yarının seri silueti. *Kaynak:* `docs/v2/08` araştırması.
*Uygulama:* `state.js`, `gacha.js`, `home.js`, `ceremony.js`.

**K-14 · 2026-08-29 · Hoş Geldin Sepeti = geri sayımsız.** Tek seferlik ₺14,99/5 yumurta;
"süresi yok, geri sayımı yok — siz hazır olana dek burada durur" dili ZORUNLU (duman testi
denetler). FOMO tersine çevrildi: aciliyet değil güven satar. *Uygulama:* `store.js`
(`tekSeferlik` bayrağı — merdiven dışı), `parent.js` renderWelcome.

## İkinci biyom

**K-15 · 2026-08-29 · Fısıltı Ormanı kuralları.** 31 orman Pufi'si; kilit: Çayır 10/30'da
bir kez açılır; gacha havuzu aktif biyoma filtrelenir (sızdırmaz); **pity sayaçları biyomlar
arası ORTAK** (biyom değiştirmek şansı sıfırlamaz); gizli kapısı biyom başına kendi 30/30'u;
kilometre taşları Çayır'a bağlı; Şako Saklambaç: saklanan parça YOK OLMAZ, iz bırakır, geri
kazanılır. *Uygulama:* `pufis-forest.js`, `gacha.js`, `state.js`, `sako.js`.

## Unity taşıması

**K-16 · 2026-08-29 · Prototip = oynanabilir spesifikasyon.** Unity'ye kod değil davranış
taşınır; İKİ İSTİSNA birebir port: gacha matematiği + state şeması/migrasyonu — **altın
vektör testleriyle** bit düzeyinde kilitlenir. Sayılar tek kaynak: `content/*.json` + remote
config. DEMO→IAP sıralaması: önce panel paritesi + kidSAFE, sonra ödeme. Bildirim: yalnız
kuluçka sabahı, varsayılan KAPALI, baskı bildirimi yok. *Uygulama:* `docs/v2/07`.

**K-17 · 2026-08-30 · İhraç boru hattı.** `export-content.mjs` (veri sandbox'tan, motor/tören
sabitleri hedefli regex'le — kalıp bulunamazsa yüksek sesle düşer) ve `export-golden-vectors.mjs`
(5 senaryo, 3.800 vektör; çift taze koşumla determinizm kanıtı; Math.random'sız). Her ikisinde
`--check` = CI "export güncel mi?" kapısı. *Uygulama:* `tools/export-*.mjs`, `content/`.

## Çalışma düzeni

**K-18 · 2026-08-30 · Proje yönetim katmanı (`proje/`) ve oturum ritüeli.** Plan/durum/
yapılacaklar/kararlar/oturum günlüğü/dosya haritası depoda yaşar; her iş bloğu kontekst
dolmadan kayıtla kapanır; **kayıtsız iş bitmemiş iştir**; push edilmemiş kayıt kayıt değildir.
*Kaynak:* kullanıcı: "bir işin düzeni onu yapmaktan daha önemli… veri kaybı olmasın".
*Uygulama:* `proje/README.md` ritüeli.

**K-20 · 2026-08-30 · Unity sürüm kontrol politikası.** (a) Unity `.meta` dosyaları
**daima izlenir** — hem `client/UnityProject/` hem yerel UPM paketi `client/Yuvo.Core/`
altında; her `.meta` bir varlığın GUID kimliğidir, eksikse Unity temiz bir klonda GUID'leri
yeniden üretir ve sahne/prefab referansları kopar. (b) Unity alt ağacında satır sonu
dönüşümü **kapalı** (`client/UnityProject/.gitattributes`, `-text`): Unity LF yazar, öyle
kalır; ikili varlıklar `binary` işaretlidir. (c) Üretilen içerik (`Library/`, `Temp/`,
`UserSettings/`, `.csproj`/`.sln`) asla commit edilmez.
*Kaynak:* O-13'te `client/.gitignore`'daki blanket `*.meta` kalıbının UnityProject'in tüm
`.meta`'larını yuttuğu, proje depoya girmeden önce yakalandı.

**K-19 · süregelen · Depo/işbirliği sabitleri.** Dal: `claude/surprise-egg-collection-game-eycqiq`
(başkasına push yok); commit mesajları Türkçe ve içerik odaklı; artifact HEP aynı URL'ye
republish; model kimliği repo çıktılarının hiçbirine yazılmaz; tüm doküman ve UI dili Türkçe.
