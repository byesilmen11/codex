# Yuvo Dikey Dilim Prototipi — Mimari Sözleşme (v1)

> Bu dosya BAĞLAYICIDIR. Her modül geliştirici yalnızca kendine atanan dosyaları yazar ve
> buradaki arayüzlere birebir uyar. İskelet dosyalar (index.html, css/style.css, js/main.js,
> tools/build-proto.mjs) hazırdır ve DEĞİŞTİRİLMEZ (entegrasyon ajanı hariç).

## Amaç ve kapsam (dikey dilim)

Mobil (dikey, dokunmatik) HTML5 prototip: **çıtlatma töreni + oyuncak birleştirme + Güneş
Çayırı ailesi (31 Pufi) + albüm çekirdeği + Eşle & Bul mini oyunu + ekonomi/pity motoru.**
Tasarım kaynakları: `docs/06` (tören §2, birleştirme §3), `docs/v2/02` (oranlar, pity, aile
listesi, Kabuk), `docs/v2/04` (FTUE duygusu), `docs/10` (görsel dil).

Teknik kurallar:
- Saf vanilla JS + CSS + inline SVG. **Dış kaynak istisnası yalnızca Google Fonts** (Baloo 2 +
  Nunito; fonts.googleapis.com/fonts.gstatic.com artifact CSP allowlist'inde — index.html'de
  bağlı, build script https link'leri aynen geçirir, tam fallback yığını zorunlu). Onun dışında
  hiçbir dış kaynak yok (CDN görsel/ses yasak).
- Marka katmanı (v2): `BRAND.md` bağlayıcı marka kitabıdır; `js/ui-icons.js` (Yuvo.icons — logo +
  ikon seti, marka-lideri), `js/art/pufi-kinds-1..3.js` (karakter kayıtları, ressamlar) ve
  `js/art/env.js` (çevre sanatı) script sırasına eklenmiştir (data → pufi-svg → kinds-1..3 →
  env → ui-icons → audio → engine → sahneler → main).
- ES module YOK. Her dosya IIFE: `(function(){ ... })();` ve `window.Yuvo` altına takılır.
- Tüm UI metinleri Türkçe. Emoji ikon serbest.
- Tüm etkileşimler **pointer event** ile; her jestin dokunma-dışı fallback'i olmalı
  (ör. ovalama jesti: art arda 5 tap de kabul edilir) — hem erişilebilirlik hem test otomasyonu için.
- Ekran: 100dvh dikey; yatay taşma yasak; dokunma hedefleri ≥ 56px.
- localStorage anahtarı: `yuvo-proto-v1` (state.js yönetir; try/catch zorunlu).

## Dosya sahiplik tablosu

| Dosya | Sahip |
|---|---|
| `prototype/js/data/pufis.js` | **engine** ajanı |
| `prototype/js/engine/state.js`, `prototype/js/engine/gacha.js`, `tools/proto-engine-test.mjs` | **engine** ajanı |
| `prototype/js/art/pufi-svg.js`, `prototype/js/audio.js` | **art-audio** ajanı |
| `prototype/js/scenes/ceremony.js`, `prototype/js/scenes/assembly.js`, `prototype/css/scenes-core.css` | **scenes-core** ajanı |
| `prototype/js/scenes/home.js`, `prototype/js/scenes/album.js`, `prototype/js/scenes/minigame.js`, `prototype/css/scenes-meta.css` | **scenes-meta** ajanı |
| `prototype/index.html`, `prototype/css/style.css`, `prototype/js/main.js`, `tools/build-proto.mjs` | HAZIR (dokunma) |

Script yükleme sırası (index.html'de sabit): data → art → audio → state → gacha → home →
minigame → album → ceremony → assembly → main.

## Global yapı

`js/main.js` şunu kurar (İLK yüklenen değil — en son yüklenir ama namespace'i her dosya kendisi
`window.Yuvo = window.Yuvo || {...}` deseniyle garanti eder):

```js
window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
```

main.js API'leri (hazır, kullanın):
- `Yuvo.go(name, params?)` — sahne değiştir. Sahne adları: `home`, `album`, `minigame`,
  `ceremony`, `assembly`. `ceremony` ve `assembly` tam ekran (HUD+nav gizlenir).
- `Yuvo.modal(html) -> closeFn` — ortalanmış modal; kapatma çarpısı otomatik.
- `Yuvo.toast(text)` — kısa bildirim.
- `Yuvo.refresh()` — `yuvo:state` CustomEvent'i yayar; HUD kendini günceller. **State'i değiştiren
  her işlem sonrası çağırın** (state.js zaten kendi mutasyonlarında çağırır).
- İlk pointerdown'da `Yuvo.audio.unlock()` çağrılır (main.js yapar).

## Veri: `js/data/pufis.js` (engine)

```js
Yuvo.data.RARITIES = {
  yaygin:   { ad:'Yaygın',     renk:'#9AA5B1', kabuk:1,  uretim:5,   oran:0.550 },
  azbulunur:{ ad:'Az Bulunur', renk:'#58B368', kabuk:2,  uretim:10,  oran:0.250 },
  nadir:    { ad:'Nadir',      renk:'#4FB8D8', kabuk:4,  uretim:25,  oran:0.140 },
  destansi: { ad:'Destansı',   renk:'#B266E8', kabuk:10, uretim:80,  oran:0.046 },
  efsanevi: { ad:'Efsanevi',   renk:'#F2A61B', kabuk:25, uretim:200, oran:0.009 },
  gizli:    { ad:'Gizli',      renk:'#5C4A9E', kabuk:60, uretim:300, oran:0.005 },
};
Yuvo.data.PUFIS = [ { id, ad, tur, kind, rarity, bio }, ... ]  // 31 kayıt, aşağıdaki listeyle birebir
```

31 Pufi (id / ad / kind) — adlar-biyografiler `docs/v2/02-koleksiyon-sistemi-ve-algoritma.md`
§2.3'teki tablodan AYNEN alınır:
yaygin (12): cikcik/Cikcik/civciv · pamus/Pamuş/kuzu · vizbiz/Vızbız/ari · molu/Mölü/buzagi ·
gidak/Gıdak/tavuk · badi/Badi/ordek · hophop/Hophop/cekirge · fistik/Fıstık/sincap ·
boncuk/Boncuk/ugurbocegi · kivrik/Kıvrık/solucan · toprik/Toprik/fare · cigdem/Çiğdem/peri
azbulunur (9): pirpir/Pırpır/kelebek · zipzip/Zıpzıp/tavsan · civil/Cıvıl/serce ·
evcik/Evcik/salyangoz · dikenik/Dikenik/kirpi · kosti/Kösti/kostebek · meke/Meke/oglak ·
findik/Fındık/kopek · kirinti/Kırıntı/karinca
nadir (6): petek/Petek/arikralice · ibik/İbik/horoz · yele/Yele/midilli · makas/Makas/kirlangic ·
tavus/Tavus/tavuskusu · ipekce/İpekçe/orumcek
destansi (2): bogac/Boğaç/gunesbuzagisi · safak/Şafak/tarlakusu
efsanevi (1): gundogan/Gündoğan/guneskusu
gizli (1): hisir/Hışır/korkuluk

## Motor: `js/engine/state.js` (engine)

```js
Yuvo.engine.state = {  // varsayılanlar
  version:1, stardust:40, kabuk:0, day:1,
  eggsAvailable:3, extraEggsBought:0,      // günlük: 3 temel + en çok 2 ek (120⭐/adet)
  eggCounter:0, pityN:0, pityD:0, pityE:0, copyStreak:0,
  owned:{},                                 // pufiId -> adet
  milestones:[],                            // ör. ['m10','m20','m27','m30']
  weekCrafts:0, rewardedPlaysToday:0,
};
Yuvo.engine.load(); Yuvo.engine.save();     // localStorage, try/catch'li
Yuvo.engine.newDay();                       // eggsAvailable=3, extraEggsBought=0, rewardedPlaysToday=0, day++
Yuvo.engine.addStardust(n); Yuvo.engine.spendStardust(n)->bool;
Yuvo.engine.buyExtraEgg()->bool;            // 120⭐, günde max 2
Yuvo.engine.ownedCount()                    // gizli HARİÇ sahip olunan farklı parça sayısı (0-30)
Yuvo.engine.craft(pufiId)->{ok, reason?}    // Kabuk yeterliyse üret; gizli için ownedCount()==30 şartı
```
Her mutasyon `Yuvo.engine.save()` + `Yuvo.refresh()` çağırır.

## Motor: `js/engine/gacha.js` (engine) — docs/v2/02 §2.2 algoritmasının birebir uygulaması

```js
Yuvo.engine.openEgg() -> { pufi, rarity, isNew, kabukGained, celebrationTier }
```
- Oranlar: RARITIES.oran. **Güneş Çayırı onboarding istisnası geçerli:** SOFT_PITY_E=35,
  HARD_PITY_E=50 (tek ailelik prototipte ilk "vay canına" erken gelsin); PITY_NADIR=15,
  PITY_DESTANSI=40; ONBOARDING=10 (ilk 10 yumurta hep eksik parça; 3. yumurta Nadir+ garanti);
  KOPYA_SERI_ESIGI=6.
- Gizli (`hisir`): yalnızca `ownedCount()==30` iken havuzda; değilse oranı yaygın'a eklenir.
- Akıllı düşüş: eksik parçalara ağırlık 4; `ownedCount()>=27` iken 12. Efsanevi/Gizli çekilişi
  her zaman eksik-öncelikli.
- Kopya: `owned[id]++`, kabukGained=RARITIES.kabuk, copyStreak++; yeni parça: copyStreak=0.
- celebrationTier: 0 yaygin/azbulunur, 1 nadir, 2 destansi, 3 efsanevi/gizli.
- `eggsAvailable<=0` ise `{error:'no-egg'}` döndür.
- RNG: mulberry32; seed state'te tutulur (deterministik replay şart değil ama tohum kalıcı olsun).

Test dosyası `tools/proto-engine-test.mjs`: node ile çalışır (js dosyalarını okuyup
`window` shim'iyle eval eder), 5.000 yumurtalık simülasyonda şunları assert eder:
pity ihlali yok (Nadir≤15 aralık, Destansı≤40, Efsanevi≤50), 30 parça medyan ≤120 yumurtada
tamamlanıyor, oran toplamı 1, gizli 30/30'dan önce düşmüyor.

## Sanat: `js/art/pufi-svg.js` (art-audio)

Hepsi string döndürür (inline `<svg viewBox="0 0 120 120">`), deterministik (id hash'inden):
```js
Yuvo.art.eggSVG(rarity, {crack:0|1|2|3})   // kabuk: nadirlik dokusu (mat/benekli/sedefli/desenli/ışıltılı/karanlık) + çatlak aşaması
Yuvo.art.pufiSVG(pufi, {mood:'happy'|'sleep'})  // kind'e göre sevimli yaratık; silüeti ayırt edilebilir
Yuvo.art.pufiSilhouetteSVG(pufi)           // albümdeki "?" için koyu silüet
Yuvo.art.toyParts(pufi) -> [{id:'govde'|'bas'|'aksesuar', svg}]  // birleştirme oyuncağının 3 parçası + 
Yuvo.art.toyAssembledSVG(pufi)             // birleşmiş oyuncak
```
Stil: docs/10 — yuvarlak formlar, pastel + canlı vurgu, "vinil oyuncak" hissi (yumuşak radyal
gradyanlar, parlama noktası). 31 kind'in hepsi çizilmeli; benzer kind'ler ortak gövde şablonu +
ayırt edici özellik (kulak/gaga/anten/yele/kuyruk) kullanabilir. Efsanevi/Gizli'ye özel ışıma.

## Ses: `js/audio.js` (art-audio)

WebAudio ile sentez; dosya yok. `Yuvo.audio.unlock()` (ilk jestte main.js çağırır),
`Yuvo.audio.play(name)`: `tap, crack1, crack2, crackBig, pop, chime, click, snap (parça oturdu),
fanfare (tier2), fanfareBig (tier3), star (⭐ kazanımı), page (albüm)`. ASMR hissi: crack'ler
filtreli noise burst + pitch düşüşü; fanfare pentatonik arpej. Ses yoksa sessiz çalışmalı (hata atma).

## Sahneler

Her sahne: `Yuvo.scenes.X = { mount(rootEl, params), unmount() }`. unmount'ta timer/listener temizliği ZORUNLU.

**home (scenes-meta):** Çayır fonu (CSS/SVG), yuva sepeti: eldeki yumurtalar (`eggsAvailable`)
tıklanınca `Yuvo.go('ceremony')`. Sahip olunan son 3-5 Pufi çimenlerde gezinir (basit CSS
animasyon; tıklayınca zıplar + ses). Yumurta bitince: "🌙 Günü Bitir" butonu (`newDay()`) +
120⭐'a ek yumurta butonu (kalan hak gösterilir). Albüm ilerleme şeridi (x/30).

**minigame (scenes-meta):** Eşle & Bul — 6 kart (3 çift; kartlar bilinen Pufi yüzleri, az
Pufi'liyken yumurta deseni kullan). Süre yok, kaybetme yok. Bitince 1-3 yıldız + 20-40⭐
(`rewardedPlaysToday<5` ise; sonrası "Pufiler dinleniyor, yarın yine oynayalım" + 5⭐ sembolik).
"Tekrar" ve "Yuvaya dön" butonları.

**album (scenes-meta):** "Güneş Çayırı" sayfası: 30 hücre (nadirlik çerçeveli) + ayrık 1 "???"
hücre (gizli). Eksik = silüet + "?"; sahipli = mini portre + kopya rozeti (×n). Kilometre taşları
çipleri (10/20/27/30 — ödül: 15/30/60/100 Kabuk, state.milestones ile bir kez). Hücreye tık:
detay modalı — sahipliyse bio + oyuncak görseli; eksikse Atölye: maliyet + "Usta Kabuk'a Ürettir"
(craft → kısa tören animasyonu + albüme işlenme). Üst bilgi: ilerleme x/30, Kabuk bakiyesi.

**ceremony (scenes-core):** docs/06 §2 birebir, tam ekran:
1. Sepetten yumurta gelir (rarity önceden ÇEKİLMEZ — önce `openEgg()` çağrılır, sonuç saklanır,
   kabuk görseli sonucun nadirliğine göre gelir; çocuk-görünümünde bu "kabuk ipucu" hissi verir).
2. Isıtma: dairesel ovalama (pointermove birikimi) YA DA 5 tap → kabuk pembeleşir, titreşim
   (`navigator.vibrate` varsa), crack:1.
3. Ritim: 3 halka sırayla belirir, her tap crack+1 + ses; kaçırmak imkânsız (halka bekler).
4. Patlama: konfeti (CSS parçacık), ışık; `pufiSVG` zıplayarak çıkar; tier'a göre kutlama
   büyür (tier3: ekran ışıması + fanfareBig + kısa duraklama).
5. Kart: ad + nadirlik + bio (2-3 sn veya tap); kopya ise "+N 🐚" rozeti göster.
6. "Oyuncağını Birleştir!" → `Yuvo.go('assembly', {pufiId})`. (Kopyaysa birleştirme atlanır,
   "Devam" → home.)
Atlanabilirlik: her aşamada çift-tap ile hızlandır. Test kancası: `Yuvo.test.ceremonySkip()`.

**assembly (scenes-core):** `toyParts` 3 parçası alt rafta; hedef silüet ortada. Sürükle-bırak
(pointer); doğru yuvaya yaklaşınca mıknatıs + `snap` sesi + parıltı; yanlış yuva: nazikçe geri
süzülür (ceza yok). 3/3 → `toyAssembledSVG` + Pufi sevinç dansı + "Albüme İşlendi 📔" →
albüm sayfasına kısa geçiş (`Yuvo.go('album')`). Test kancası: `Yuvo.test.assemble()`.

## Test kancaları (`Yuvo.test`, otomasyon için — engine ve sahneler doldurur)

`Yuvo.test = { state:()=>Yuvo.engine.state, grantStardust(n), grantEggs(n), openEggRaw:()=>Yuvo.engine.openEgg(), ceremonySkip(), assemble() }`

## Build

`node tools/build-proto.mjs` → `prototype/dist/index.html` (tam sayfa, yerel test) ve
`prototype/dist/artifact.html` (yalnız içerik: title+style+markup+script; artifact yayını için).

## v3 katmanı — hikâye/FTUE + ebeveyn paneli + Fısıltı Ormanı (bu sürümde eklendi)

**Yeni dosyalar:** `js/data/store.js` (paket merdiveni/CLUB/ODDS/limitler/DEMO_UYARI),
`js/data/dialogue.js` (Yuvo.data.DIALOG replik havuzları), `js/data/pufis-forest.js`
(Fısıltı Ormanı 31 Pufi — biome:'orman'; çayır kayıtları geriye dönük biome:'cayir' damgalanır),
`js/ui-dialog.js` (Yuvo.dialog.say/clear/busy — sticker konuşma balonu kuyruğu, #dialog-root),
`js/art/story-svg.js` (Yuvo.art.story.{pofu,kiki,ustakabuk,luna,sako,portre}),
`js/art/pufi-kinds-4/5/6.js` (31 orman kind'i), `js/scenes/intro.js` (FTUE + playDusk),
`js/scenes/parent.js` + `css/parent.css` (PIN kapılı DEMO paneli), `js/scenes/sako.js`
(Şako Saklambaç), `css/story.css` (dlg-/intro-/dusk-/sk-/alb-biome-/home-side stilleri).

**State v3 alanları:** `parent{pin,limitTL,spentTL,ay,clubActive,limitRaiseTs}`,
`kiler{adet,bugunAcilan}`, `wishes[]`, `purchases[]`, `introDone`, `introGiftShown`,
`activeBiome('cayir'|'orman')`, `ormanAcik`, `sakoHidden`. Migrasyon v1/v2→v3 kayıpsız,
bozuk ebeveyn verisi varsayılana onarılır.

**Motor API'leri:** `buyPack(id)` (aylık limit; YALNIZ kiler'e ekler — vitrine asla),
`drawFromKiler()` (günlük tavan 5, Club +1), `addWish/clearWish` (7 gün/5 dilek/kopyasız),
`setLimit` (artırımda 24 sa soğuma bilgisi), `setPin`, `toggleClub`, `spendReport()`,
`setBiome(b)`, `checkOrmanUnlock()` (çayır 10/30'da bir kez), `sakoRecover()`.
`ownedCount(biome?)` biyom filtresi aldı; gacha havuzu (`poolOf`) aktif biyoma filtrelenir,
pity sayaçları biyomlar arasında ORTAKtır (satın alma/biyom şansı sıfırlamaz).

**İlke sözleşmesi (değişmez):** çocuk arayüzü fiyat/mağaza GÖRMEZ (yalnız "Dilek Kavanozu"
ve "Sürpriz posta!"); mağaza ebeveyn-PIN arkasında DEMO simülasyondur ("DEMO — gerçek ödeme
alınmaz" her satın alma özetinde); Efsanevi vaat olarak SATILMAZ; satın alınan yumurta kilere
düşer, çocuk tarafında sıradan yumurtadan ayırt edilemez.

**Yeni test kancaları:** `skipIntro/replayIntro/introWarm`, `dialogNext`, `parentUnlock(tab)`,
`sakoWin`. Duman testi 3 bölüm/43 adım: A) FTUE yürüyüşü (temiz state → intro → tören),
B) çekirdek ritüel (eski 22 adım aynen) + dilek→PIN→satın alma→kiler akışı,
C) orman kilidi + biyom albümü + Şako Saklambaç. Ekranlar: 01-14.
