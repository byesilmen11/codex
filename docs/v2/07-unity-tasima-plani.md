# v2·07 · Unity Taşıma Planı (Prototip → Yayın İstemcisi)

> **Amaç:** HTML5 prototipi (vanilla JS, `prototype/`) artık özellik-tamamlanmış bir
> **oynanabilir spesifikasyondur**. Bu doküman onu Unity tabanlı yayın istemcisine
> taşımanın somut planıdır: neyin birebir port edileceği, neyin yeniden üretileceği,
> hangi araçların yazılacağı, fazlar ve kabul ölçütleri.
>
> **Bağlar:** motor seçimi/ekip/12 aylık yol haritası → [`docs/11`](../11-teknik-mimari-ve-yol-haritasi.md) ·
> davranış sözleşmesi → [`prototype/ARCHITECTURE.md`](../../prototype/ARCHITECTURE.md) ·
> oranlar/pity → [v2·02 §2.2](02-koleksiyon-sistemi-ve-algoritma.md) ·
> mağaza kuralları → [v2·05](05-magaza-ve-yumurta-paketleri.md) ·
> ritüel sahnelemesi → [v2·06](06-gercek-yumurta-ritueli.md).

## 0. İlkeler: prototipin yeni rolü

1. **Prototip = davranış sözleşmesi.** Unity'ye *kod* değil *davranış* taşınır; prototip
   canlı referans olarak repoda kalır ve tasarım değişiklikleri önce onda denenir
   (HTML'de bir akışı denemek Unity'de denemekten 10 kat ucuz).
2. **İki istisna birebir port edilir:** (a) **gacha matematiği** (`gacha.js` — mulberry32,
   pity, akıllı düşüş, onboarding, biyom havuzu) ve (b) **state şeması + migrasyon
   deseni** (`state.js` — "yalnız bilinen anahtarları birleştir" kuralı). Bu ikisi altın
   vektör testleriyle (§3) bit düzeyinde kilitlenir.
3. **Değişmezler Unity'de de değişmez:** çocuk arayüzü fiyat/mağaza görmez · Efsanevi
   vaat olarak satılmaz · nadirlik açılış anında çekilir, ambalaj/salla sonucu asla
   sızdıramaz (dürüstlük sözleşmesi v2·06 §1.3) · geri sayım/baskı dili yok · haklar
   birikir, streak cezasızdır · satın alınan yumurta Kiler'e düşer ve çocuk tarafında
   ayırt edilemez.
4. **Sayılar tek kaynaktan:** tüm ayar sabitleri (oranlar, pity eşikleri, tören süreleri,
   tavanlar) içerik JSON'unda yaşar (§4) ve remote config ile ezilebilir (docs/11 §2) —
   koda gömülü sihirli sayı bırakılmaz.

## 1. Teknik temel kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Unity sürümü | **En güncel Unity LTS** (proje açılışında sabitlenir; sürüm yükseltme yalnız LTS→LTS) | Runtime ücretlendirme politikası ve Kids kategorisi uyumu LTS'te öngörülebilir |
| Render | 2D URP, portre; referans çerçeve 390×844, safe-area duyarlı | Prototiple aynı kompozisyon; çentikli cihazlar |
| UI | **UGUI + TextMeshPro**; tween için DOTween (veya PrimeTween) | Juice-ağırlıklı UI (tören, konfeti, balonlar) UGUI+tween ile en olgun boru hattı; tek UI teknolojisi tutulur |
| İçerik dağıtımı | Addressables; biyom/sezon paketleri ayrı gruplar | docs/11 §2 "içerik boru hattı" |
| Kod düzeni | 4 assembly: `Yuvo.Core` (saf C#, UnityEngine bağımsız) · `Yuvo.Data` · `Yuvo.Game` (sahneler/UI) · `Yuvo.Services` (kayıt, IAP, bildirim, remote config) | Core'un Unity'siz olması NUnit'te milisaniyede binlerce simülasyon koşturmayı sağlar (bugünkü node testinin karşılığı) |
| Bağımlılık denetimi | CI'da paket listesi diff'i; reklam/izleme SDK'sı = build kırılır | docs/11 §2 "sıfır çocuk verisi" |

## 2. Modül eşleme tablosu (JS → Unity)

| Prototip | Unity karşılığı | Taşıma türü |
|---|---|---|
| `main.js` (router, HUD, modal, toast, 180ms fade) | `UIRouter` + tek `Main` Unity sahnesi içinde ekran prefab'ları (`Home`, `Ceremony`, `Assembly`, `Album`, `Minigame`, `FoilBook`, `Parent`, `Sako`, `Intro`); geçiş fade'i CanvasGroup tween | Yeniden yazım (aynı sözleşme: tam-ekran ekranlar HUD+nav gizler) |
| `engine/state.js` | `Yuvo.Core.GameState` (POCO) + `SaveService` | **Birebir port** — alan adları ve varsayılanlar aynen; migrasyon deseni §7 |
| `engine/gacha.js` | `Yuvo.Core.GachaEngine` | **Birebir port** — mulberry32 `uint` aritmetiğiyle; §3 altın vektörler |
| `data/pufis.js`, `pufis-forest.js`, `wrappers.js`, `dialogue.js`, `store.js` | `/content/*.json` → ScriptableObject importer (§4) | Veri ihracı (kod değil) |
| `scenes/home.js` (vitrin, jestler, görev çipleri, kuluçka, kapanış ritüeli, Şako uçuşu, kargo balonu) | `HomeScreen` prefab + `HomePresenter`; jestler `IPointer*` + basılı-tut coroutine | Yeniden yazım; davranış paritesi duman senaryolarıyla (§10) |
| `scenes/ceremony.js` (folyo→çikolata→kapsül; hush 420 ms; tier'a göre 0,9/1,3/2,2/2,6 sn kutlama; splash; seri satırı) | `CeremonyScreen` + `CeremonyTimeline` (DOTween Sequence) | Yeniden yazım; tüm süreler `ritual.json`'dan |
| `scenes/assembly.js` (sürükle-bırak, mıknatıs, snap) | `AssemblyScreen`; fizik yok, tween mıknatıs | Yeniden yazım |
| `scenes/album.js` (soundboard, Hedefim Bu!, Altın Yumurta teaser) · `foilbook.js` | `AlbumScreen` / `FoilBookScreen`; hücreler pooled | Yeniden yazım |
| `scenes/minigame.js` (Eşle & Bul + Çıt Çıt Köşesi) | `MinigameScreen` (iki mod) | Yeniden yazım |
| `scenes/intro.js` (FTUE + playDusk) | `IntroFlow` + `DuskOverlay` | Yeniden yazım; ilk çıtlamaya ≤25 sn hedefi korunur |
| `scenes/parent.js` (PIN kapısı, DEMO mağaza, güven kancaları) | `ParentPanel`; DEMO → gerçek IAP evrimi §8 | Yeniden yazım + servis katmanı |
| `ui-dialog.js` (balon kuyruğu, `sure` otomatik akış) | `DialogueController` | Yeniden yazım |
| `art/*.js` (prosedürel SVG) | Sprite atlas boru hattı (§5) | Varlık ihracı |
| `audio.js` (WebAudio sentez, pufiChirp id-hash) | `AudioService` + önceden render edilmiş SFX (§6) | Varlık ihracı + küçük port (hash formülü) |
| `tools/proto-engine-test.mjs` | `Yuvo.Core.Tests` (NUnit, editmode) | **Senaryo senaryo çeviri** (§3, §10) |
| `tools/proto-smoke.mjs` (55 adım) | Unity Test Runner playmode + cihazda Altest koşusu | Senaryo çevirisi (§10) |

## 3. Deterministik çekirdek ve altın vektör testleri

Ekonomi çekirdeğinin JS ve C# uygulamaları **aynı tohumla aynı sonucu** üretmek zorundadır.
Bu, port hatalarını (oran kayması, pity kaçağı) sıfır maliyetle yakalar ve ileride
sunucu-onaylı RNG'ye (docs/11 §2) geçişin temelini atar.

1. **`tools/export-golden-vectors.mjs` (yeni):** prototip motorunu node sandbox'ında
   koşturur; N sabit tohum için ilk 1 000 açılışın `(eggCounter, tier, pufiId, isNew,
   pity sayaçları)` dizisini `content/golden/*.json`'a yazar. Kapsanan senaryolar:
   temiz başlangıç · orman biyomu · 27/30 son-3 ağırlığı · kopya serisi zorlaması ·
   altın folyo pity'si.
2. **C# tarafı:** `GachaEngineGoldenTests` aynı tohumlarla aynı dizileri üretir.
   mulberry32 `uint` üzerinden birebir (`s.seed = s.seed + 0x6D2B79F5 | 0` → C#'ta
   `unchecked` uint); `weightedPick` float toplama SIRASI dahil aynen korunur
   (IEEE-754 double iki dilde de aynı — sıra değişirse sonuç değişir).
3. **Davranış asertleri:** `proto-engine-test.mjs`'teki her bölüm NUnit'e çevrilir —
   pity tavanları (Nadir ≤15, Destansı ≤40, Efsanevi ≤50) · onboarding (ilk 10 eksik,
   3. Nadir+) · biyom sızdırmazlığı (600 açılışta 0 yabancı) · gizli kapısı (30/30) ·
   **hak birikimi (kalan+3, tavan 9; kuluçka tavana sayılmaz)** · kuluçka döngüsü ·
   görev zinciri (+1 bonus bir kez) · cezasız streak (7 yıldız → +25 Kabuk) ·
   v1/v2→v3 kayıt migrasyonu · mağaza (limit, Kiler tavanı, Club yuvarlaması, dilek kuralları).

## 4. İçerik boru hattı (tek kaynak: JSON)

```
/content
  pufis.json        ← 62 Pufi (id, ad, tur, kind, rarity, biome, bio)
  rarities.json     ← oran/kabuk/üretim/renk (v2·02 kanonik)
  wrappers.json     ← 6 seri × 8 varyant + RITUAL sabitleri
  dialogue.json     ← DIALOG replik havuzları + pufiSelam
  packs.json        ← 6 kademe + hosgeldin (tekSeferlik) + CLUB + ODDS + STORE_LIMITS
  ritual.json       ← tören zamanlaması: hush 420 ms · kutlama 900/1300/2200/2600 ms ·
                      EGG_STACK_MAX 9 · STREAK 7→+25 · görev hedefleri 3 aç/1 oyun/albüm ·
                      kiler günlük 5 (+1 Club) · onboarding/pity eşikleri
  golden/*.json     ← §3 altın vektörleri
```

- **`tools/export-content.mjs` (yeni):** bu JSON'ları doğrudan prototip JS verisinden
  üretir. Prototip yaşadığı sürece içerik çift-kaynak olmaz; CI'da "export güncel mi?"
  diff kontrolü koşar.
- Unity'de Editor importer JSON → ScriptableObject üretir; runtime'da remote config
  aynı şemayla alanları ezebilir (oran/pity/süre canlı ayarı — docs/11 §2).

## 5. Sanat boru hattı

Prototipteki tüm görsel dil **prosedürel SVG**. Unity'ye iki aşamada taşınır:

1. **Kısa vade — otomatik ihraç:** `tools/export-art.mjs` (yeni; `resvg`/`sharp` ile
   SVG→PNG) şu setleri @2x/@3x render eder: 62 Pufi × (happy/sleep/silüet) · oyuncak
   parçaları (62×3) + birleşmiş oyuncak · yumurta 6 nadirlik × crack 0-3 · ambalaj
   6 seri × 8 varyant × yırtılma aşamaları · kapsül/çevre/UI ikonları/hikâye portreleri.
   Çıktı Unity SpriteAtlas'larına (biyom başına bir atlas + UI atlası) Addressables ile bağlanır.
2. **Orta vade — gerçek illüstrasyon:** sanat ekibi (docs/11 §3) varlıkları aynı
   **id → sprite adı sözleşmesiyle** değiştirir (`pufi_cikcik_happy`, `egg_nadir_crack2`…).
   Kod hiç değişmez; atlas içeriği değişir.
3. Fontlar: Baloo 2 + Nunito TMP varlıkları (OFL lisans — gömme serbest). Sticker
   paneller 9-slice. CSS keyframe'leri DOTween sekanslarına çevrilir; süreler `ritual.json`'dan.

## 6. Ses boru hattı

- WebAudio sentezinin ürettiği kimlik korunur: **`tools/export-audio.mjs` (yeni)**,
  `audio.js`'teki SOUNDS tanımlarını offline render edip WAV/OGG üretir (ilk sürümde
  birebir aynı tını); ses tasarımcısı (docs/11 §3) sonra aynı adlarla kayıtları değiştirir.
- **pufiChirp:** her Pufi'nin FNV-1a id-hash imzalı cıvıltısı (base 520+h%700 Hz,
  4 dizi kalıbı) 62 dosya olarak önceden render edilir — karşılaşma ve albüm
  soundboard'unda aynı kimlik.
- Katman sözleşmesi (v2·06 ses sözlüğü): doku/olay/doruk kanalları AudioMixer'da ayrı;
  **hush anında tüm kanallar snapshot'la susar** (POP öncesi 420 ms sessizlik garanti).
- Titreşim: `Handheld.Vibrate` yerine ince kontrol için hafif bir haptik sarmalayıcı
  (iOS CoreHaptics / Android VibrationEffect), yaş modunda kapatılabilir.

## 7. Kayıt sistemi ve migrasyon

- JSON @ `Application.persistentDataPath`; **atomik yazım** (temp dosya + rename) ve
  **çift yuva** (A/B — bozuk dosyada son sağlam yuvaya düş). Çocuk cihazında pil ölümü
  sıradan olaydır; kayıt kaybı kabul edilemez.
- Şema `state.js` v3 ile aynı alan adlarında kalır; **"yalnız bilinen anahtarları
  birleştir + tip onarımı"** deseni aynen port edilir (NUnit'te bozuk-kayıt fuzz testi).
- Prototip localStorage kayıtları taşınmaz (ayrı ürün); ama şema aynı olduğundan test
  fikstürleri ortaktır.
- Bulut kaydı: ebeveyn hesabına bağlanınca fırsatçı senkron (Faz 3+, docs/11 §2 offline-first).

## 8. DEMO mağazadan gerçek IAP'ye

Prototipteki panel bilinçli olarak simülasyondu; Unity'de gerçekleşir. Sıralama önemli:

1. **U2'ye kadar DEMO kalır** — panel, PIN, limit, Kiler, Dilek Kartı+, güven şeridi,
   Hoş Geldin Sepeti, yayılım önizlemesi birebir taşınır; "DEMO — gerçek ödeme alınmaz"
   ibaresi durur. Böylece kidSAFE ön denetimi gerçek para akışı olmadan yapılabilir.
2. **U3'te Unity IAP bağlanır:** `packs.json` ürünleri platform kataloglarına eşlenir
   (fiyatlar mağaza tier'larına yuvarlanır; TL-net ilke korunur — ara para birimi yok).
   PIN bizim panel kapımızdır; **ödeme onayı her zaman işletim sisteminindir** (Apple/Google
   ebeveyn onay akışları). Makbuz doğrulama: başlangıçta mağaza-taraflı, sunucu gelince
   sunucu-taraflı.
3. **Platform programları:** Google Play Families + Apple Kids Category gereksinim listesi
   (reklamsız, izleme yok, üçüncü parti SDK denetimi, veri güvenliği formları) U3 kabul
   kapısıdır. "Efsanevi vaat olarak satılmaz" ve oran tablosu mağaza metinlerinde de görünür
   (Apple 3.1.1/Google loot-box şeffaflık kuralı zaten bunu ister).
4. Aylık limit/soğuma/Kiler tavanı istemcide uygulanır, sunucu gelince sunucuda da
   doğrulanır (limit hilesi = istemci saati oynatmak; sunucu saati kanonik olur).
5. Bölge matrisi (Belçika/Hollanda) için vitrin bayrağı altyapısı U3'te kurulur;
   kapsam kararı hukuk görüşüne park edilmiş durumda (v2 README "Açık Konular").

## 9. Bildirimler ve randevu kancaları

- Tek yerel bildirim türü: **kuluçka sabahı** ("Şako'nun bıraktığı yumurta hazır!") —
  ebeveyn panelinden açılır, **varsayılan kapalı**, sessiz saatlere (21:00–08:00) asla
  girmez. "Geri dön", "son şans", "seni özledik" tipi baskı bildirimi YOKTUR (tasarım
  değişmezi; araştırma bölümündeki FTC emsallerinin tam karşı pozisyonu).
- Oyun içi randevular (kuluçka, yarının seri silueti, Bekçi Takvimi) bildirimsiz de
  çalışır — bildirim yalnız hatırlatıcıdır, kanca değil.

## 10. Fazlar ve kabul ölçütleri

docs/11 §4 yol haritasının "Faz 2 · Vertical Slice" hücresini ayrıntılandırır
(süreler 2 Unity geliştirici varsayımıyla):

| Faz | Süre | Kapsam | Kabul ölçütü |
|---|---|---|---|
| **U0 · Temel** | 2 hafta | Proje iskeleti, assembly düzeni, export araçları (`export-content/art/audio/golden-vectors`), `Yuvo.Core` + SaveService | Altın vektör + tüm çekirdek NUnit testleri yeşil; CI kurulu (test + bağımlılık denetimi) |
| **U1 · Dikey dilim** | 4 hafta | Home + Ceremony + Assembly + Album, tek biyom, HUD/router | Prototipin 22 adımlık ritüel duman senaryosu playmode'da geçer; orta segment Android'de 60 fps, ilk açılış < 4 sn |
| **U2 · Tam döngü** | 4 hafta | Intro/FTUE, oturum döngüsü (kuluçka, görevler, takvim, kapanış), Minigame + Çıt Çıt, Orman + Şako, FoilBook, ebeveyn paneli (DEMO), bildirim altyapısı | 55 adımlık duman paritesi; 5 çocukta gülümseme testi (docs/11 Faz 1 kriteri) Unity sürümünde tekrarlanır |
| **U3 · Yayın hazırlığı** | 4 hafta | Gerçek IAP + makbuz doğrulama, remote config, anonim telemetri, kidSAFE ön denetim, mağaza sayfası varlıkları | Families/Kids program ön kontrol listesi tam; iade edilebilir test alımı uçtan uca; crash-free ≥ %99,5 (kapalı beta) |

Cihaz matrisi (U1'den itibaren her fazda): 3-4 yaşındaki orta segment Android (2 GB RAM)
alt sınır kabul cihazıdır; iPhone SE dar-ekran kontrolü; tablet ölçekleme U2'de.

## 11. Sosyallik ve backend (bilinçli erteleme)

- **Övünme kartı** (P6'dan kalan): sonuç kartından OS paylaşım sayfasına PNG — backend
  istemez, PII içermez; U2'ye küçük iş olarak girebilir.
- **Gerçek arkadaş/hediye sosyalliği** (kullanıcının "gerekirse arkadaşlarıyla
  sosyalleşme" notu): ebeveyn onaylı, kod-tabanlı eşleşme + hediye yumurta. Sunucu,
  hesap sistemi ve moderasyon ister → **backend fazına** (docs/11 depo yapısı `/server`)
  park edilir; U3 sonrası ele alınır. Prototipte bilinçli olarak yok.

## 12. Riskler ve önlemler

| Risk | Önlem |
|---|---|
| SVG→PNG ihraçta kalite/tutarlılık kaybı | @3x render + atlas denetim sahnesi (tüm varlıklar tek ekranda göz kontrolü); orta vadede gerçek illüstrasyon zaten planlı |
| Determinizm kayması (JS↔C# float) | mulberry32 tam `uint`; `weightedPick` toplama sırası sabit; altın vektörler CI'da her commit'te |
| WebAudio tınısının kaybolması | Offline render ilk sürümde birebir; ses tasarımcısı değişiklikleri A/B'lenir (hush + tier kontrastı ölçütü: v2·06 ses sözlüğü) |
| Unity runtime ücretlendirme/politika değişimi | LTS sabitleme + docs/11 §6'daki üç aylık politika takibi ritüeli |
| Tören sürelerinin cihazda "uzun" hissetmesi | Tüm süreler `ritual.json` + remote config'te; çocuk testinde ayar, kod değişikliği istemez |
| DEMO→IAP geçişinde güven kancalarının sulanması | §8 sıralaması bağlayıcı: önce panel paritesi + kidSAFE, sonra ödeme; "Efsanevi satılmaz" ve limit/soğuma davranışları NUnit'te kilitli |

## 13. İlk sprint (U0) somut iş listesi

1. Unity LTS projesi + assembly'ler + CI (test koşucusu, bağımlılık diff'i).
2. `tools/export-content.mjs` → `/content/*.json` + "export güncel mi?" CI kontrolü.
3. `tools/export-golden-vectors.mjs` → `content/golden/`.
4. `Yuvo.Core.GachaEngine` + `GameState` portu; NUnit'te altın vektör + davranış asertleri.
5. `SaveService` (atomik, çift yuva) + migrasyon fuzz testi.
6. `tools/export-art.mjs` ilk sürümü (yumurta + 5 Pufi ile boru hattı kanıtı) →
   SpriteAtlas → boş `Main` sahnesinde örnek ekran.
