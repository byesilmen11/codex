# v2·06 · Gerçek Yumurta Ritüeli ("Sürpriz Yumurta Simülasyonu")

> **Vizyon (kullanıcı):** *"Gerçek hayattaki sürpriz yumurta deneyiminin simülasyonu."*
> Market rafındaki o anın tamamı — vitrinden seçme, kutuyu sallama, folyoyu yırtma, çikolatayı
> ısırma, kapsülü açma, oyuncağı kurma, ambalajı saklama — Yuvo'nun günlük çekirdek törenine
> dönüşür. Bu doküman `docs/06 §2`'deki 5 vuruşluk törenin **v2 revizyonudur**: onu silmez,
> içine yerleştirir ve iki yeni katman ekler (Ambalaj Defteri + araç/ambalaj kozmetik ekonomisi).
>
> **Bağlar:** oranlar/pity → [v2·02 §2.2](02-koleksiyon-sistemi-ve-algoritma.md) ·
> FTUE/tempo → [v2·04 §1](04-oyun-akisi-ve-zorluk.md) · fiyat/mağaza kuralları →
> [v2·05](05-magaza-ve-yumurta-paketleri.md) · ekonomi sayıları → `docs/08` ·
> prototip sözleşmesi → [`prototype/ARCHITECTURE.md`](../../prototype/ARCHITECTURE.md).

## 0. Araştırma Özeti (iki araştırmacının bulguları → tasarım kararları)

| # | Bulgu (kaynak: ARAŞTIRMA-1/2) | Bu dokümandaki karar |
|---|---|---|
| 1 | ASMR/unboxing türü kanıtlı sıcak (Mystery Dumpling 2026'da #1, 5,7M/ay) ama **reklamla zehirlenmiş**; reçete: katman katman ilerleme + crinkle/reveal ses kontrastı + fizikli parçalar + kendi hızında | Ritüel 6 aşamalı katman merdiveni; üç katmanlı ses sözlüğü (doku/olay/doruk); folyo ve kapsül parçaları rigidbody gibi düşer; süre baskısı yok; reklam sıfır |
| 2 | Kinder resmî uygulaması (Applaydu) **açma anını dijitalleştirmiyor**; klonlar tek atımlık folyo-kazı/ısır/pop uygulamaları — tören var, dünya/koleksiyon yok | Boşluk bizim: "tören + dünya + koleksiyon" birleşimi ana iddia; klonların 3 perdesi (folyo→çikolata→kapsül) alınır, anlam katmanı eklenir |
| 3 | Hatchimals: ovala→renk döner→"hazır"→çatlat; kabuk tabanı yuvaya dönüşür | Kapsülün alt yarısı Pufi'nin ilk yuva çanağı olur; "hazır olma" sinyalleri okumasız (renk/ışık) |
| 4 | Çocuk jest araştırması: tap en güvenilir; sürtme/kazıma sevilir ama hedef alan büyük olmalı; double-tap kafa karıştırır; cihazı fiziksel sallama erişilebilir değil | Jest seti: tap + büyük alanlı sürükleme/sürtme; "sallama" ekranda basılı-tut ile tetiklenir (accelerometer yok); her jestin tap fallback'i (ARCHITECTURE kuralı) |
| 5 | Pop Mart POP NOW: Pick a Box → **Shake for Hints** → Unbox; sallama açmaz, **dürüst daraltıcı ipucu** verir; mağazadan bile eğlenceli bulundu | Vitrinde yumurta ele alınıp sallanabilir; tıkırtı sesi aileyi fısıldar, nadirliği asla |
| 6 | TCG Pocket skandalı: paket seçimi kozmetikti, içerik önceden belirliydi → "orkestre edilmiş performans" tepkisi. Klusowski 2021: seçim kazanma yanılsaması yaratmasa da **tatmini artırır** | Dürüstlük sözleşmesi (§1.3): seçim aile havuzunu gerçekten belirler, nadirlik seçim anında henüz **çekilmemiştir** — ambalaj nadirlik sızdıramaz çünkü sızacak bilgi yok |
| 7 | L.O.L.: 7 katman, her katman **farklı tür** ödül; yorgunluk katman sayısından değil **katman sonunda yenilik çıkmamasından** | Katman eklemedik (6 aşama yeter); her açılışta ≥1 beklenmedik mikro-an garantisi; kopyada "boş katman" hissi yasak (kısaltılmış akış + Kabuk animasyonu) |
| 8 | Gacha reveal UX: "oyuncu tıklayıp geçiyorsa animasyon uzundur"; çoklu açılışta yalnız en nadir tam animasyon; toplu açma talebi evrensel, auto-open tören kimliğini öldürür | Tempo merdiveni (§3): tam ritüel → hızlı mod (<10 sn) → sepet akışı (en nadire tam tören); auto-open ASLA |
| 9 | Monopoly GO lisanslı albümler + Fortnite/Kinder emsalleri: lisans tek obje değil **sezonun kendisi**; Kinder'in kendi büyüme motoru zaten lisanslı ambalaj serileri | Folyo "Seri Paneli" = değiştirilebilir lisans alanı; sponsorluk CPM değil **sezonluk seri sözleşmesi** (§4.2) |
| 10 | Wonka/Cadbury altın bilet: kıtlık + herkesin haberi; Brawl Stars dersi: altın **kazanılır, satılmaz**; Roblox u13 emsali: programatik yok, etiketli, doğrudan anlaşma | Altın Folyo: tek havuz + ilan edilmiş oran + sezon pity'siyle herkese ≥1 (FOMO'suz Wonka, §2.f); sponsorluk yalnız beyanlı/etiketli, Faz 2 (§4.4) |
| 11 | Pop Mart telif modeli %5–15 + asgari garanti; Panini: ambalajın kendisi koleksiyon nesnesi; Hearthstone kart sırtları: oynanışa dokunmayan ikincil koleksiyon | Ambalaj Defteri (ikincil, saf kozmetik koleksiyon); sponsor fiyatlama çerçevesi Pop Mart bandında |
| 12 | Koleksiyon aşaması ilerledikçe "heyecan"dan "kontrol"e kayış; ritüel alanı bırakılınca oyuncular kendi uğur ritüellerini icat ediyor (Hearthstone) | Çıtlatma öncesi serbest mikro-etkileşimler (okşama, Pufi'ye gösterme) ödülsüz ama animasyonlu; telemetriyle izlenir, en yaygını sezonda resmî animasyon olur |

## 1. Tasarım Çerçevesi

### 1.1 İki tören dili — "Posta Yumurtası" ve "Yuva Yumurtası"

| | **Posta Yumurtası** (bu doküman) | **Yuva Yumurtası** (docs/06 §2 klasik) |
|---|---|---|
| Ne zaman | Günlük standart yumurtalar (vitrin/sepet, kilerden gelenler dahil) | FTUE ilk 3 yumurta, kuluçka ("yarın sürprizi"), Aile Şenliği yumurtası, Altın Yumurta Töreni finali |
| Fantezi | Market/sürpriz yumurta simülasyonu: ambalaj → çikolata → kapsül → oyuncak | Canlı yumurta: ovala-ısıt → çıt çıt ÇITT → Pufi çıkar |
| Duygu | Merak + sahiplik + koleksiyon hazzı | Şefkat + bakım + doğum anı |
| Gerekçe | Kullanıcı vizyonu; tür talebi kanıtlı (§0#1-2) | FTUE'nin "<60 sn ilk çıtlama" ve şefkat çerçevesi bozulamaz (v2·04 §1) |

**Eşleme — docs/06 §2'nin beş vuruşu yeni akışta yaşamaya devam eder:**

| docs/06 §2 vuruşu | v2 ritüeldeki karşılığı |
|---|---|
| 1. Seçim (kabuk deseni fısıldar) | a. Vitrin/Seçim (ambalaj deseni + salla-dinle fısıldar) |
| 2. Isıtma (ovalama) | b. Folyo Yırtma (aynı dokunsal ısınma işlevi; sürtme jesti korunur) |
| 3. Çıtlama ("çıt… çıt… ÇITT!") | c+d. Çikolata ısırıkları = "çıt çıt" ritmi; kapsül açılışı = "ÇITT!" doruk (çekiç yöntemi ritim halkalarını birebir taşır) |
| 4. Karşılaşma | d sonu / e başı: Pufi kapsülden esneyerek çıkar |
| 5. Parçalar → birleştirme | e. Oyuncak + Birleştirme (mevcut sahne, değişmez) |
| — (yeni) | f. Ambalaj Defteri (koda: folyo saklanır) |

### 1.2 Lore köprüsü (şefkat çerçevesi korunur)

Ovalya'da yumurtalar adaya **Rüzgâr Postası balonuyla** sarılı gelir (v2·05'teki "kargo balonu"
görseliyle aynı dil — satın alınan ve kazanılan yumurta ayırt edilemez, guardrail korunur):

- **Folyo** = "yıldız folyosu": yumurtayı yolculukta sıcak tutan sargı. Çocuk folyoyu açarak
  ısıtma görevini devralır (ısıtma vuruşunun anlam devri).
- **Çikolata** = "güneş çikolatası": Pufi'nin yol azığı. Pufi yolculukta doymuştur, **kalanı
  çocuğa bırakmıştır** — canlı bir yaratığın kabuğunu yeme tuhaflığı böylece hiç doğmaz.
- **Kapsül** = "tomurcuk beşiği": Pufi içinde kıvrılmış uyur, oyuncağının parçaları yanındadır.
  Kapsülü açmak = nazikçe uyandırmak. Alt yarısı Pufi'nin ilk yuva çanağı olur (çöp değil,
  sevgi nesnesi — Hatchimals dersi).

### 1.3 Dürüstlük sözleşmesi ve ipucu merdiveni

v2·02 §2.2 gereği **nadirlik, açılış anında** (HMAC + kullanıcı sayacı) çekilir; vitrinde henüz
mevcut değildir. Aile/biyom havuzu ise yumurta **verildiği anda** bellidir (`kaynakBiyom`).
Bundan dört bağlayıcı kural çıkar:

1. **Ambalaj aile/seri söyler, nadirlik SÖYLEMEZ.** Gerekçeler: (a) *sistem gerçeği* — nadirlik
   vitrin anında var olmadığı için ambalaja yazmak yalan olurdu; TCG Pocket'ın "sahte seçim"
   skandalının tersi konum; (b) *duygu eğrisi* — doruk kapsülde kalmalı, vitrinde sızarsa tören
   ölür; (c) *sosyal koruma* — kardeş/arkadaş yan yana bakarken "senin sepetin kötü" kıyası
   üretmemek; (d) *v2 guardrail* — satın alınan yumurta görsel ayırt edilemezliği, ambalaja
   nadirlik binerse çöker.
2. **Seçim gerçektir:** hangi yumurtanın hangi aile havuzundan açılacağını çocuk belirler
   (ambalaj ipucu doğrudur); açılış sırası nadirliği etkilemez ve bunun aksi asla ima edilmez.
   (Klusowski bulgusu: seçim, sonucu değiştirmese de töreni "çocuğun yönettiği" şeye çevirir —
   dürüst çerçevede bile tatmin üretir.)
3. **İpucu merdiveni** (her basamak bir öncekinden fazlasını, asla erken söylemez):

   | Basamak | Kanal | Ne söyler | Dürüstlük dayanağı |
   |---|---|---|---|
   | Salla-dinle | Ses (tıkırtı) | Aile *daraltması* ("tüylü bir şey…") | `kaynakBiyom` verilme anında belli |
   | Folyo deseni | Görsel (Aile Bandı) | Seri + aile | Aynı |
   | Kapsül iç ışıması | Renk | Nadirliğin **ilk** sinyali | Çekiliş folyo aşamasında yapıldı, sonuç artık var |
   | Açılış | Sahne | Kimlik + kutlama tier'ı | — |

4. Bu sözleşme Şeffaflık Kartı'na tek cümleyle yazılır: *"Ambalaj hangi aileden olduğunu
   fısıldar; ne çıkacağı sen açana kadar hiç kimse tarafından bilinmez."*

## 2. Ritüel Akışı — 6 Aşama

**Duygu koreografisi:** merak → sahiplik → tat → gerilim → sevgi → gurur.
**Süre bütçesi:** tam ritüel (günün ilk yumurtası) 25–35 sn + birleştirme; hızlı mod < 10 sn (§3).
**Genel atlama grameri (tüm aşamalarda aynı):** tek dokunuş = mevcut aşamayı anında tamamla;
çift dokunuş = sonraki aşamaya geç (prototipteki mevcut kuralın devamı). Hiçbir aşama kilitli
bekletmez; Destansı+ açılışlarda Kiki tek satırlık nazik fren koyar ("Bunu kaçırma!") ama atlama
yine mümkündür.

### 2.a Vitrin / Seçim — "Postan geldi!"

| Boyut | Tasarım |
|---|---|
| Etkileşim | Günün yumurtaları (3 temel + görev/kiler ekleri) **Balon Postanesi tezgâhında** ambalajlı durur; minik bant üzerinde hafifçe kayar. Çocuk yumurtaya dokununca **eline alır** (yumurta büyür, ekran ortasına gelir); **basılı tutunca sallar** — içeriden aile-tıkırtısı gelir; ikinci dokunuşla seçer (ritüel başlar) ya da geri koyar. |
| Süre | Serbest; tipik 5–10 sn; sallama isteğe bağlı +3–5 sn |
| Ses | Bant tıkırtısı, folyo crinkle'ı (elde çevirdikçe), aile-tıkırtısı: tüy hışırtısı (Pofuduk), su şıpırtısı (Koy), yaprak hışırtısı (Orman), çan-çıngıltı (Çayır), buz çınlaması (Buz), kum tıkırtısı (Kanyon) — ses aileyi söyler, nadirliği asla |
| Duygu | Merak + ajans ("töreni ben yönetiyorum") |
| Atlama | Vitrin atlanmaz ama sıfır sürtünmelidir: tek dokunuş + onay ile 1,5 sn'de yumurta seçilebilir; sallama tamamen isteğe bağlı |

- **Günlük an:** Kiki'nin sabah repliği — *"Postan geldi! Üçünden birini seç bakalım…"* Günün
  ilk seçimi küçük bir ritüel çapasıdır (kahvaltı masasında yumurta seçmenin dijital karşılığı).
- Serbest mikro-etkileşimler ödülsüz ama animasyonlu: yumurtayı okşama (mırıltı), Pufi'ye
  gösterme (Pufi koklar), öpme (kalp parçacığı). Telemetriyle izlenir; en yaygın "uğur" jesti
  sezon içinde resmî animasyona terfi eder (§0#12).
- Ek yumurtalar (görev ödülü, kilerden düşen) gün içinde vitrine **aynı ambalaj diliyle** eklenir;
  kaynak ayrımı görünmez (v2·04 guardrail d).

### 2.b Folyo Yırtma — kademeli soyma ASMR'ı

| Boyut | Tasarım |
|---|---|
| Etkileşim | Folyo kıvrımlı ve ışık yansımalı (specular sweep). Yırtma **kulakçıktan** başlar: parmakla çekilen her sürükleme bir **şerit** koparır (3 şerit = tam soyulma). Şeritler buruşarak kenara düşer, kısa süre dokunulabilir kalır (itince hışırdar). Fallback: kulakçığa tap = 1 şerit. |
| Süre | 6–8 sn (3 şerit) |
| Ses | Şerit başına "cırt" + sürekli crinkle dokusu (parmak hızıyla modüle); son şeritte kısa parlak "reveal" tınısı. Haptik ses dalgasından türetilir (olay büyüklüğüyle orantılı) |
| Duygu | Sahiplik + dokunsal haz ("bunu ben açıyorum") |
| Atlama | Tek dokunuş = kalan şeritler tek harekette soyulur (1 sn); hızlı modda folyo zaten tek şerittir |

Nadirlik çekilişi (`openEgg()`) **bu aşamanın başında** yapılır ve saklanır; görsel sonuçlar
(kapsül ışıması, kutlama tier'ı) buradan beslenir — vitrin aşaması sonuca asla erişmez (§1.3).

**AMBALAJ TASARIM ŞABLONU** — her folyo aynı 5 bölgeden oluşur:

```
┌────────────────────────────┐
│ A · MARKA KİLİDİ  (üst %12)│  Yuvo logotipi + yumurta amblemi — SABİT, dokunulamaz
├────────────────────────────┤
│                            │
│ B · SERİ PANELİ   (~%50)   │  Serinin sanat alanı — DEĞİŞTİRİLEBİLİR
│                            │  (öz-markalı seri VEYA ileride sponsor/lisans alanı)
├────────────────────────────┤
│ C · AİLE BANDI    (%15)    │  Aile desen dili (benek/dalga/yaprak/kristal…) — SİSTEM ÜRETİR
├────────────────────────────┤
│ D · YIRTMA KULAKÇIĞI       │  Başlangıç kulakçığı + 3 perforasyon çizgisi — SABİT
├────────────────────────────┤
│ E · ALT BİLGİ     (%8)     │  Seri adı + defter simgesi + (sponsorluysa) "işbirliği" rozeti
└────────────────────────────┘
Arka yüz: serinin mini albüm görseli; ebeveyn panelinde aynı serinin Şeffaflık Kartı bağlantısı.
```

**Bölge kuralları:** A/C/D hiçbir seride (sponsorlu dahil) değişmez — A marka güveni, C dürüst
aile ipucu, D öğrenilmiş jest alanıdır. Sponsor yalnız B+E'ye dokunabilir. B **asla nadirlik
kodlamaz** (renk parlaklığı dahil). Altın Folyo (§2.f) tüm bölgelerin üstüne binen tek istisnadır.

**Yuvo öz-markalı 6 ambalaj serisi (Sezon 1):**

| Seri | Tema / palet | Takvim yeri |
|---|---|---|
| **Güneş Bahçesi** | Sıcak sarı-turuncu, papatya-çayır gravürü | Varsayılan; Çayır/Orman haftaları |
| **Masal Ormanı** | Koyu yeşil-altın yaprak filigranı | Orman dalgası + Şako Avı haftaları |
| **Sedef Dalgalar** | İnci-turkuaz dalga kabartması | Koy dalgası |
| **Yıldız Tozu Gecesi** | Lacivert-gümüş takımyıldız deseni | Göl/gece haftaları; Luna teması |
| **Kar Işıltısı** | Buz mavisi-beyaz kristal | Buz dalgası + yılbaşı |
| **Şenlik Fenerleri** | Kırmızı-altın fener ve konfeti | Bayramlar + Aile Şenliği cumartesileri |

Her serinin **8 desen varyantı** vardır (renk yolu + köşe rozeti farkları) → Ambalaj Defteri'nin
sayfa matematiğini kurar (§2.f). Varyant, yumurta verilirken atanır ve deftere işlenir.

### 2.c Çikolata — "Isır!" ya da biriktir

| Boyut | Tasarım |
|---|---|
| Etkileşim | Folyo altından çikolata yumurta çıkar (mat kakao dokusu, üstünde Yuvo güneş kabartması). Her dokunuş dokunulan noktada **ısırık izi** bırakır (3–4 ısırık → kapsül görünür). Alternatif buton: **Çikolata Kumbarası** 🫙 — çikolata bütün hâlde kavanoza uçar, kapsül doğrudan açığa çıkar. Filiz (4–6) modunda iki büyük buton: "Ye!" / "Biriktir!". |
| Süre | 4–6 sn (ısırıklar) veya 2 sn (kumbara) |
| Ses | Isırıkta "kıtır" + minik "mmm"; kumbarada cam tıngırtısı + kapak sesi. "Mmm" abartısız — iştah reklamı değil, tat mizahı |
| Duygu | Tat + mizah (Pufi kapsülün içinden gıdıklanmış gibi kıkırdar) |
| Atlama | Tek dokunuş = kalan ısırıklar tek lokmada ("Ham!" + büyük mmm); hızlı modda varsayılan davranış çocuğun son tercihidir (yediyse tek ısırık, biriktirdiyse otomatik kumbara) |

**Ekonomi (docs/08 ile tutarlı):** Her ambalajlı yumurtadan 1 çikolata çıkar.
- **Yerse:** ısırık başına 2⭐ → yumurta başına 6–8⭐ (günlük ⭐ tavanı 200'ün içinde; çikolata
  kaynaklı ⭐ günde en fazla 40).
- **Biriktirirse:** kumbara sayacı +1. **15 çikolata = "Çikolata Şöleni"** → 1 bonus yumurta
  (günde en fazla 1 dönüşüm; günlük açılış tavanına sayılır). Denge: 15 çikolata yenseydi
  ~90–120⭐ ederdi ≈ ek yumurta fiyatı 120⭐ (docs/08) — sabır küçük bir prim + şölen töreni
  kazanır, enflasyon üretmez.
- Kumbara camdan bir kavanozdur; doluluk okuma gerektirmeden görülür (goal-gradient).

**Diş sağlığı yumuşatma notu (abartısız):** Isırıklar stilize ve ödül-minör tutulur (⭐ akışının
%5'inden azı); "şeker ye" teşvikine dönüşmez, gerçek dünyada yeme çağrısı yoktur ve metinlerde
tatlandırılmış özendirme dili kullanılmaz. Ebeveyn panelinde **"çikolatasız mod"** anahtarı:
açıksa folyo altından doğrudan kapsül çıkar, çikolata sessizce kumbaraya işlenir (ekonomi
bozulmaz). Duyusal hassasiyet ayarlarıyla aynı panel bölümünde durur.

### 2.d Kapsül Açma — yöntem seçimi ve doruk

**Kapsül tasarımı (hukuk notu):** Kinder'ın sarı-turuncu iki parçalı kapsülünün ticari görünümü
(trade dress) **kopyalanmaz**. Yuvo kapsülü = **"Tomurcuk Kapsülü"**: armut/tomurcuk formu,
mat turkuaz gövde + mercan kapak, tepesinde minik yaprak sapı (çevirme tutamacı). Nadirlik,
kapsülün **iç ışıma halkasında** belirir (RARITIES renkleri) — ipucu merdiveninin 3. basamağı.

| Boyut | Tasarım |
|---|---|
| Etkileşim | Aktif araç/yönteme göre (aşağıda). Kapsül açılınca iki yarım fizikle ayrılır; alt yarım sahnede kalır (yuva çanağı) |
| Süre | 4–8 sn (yönteme göre) |
| Ses | Yönteme özel doku + ortak doruk: "POP!" + konfeti + tier fanfarı |
| Duygu | Gerilim → doruk (törenin zirvesi burasıdır; vitrinden beri saklanan cevap açılır) |
| Atlama | Çift dokunuş = anında POP. Destansı+ ışımada Kiki freni: "Bunu kaçırma!" (tek satır; atlama yine serbest) |

**Açma yöntemleri (jest karmaşıklığı sabit, doku değişken):**

| # | Yöntem | Jest | Ses imzası | Açılış |
|---|---|---|---|---|
| 1 | **Burgu-çevir** (varsayılan) | Yaprak sapını iki parmakla çevir *veya* dairesel sürtme (tek parmak fallback) | "gıc… gıc… POP!" | Baştan açık |
| 2 | **Oyuncak çekiç: tık-tık-KIRT** | 3 ritim halkasına tap (docs/06 çıtlama ritminin birebir mirası) | "tık… tık… KIRT!" | D2 (Bekçi Seviyesi günü) |
| 3 | **Salla-fırlat-patlat** | Basılı tut → salla animasyonu → bırak → kapsül yumuşak zıplar, patlar | Çıkırtı + zıplama + "PAT!" | D5 (Atölye günü) |
| 4 | **Sihirli dokunuş** | Parmağını bas ve 2 sn tut → ışık büyür → kapsül çiçek gibi kendiliğinden açılır | Yükselen parıltı + nazik "fış-POP" | Destansı+ kapsüllerde otomatik teklif; **satılmaz** |

**Kozmetik araç ekonomisi:** Araçlar yalnız animasyon/ses/parçacık değiştirir; **oran, hız veya
ödüle asla dokunmaz** (Şeffaflık Kartı'nda yazılı). "Cephanelik/güç" fantezisi bilinçli reddedildi
(4–8 yaş şefkat çerçevesi); araç = tören kişiselleştirme aksesuarıdır. Çocuk mağaza görmez:
kilitli araçlar **Araç Rafı'nda** silüet olarak durur, Dilek Kavanozu'na atılabilir; fiyat yalnız
ebeveyn panelinde görünür (v2·05 §2.1 düzeni).

| Araç | Kanal | Fiyat / bedel | Not |
|---|---|---|---|
| Temel Burgu, Tahta Çekiç | Ücretsiz | — | Varsayılan set |
| Sedef Burgu | Oyun içi | 40 🐚 | Her sezonda ≥2 araç oyunla kazanılabilir kuralının parçası |
| Yıldız Tozu Çekici | Etkinlik ödülü (Şako Avı) | — | Satılmaz; statü |
| Gökkuşağı Burgusu | Ebeveyn mağazası | ₺24,99 | Gökkuşağı iz parçacıkları |
| Altın Çekiç | Ebeveyn mağazası | ₺34,99 | Altın şerit + çan tınısı |
| Kar Küresi Fırlatıcısı | Ebeveyn mağazası (Buz sezonu) | ₺29,99 | Salla-fırlat varyantı; kar patlaması |
| Bayram Anahtarı | Şenlik Fenerleri paketi içeriği | Paketle | Deterministik paket tatlandırıcısı |
| Ayın Aracı | Yuvo Club | Ayda 1 hediye | Club tutundurması (v2·05 §1.7 ile uyumlu) |

Fiyat bandı ₺19,99–39,99 (listeli saf kozmetik, v2·05 dili); "en pahalı araç en havalı animasyon"
merdiveni kurulmaz — fiyat farkı üretim maliyetiyle, statü farkı **kazanılan** araçlarla taşınır.

### 2.e Oyuncak + Birleştirme — karşılaşma ve yetkinlik

| Boyut | Tasarım |
|---|---|
| Etkileşim | Kapsül açılınca **Pufi esneyerek çıkar, çocuğa bakar, güler** (docs/06 karşılaşma vuruşu aynen); oyuncak parçaları (3–6) kapsülden saçılır → mevcut **birleştirme masası** sahnesi (docs/06 §3, prototipteki `assembly`) değişmeden devralır |
| Süre | Karşılaşma + kart 6–8 sn (tier'a göre uzar); birleştirme 60–90 sn (mevcut) |
| Ses | Aile şarkı motifi + tier fanfarı; birleştirmede mevcut "klik + parıltı" |
| Duygu | Sevgi + sevinç → yetkinlik |
| Atlama | Kart tek dokunuşla geçilir; kopyada karşılaşma otomatik kısalır: Pufi el sallar, parça doğrudan Kabuk'a dönüşen 1,5 sn mini animasyon oynar ("boş katman" hissi yasak — §0#7) |

**Profesyonelleşme notları:**
1. **Kapsül çanağı = ilk yuva:** kapsülün alt yarısı Pufi'yle birlikte yuva sahnesine taşınır ve
   dekor öğesi olur (docs/06 §5 dekorasyona bağlanır); kapsül asla "çöp" olmaz.
2. **Beklenmedik mikro-an garantisi:** açılışların ~1/5'inde küçük senaryosuz sürpriz — kapsülden
   kelebek uçar, Pufi hapşırır, kapsül içinde mini desen görünür, folyo şeridi kuş olur uçar.
   (L.O.L. "her katman farklı tür" ilkesinin dijital karşılığı; havuz sezonla tazelenir.)
3. **Nadirlik kutlama merdiveni mevcut sistemle aynı** (celebrationTier 0–3); Efsanevi'de ada
   müziği değişir, gökyüzüne ışık vurur (docs/06).
4. Birleştirme sonrası dönüşte defter yapıştırma kodası oynar (§2.f) — döngü "gurur"la kapanır.

### 2.f Ambalaj Defteri — ikincil koleksiyon + Altın Folyo

| Boyut | Tasarım |
|---|---|
| Etkileşim | Kart ekranından sonra yırtık folyo kendini düzeltir, süzülerek **Ambalaj Defteri'ne** uçar, "şlap" diye yapışır (2–3 sn koda). Defter ayrı sahnedir: sayfa = seri; her sayfada 8 varyant yuvası + 1 **Altın Şeref Yuvası** |
| Süre | Koda 2–3 sn; defter gezintisi serbest |
| Ses | Kâğıt düzelme hışırtısı + "şlap" + sayfa sesi |
| Duygu | Gurur + birikim ("hiçbir şey kaybolmuyor") |
| Atlama | Hızlı modda koda toast'a iner ("Folyon deftere yapıştı 📔", 0,5 sn) |

- **Otomatik ve kayıpsız:** açılan her folyo yapışır; ekstra işlem istenmez. Kopya varyant =
  sayaç rozeti (×n). **5 kopya folyo = 1 duvar kâğıdı dekoru** (yuva süsü; takas yerine
  dönüştürme — sosyal takas yasağı docs/06 §8 korunur).
- **Seri tamamlama ödülleri (deterministik):** 4/8 → serinin kabuk deseni kozmetiği; 8/8 →
  serinin araç kozmetiği *veya* dekor seti (seçmeli) + defter kapağına seri mührü. Sezon sonunda
  eksikler Müze'den tamamlanabilir (FOMO yasağı, v2·04 §3).
- Defter saf kozmetik/ikincil katmandır: albüm (300 parça) matematiğine, oranlara ve pity'ye
  **hiçbir etkisi yoktur** (Hearthstone kart sırtı emsali).

**ALTIN AMBALAJ ETKİNLİĞİ — "FOMO'suz Wonka":**

| Parametre | Değer | Gerekçe |
|---|---|---|
| Oran | Her açılışta 1/250 (%0,4) — **tek havuz**: kazanılan ve satın alınan yumurtada aynı | v2·05 "tek havuz, tek gerçek" ilkesi; altın avı için harcama teşviki doğmaz (tavan mimarisi zaten kısıtlar) |
| Sezon pity | 250 açılışta garanti → medyan çocuk (sezonda ~350–420 açılış) **kesin bulur** | Wonka kıtlık hissi oranla, adalet pity'yle: "Bu sezon her Bekçi en az bir altın folyo bulur; şanslılar iki-üç" — Şeffaflık Kartı'nda ilan edilir |
| Sahneleme | Folyo aşamasında ilk şerit yırtılınca altın parlar; özel fanfar; ada 10 sn altın ışıkta | Cadbury "her bulunuş haber olur" etkisinin oyun içi karşılığı; ebeveyn e-postasına kutlama satırı düşer |
| Ödül | Defterde Altın Şeref Yuvası + **seçmeli araç kozmetiği** + altın yuva süsü + "Altın Bekçi Günü" rozeti | Oynanış avantajı yok; statü + seçim hakkı |
| Sezon sonu | Bulunan altın folyolar Müze'de "Altın Anı" vitrinine taşınır | Kaçırma yapısal olarak imkânsız |
| (Faz 2) Sponsorlu varyant | Sponsor kampanyası altın folyoya **fiziksel ödül** bağlayabilir (ebeveyn onaylı teslim) | §4.2; hukuk görüşü sonrası |

## 3. Tekrar Açılışlarda Tempo

Dayanak: reveal-UX kuralı "oyuncu tıklayıp geçmeye çalışıyorsa animasyon uzundur"; L.O.L.
bulgusu "yorgunluk katmandan değil, katman sonunda yenilik çıkmamasından"; toplu açma talebinin
evrenselliği ve auto-open'ın tören kimliğini öldürmesi (§0#7-8).

| Kip | Tetik | Davranış | Hedef süre |
|---|---|---|---|
| **Tam ritüel** | Günün ilk yumurtası | 6 aşama tam sahneleme (§2) | 25–35 sn + birleştirme |
| **Hızlı mod** | Aynı gün 2.+ yumurta (otomatik) | Vitrin tek dokunuş → folyo **tek şerit** → çikolata son tercihe göre otomatik (tek ısırık / kumbara) → kapsül tek jest → kısa karşılaşma → defter toast'ı | **< 10 sn** (bütçe: 1+2+1,5+2+2,5+0,5) |
| **Sepet akışı** | Vitrinde 3+ yumurta birikmişse "Arka arkaya aç" seçeneği | Yumurtalar 4'er sn'lik özle açılır; **yalnız en nadir sonuç tam töreni alır** (gacha reveal kuralı); birleştirmeler sona kuyruklanır | yumurta başına ~4 sn |
| **Nazik fren** | Destansı+ veya ilk-tür parça | Hangi kipte olursa olsun o yumurta tam törene yükselir; Kiki: "Bunu kaçırma!" — atlama hakkı yine saklı | — |
| **Auto-open** | — | **ASLA eklenmez** (Pet Sim 99 verim yolu = tören kimliğinin ölümü) | — |

Kurallar: (1) hızlı mod bir "ceza" değil varsayılan zarafettir — çocuk istediği yumurtada
"Töreni izle" ile tam ritüele dönebilir; (2) aşama-atlama oranı yaş moduna göre telemetrilenir;
bir aşamanın atlanması segmentte eşiği (%40) aşarsa tepki **süreyi kısaltmaktır, töreni
zorlamak değil**; (3) FTUE'de hızlı mod D1'den önce açılmaz (öğrenme bütünlüğü).

**FTUE yerleşimi (v2·04 §1 korunur):** D0'ın senaryolu 3 yumurtası klasik "Yuva Yumurtası"
töreniyle oynanır (ilk çıtlama < 60 sn ve sessiz ustalık sınavı bozulmaz). İlk ambalajlı ritüel
**D1 sabahı** gelir: Rüzgâr Postası balonu iner, Kiki tanıtır, her aşama tek ipucuyla oynatılır.
D1'den sonra günlük standart akış Posta Yumurtası'dır; kuluçka/şenlik/final yumurtaları Yuva
töreninde kalır (§1.1).

## 4. Gelir Haritası

### 4.1 ARAŞTIRMA-2 fikirlerinin elenmesi (v2·05 modeline yerleşim)

| Fikir | Karar | Gerekçe / yerleşim |
|---|---|---|
| 1. Sponsorlu Sezon Serisi | **Kabul — Faz 2** | Seri Paneli mimarisi hazır (§2.b); sözleşme modeli §4.2 |
| 2. Sinema Lansman Kapsülü | **Kabul — Faz 2** | v2·05 §1.4 biyom paketi şablonuyla (₺59–69); "kaçırdın" dili yasak — seri Müze'ye taşınır |
| 3. Altın Folyo kampanyası | **Kabul (uyarlanmış) — çekirdek Faz 1, sponsor Faz 2** | "Yalnız kazanılan açılışlarda" fikri **reddedildi** — tek-havuz ilkesini bozar; tek havuz + sezon pity ile uygulanır (§2.f) |
| 4. Folyo Albümü | **Kabul — Faz 1** | Ambalaj Defteri (§2.f); sponsor sayfaları Faz 2 |
| 5. Koleksiyoncu açma araçları | **Kabul — Faz 1** | Araç kozmetiği ekonomisi (§2.d); ₺19,99–39,99 + Club aylık hediye |
| 6. Marka Adası Köşesi (kalıcı marka alanı) | **RED** | Dünya bütünlüğü + çocuk-reklam çizgisi: Ovalya'da kalıcı marka coğrafyası olmaz; sponsorluk folyo/kapsül/defterle sınırlı "misafir" katmandır |
| 7. Retro Folyo Arşivi | **Kabul — Faz 1,5** | Müze'de sergilenir; deterministik "Arşiv Sayfası Paketi" ₺39,99 (FOMO telafisi ilkesiyle birebir) |
| 8. Hediye folyosu kişiselleştirme | **Kabul — Faz 1,5** | v2·05 §1.5 hediye sarma ekranına premium folyo deseni ₺9,99; bayram serisi sponsoru Faz 2 |
| 9. Folyo Takas Panayırı | **RED** | Takas yasak (docs/06 §8, v2·02); dönüştürme (5 kopya = duvar kâğıdı) yeterli emniyet supabı |
| 10. Şeffaf Sponsor Raporu | **Kabul — Faz 2** | Aylık ebeveyn e-postasına satır (v2·05 §2.5; upsell yasağı korunarak) |

### 4.2 Sponsorlu seri mimarisi (kim, ne satın alıyor, nasıl fiyatlanır)

**Ürün:** Vitrindeki yumurtaların **Seri Paneli (B) + Alt Bilgi (E)** alanları, kapsül teması ve
defter sayfası — bir **sezonluk seri sözleşmesiyle** markaya kiralanır. Sponsor yoksa öz-markalı
6 seri döner; sponsor her zaman "misafir"dir, ev sahibi değil (sponsorluk geliri hedefi: toplam
gelirin ≤ %15'i).

| Kademe | Sponsor ne alır | Fiyatlama modeli |
|---|---|---|
| **Seri Lite** (4 hafta) | 1 folyo serisi (8 varyant) + defter sayfası + "işbirliği" rozeti | Sabit dönem ücreti |
| **Sezon Ortağı** (12 hafta) | Seri + kapsül tema kaplaması + temalı deterministik paket (v2·05 §1.4 şablonu, ₺59,99–69,99) | Sabit sezon ücreti + temalı paket net satışından **%10 telif** (Pop Mart %5–15 bandı) + asgari garanti |
| **Premier / Lansman Senkron** | Sezon Ortağı + vizyon haftası kapsülü + Altın Folyo fiziksel ödül kampanyası (ebeveyn onaylı teslim) | Sabit + stüdyonun medya bütçesinden kampanya ücreti + telif |

**Neden CPM değil:** (a) gösterim başı ölçüm davranışsal veri toplamayı gerektirir → COPPA/Kids
kategorisiyle çelişir; (b) CPM dili ürünü "reklam envanteri"ne çevirir — bizim ürünümüz Kinder×
Minions modelindeki gibi **lisanslı koleksiyon içeriğidir**: çocuk tarafında reklam yok, koleksiyon
var; ebeveyn tarafında açık sponsorluk beyanı var. (c) Sezonluk sabit + telif, geliri DAU
dalgasından bağımsız öngörülebilir kılar (SaaS benzeri satır).

**Kimler alıcı:** çocuk sineması/animasyon stüdyoları (lansman senkronu), oyuncak ve kitap/yayın
markaları, müze-eğitim kurumları. **Kabul edilmeyenler:** şekerleme/HFSS gıda, kumar-bitişik her
kategori, yaş-uygunsuz IP'ler, hızlı tüketim teşviki kurgusu olan kampanyalar. Her sponsorlu
serinin kendi Şeffaflık Kartı vardır (Apple/Google oran kuralı paket bazında zaten karşılanıyor —
v2·05 §1.4).

### 4.3 Ritüel gelir kalemleri özeti (v2·05 karışımına yerleşim)

| Kalem | Faz | Fiyat | v2·05 karışımındaki yeri |
|---|---|---|---|
| Araç kozmetikleri | 1 | ₺19,99–39,99 | "Deterministik/kozmetik %10" kalemi içinde |
| Hediye premium folyo sarma | 1,5 | ₺9,99 | Hediye kanalı (%15–20 hedefini büyütür) |
| Arşiv Sayfası Paketi (Müze) | 1,5 | ₺39,99 | Deterministik uzun kuyruk |
| Temalı sponsor paketi | 2 | ₺59,99–69,99 | Biyom paketi şablonu; telifli |
| Seri sponsorluk sözleşmeleri | 2 | Sabit + %10 telif | Yeni satır: hedef toplam gelirin ≤ %15'i |
| Club araç hediyesi | 1 | Club içinde | Abonelik tutundurma (kanibalizasyon değil sinerji) |

Çocuk tarafında hiçbir kalemin fiyatı görünmez; tüm satın almalar Dilek Kavanozu → ebeveyn paneli
akışından geçer; aylık limit, ters whale alarmı ve iki-dokunuşta-bitmeyen onay aynen geçerlidir
(v2·05 §2). Kural tekrarı: **hiçbir araç/ambalaj ürünü oranlara, pity'ye veya açılış hızına
dokunmaz** — hepsi Şeffaflık Kartı'nda "yalnızca görünüm" ibaresiyle listelenir.

### 4.4 Uyum notu (kısa)

Hukuk/mevzuat değerlendirmesi kullanıcı kararıyla **ertelenmiştir** (v2 README "Açık Konular");
sponsorlu seriler bu görüş alınana dek tasarım rafında bekler, Faz 1 yalnız öz-markalı serilerle
çıkar. Şimdiden bağlayıcı ilkeler: programatik reklam ve davranışsal hedefleme asla; sponsorlu
içerik çocuk tarafında "işbirliği" rozeti, ebeveyn tarafında açık beyan ve aylık raporda satır;
şekerleme/HFSS kategorileri kabul edilmez. Kapsül ve ambalaj görselleri Kinder ticari görünümünü
(sarı iki parçalı kapsül, kahverengi-beyaz yumurta grafiği) taklit etmez; mağaza ve oyun metinlerinde
rakip marka adı geçmez (TR Ticari Reklam Yönetmeliği + v2·05 uyum notu).

## 5. Prototipe Uygulama Planı

`prototype/ARCHITECTURE.md` sözleşmesi geçerlidir (IIFE, `window.Yuvo`, pointer event + tap
fallback, Türkçe UI, dış kaynak yok). Bu bölüm uygulama ajanlarının doğrudan çalışabileceği
netlikte yazılmıştır; ARCHITECTURE.md'ye sahiplik/yükleme-sırası eklerini entegrasyon ajanı işler.

### 5.1 Dosya ve sahiplik ekleri

| Dosya | Sahip | Durum |
|---|---|---|
| `prototype/js/data/wrappers.js` | engine | **YENİ** — seri/araç tanımları + ritüel sabitleri |
| `prototype/js/art/ritual-svg.js` | art-audio | **YENİ** — folyo/çikolata/kapsül/araç SVG'leri |
| `prototype/js/audio.js` | art-audio | EK — ritüel ses adları (§5.6) |
| `prototype/js/engine/state.js`, `gacha.js` | engine | EK — §5.3 |
| `prototype/js/scenes/ceremony.js` | scenes-core | **REVİZYON** — aşama makinesi (§5.4) |
| `prototype/js/scenes/home.js` | scenes-meta | EK — vitrin + salla-dinle (§5.5) |
| `prototype/js/scenes/foilbook.js` | scenes-meta | **YENİ** — Ambalaj Defteri sahnesi |
| `prototype/css/scenes-core.css`, `scenes-meta.css` | ilgili ajanlar | EK — folyo şerit/konfeti, defter ızgarası |
| `prototype/index.html` | entegrasyon | Yükleme sırasına ekleme: `data/wrappers.js` (pufis'ten sonra), `art/ritual-svg.js` (pufi-svg'den sonra), `scenes/foilbook.js` (album'den sonra) |

### 5.2 Veri + sanat API'leri

```js
// js/data/wrappers.js (engine)
Yuvo.data.WRAPPER_SERIES = {
  gunesbahcesi:  { ad:'Güneş Bahçesi',    renk1:'#F6B93B', renk2:'#F8E3A1', desen:'papatya' },
  masalormani:   { ad:'Masal Ormanı',     renk1:'#2E6B3C', renk2:'#C9A94E', desen:'yaprak'  },
  sedefdalgalar: { ad:'Sedef Dalgalar',   renk1:'#4FB8D8', renk2:'#EDE7F6', desen:'dalga'   },
  yildiztozu:    { ad:'Yıldız Tozu Gecesi',renk1:'#28356B', renk2:'#C7CBE8', desen:'yildiz' },
  karisiltisi:   { ad:'Kar Işıltısı',     renk1:'#8FD3E8', renk2:'#FFFFFF', desen:'kristal' },
  senlikfenerleri:{ad:'Şenlik Fenerleri', renk1:'#D9483B', renk2:'#F2C14E', desen:'fener'   },
};
Yuvo.data.WRAPPER_VARIANTS = 8;           // seri başına varyant sayısı
Yuvo.data.TOOLS = {
  burgu:  { ad:'Temel Burgu',  ucretsiz:true },
  cekic:  { ad:'Tahta Çekiç',  ucretsiz:true },
  firlat: { ad:'Salla-Fırlat', ucretsiz:true },   // proto: baştan açık (D-kilidi simüle edilmez)
  sihir:  { ad:'Sihirli Dokunuş', otomatik:'destansi+' },
  sedefburgu:{ ad:'Sedef Burgu', kabuk:40 },       // oyunla kazanılan örnek kozmetik
};
Yuvo.data.RITUAL = {
  GOLDEN_ORAN:0.02, GOLDEN_HARD:40,       // proto demo değerleri (gerçek oyun: 1/250, pity 250)
  KUMBARA_ESIK:15, KUMBARA_GUNLUK:1,      // 15 çikolata = 1 bonus yumurta, günde 1
  ISIRIK:4, ISIRIK_YILDIZ:2, CIKOLATA_YILDIZ_TAVAN:40,
  SERIT:3, HIZLI_SERIT:1,
};
```

```js
// js/art/ritual-svg.js (art-audio) — hepsi string döndürür, deterministik
Yuvo.art.wrapperSVG(seriId, {torn:0|1|2|3, golden:false, variant:0..7})
  // torn:0 tam ambalaj (A-E bölgeleri §2.b şablonuna göre); 1-3 şerit şerit soyulmuş
Yuvo.art.foilScrapSVG(seriId, {golden})      // buruşmuş düşen parça (ceremony fizik + defter)
Yuvo.art.chocolateSVG({bites:0..4})          // ısırık izleri mask ile; 4'te kapsül görünür
Yuvo.art.capsuleSVG(tier, {method:'burgu'|'cekic'|'firlat'|'sihir', stage:0|1|2})
  // Tomurcuk Kapsülü; iç ışıma halkası RARITIES[tier].renk; stage: kapalı/çatlak/açık-iki-yarım
Yuvo.art.toolSVG(toolId)                     // araç ikonu + tören eli görseli
Yuvo.art.foilStampSVG(seriId, variant, {golden, count})  // defter yuvası pulu (×n rozeti)
```

### 5.3 State + gacha ekleri (engine)

```js
// state.js — yeni alanlar (version:2'ye migrasyon; eski kayıt alanları varsayılanla doldurulur)
todayEggs:[{seri, variant, golden:null}],  // vitrindeki yumurtalar; newDay() 3 adet atar
firstRitualDoneToday:false,                // newDay() sıfırlar → tam ritüel / hızlı mod anahtarı
chocolates:0, chocolateStarsToday:0, kumbaraToday:0, lastChocolateChoice:'ye'|'biriktir',
foilBook:{},        // seriId -> { variants:{0:count,...}, golden:count }
goldenPity:0,
tools:['burgu','cekic','firlat'], activeTool:'burgu',

// yeni fonksiyonlar
Yuvo.engine.grantEgg(seri?)            // vitrine ambalajlı yumurta ekler (seri: varsayılan aktif seri; variant rastgele)
Yuvo.engine.eatChocolate()             // ısırık başına +2⭐ (günlük 40⭐ tavanı), state günceller
Yuvo.engine.bankChocolate()            // chocolates++, lastChocolateChoice='biriktir'
Yuvo.engine.redeemChocolates()->bool   // 15 çikolata + kumbaraToday<1 → chocolates-=15, grantEgg(), kumbaraToday++
Yuvo.engine.registerFoil(seri,variant,golden) // foilBook'a işler (openEgg içinden çağrılır)
Yuvo.engine.setTool(id)->bool          // tools içindeyse activeTool=id

// gacha.js — openEgg(eggIdx) genişler:
//  1) egg = state.todayEggs.splice(eggIdx,1)  (yoksa {error:'no-egg'})
//  2) mevcut çekiliş AYNEN (oranlar, pity, akıllı düşüş — v2·02 §2.2; proto tek aile olduğundan
//     eggIdx yalnız ambalaj görselini seçer, havuzu değiştirmez — çok-biyomlu oyunda kaynakBiyom olur)
//  3) altın: goldenPity++; rnd<GOLDEN_ORAN || goldenPity>=GOLDEN_HARD → golden=true, goldenPity=0
//  4) registerFoil(...); dönüş: { pufi, rarity, isNew, kabukGained, celebrationTier,
//     wrapper:{seri,variant,golden}, chocolate:1 }
```

### 5.4 Ceremony aşama makinesi (scenes-core)

```js
// scenes/ceremony.js — mount(root, {eggIdx})
const AKIS = ['folyo','cikolata','kapsul','karsilasma','kart','defterKoda'];
// mount: sonuc = Yuvo.engine.openEgg(eggIdx)  → SAKLANIR (görseller sonuçtan beslenir; §1.3)
//        fast  = Yuvo.engine.state.firstRitualDoneToday (mount sonunda true'ya çekilir)
//        nazikFren = sonuc.celebrationTier>=2 || sonuc.isNew&&ilkTur → fast olsa bile tam akış
// Aşama sözleşmesi: her aşama { enter(), input(ev), complete(), skip() } uygular.
//  - tek tap (hedef dışı) → complete()  (aşamayı anında bitir)
//  - çift tap             → skip()      (sonraki aşamaya)
//  - fast modda her aşama tek jestlik kısa varyantını oynatır (folyo 1 şerit, çikolata otomatik
//    lastChocolateChoice, kapsül tek jest, karşılaşma 2,5 sn, defter koda→toast)
// folyo: SERIT kez sürükleme (pointermove ≥ %30 genişlik) veya kulakçık tap; her şeritte
//        foilScrapSVG parçası düşer (CSS fizik); golden ise ilk şeritte goldenFanfare + altın ışık
// cikolata: bites tap'leri (+eatChocolate) VEYA kumbara butonu (bankChocolate); Filiz modunda iki
//        büyük buton "Ye!/Biriktir!"
// kapsul: activeTool'a göre jest (burgu: dairesel sürtme birikimi; cekic: 3 ritim halkası —
//        mevcut ritim kodu yeniden kullanılır; firlat: 400ms basılı tut → bırak; sihir: 2 sn
//        basılı tut). stage 0→1→2; 2'de POP + konfeti + tier kutlaması (mevcut kod)
// karsilasma/kart: mevcut mantık aynen (kopyada kısaltılmış akış + Kabuk animasyonu)
// defterKoda: foilStampSVG deftere uçar; sonra mevcut yönlendirme (yeni parça → assembly; kopya → home)
```

### 5.5 Home vitrin + Foilbook sahnesi (scenes-meta)

- **home:** yuva sepeti yerine "Balon Postanesi tezgâhı": `state.todayEggs` ambalajlı çizilir
  (`wrapperSVG(seri,{torn:0})`). Tap = eline al (büyüt); **400 ms basılı tut** = salla animasyonu +
  `shakeRattle` sesi (proto tek aile: çayır çıngıltısı); ikinci tap = `Yuvo.go('ceremony',{eggIdx})`.
  Kumbara kavanozu köşede (doluluk göstergeli); `redeemChocolates()` başarılıysa şölen toast'ı +
  vitrine yumurta düşer. Nav'a 📔 Defter butonu.
- **foilbook:** sayfa = seri; 8 varyant yuvası + Altın Şeref Yuvası; eksik = soluk desen silueti,
  sahipli = `foilStampSVG` (+×n). Sayfa altı ilerleme (x/8) + tamamlama ödül çipleri (4/8, 8/8 —
  proto: 20/40 Kabuk). Araç Rafı bölümü: sahipli araçlar seçilebilir (`setTool`), kilitliler silüet.

### 5.6 Ses ekleri (`js/audio.js`, art-audio — WebAudio sentez)

`foilTear` (şerit; pitch varyasyonlu) · `crinkle` (sürekli doku; pointer hızıyla gain modülasyonu) ·
`shakeRattle` (aile parametreli tıkırtı) · `bite` + `mmm` · `jarClink` (kumbara) ·
`capsuleTwist` ("gıc") · `capsulePop` · `hammerTik` / `hammerKirt` · `magicRise` ·
`goldenFanfare` · `stampSlap` (defter). Mevcut `crack*` sesleri Yuva Yumurtası töreninde kalır.

### 5.7 Test kancaları + kabul kriterleri

```js
Yuvo.test.ritual = (opts={}) => {...}     // tam ritüeli programatik yürütür; {fast:true} destekli
Yuvo.test.grantChocolates(n); Yuvo.test.forceGoldenNext(); Yuvo.test.setTool(id);
Yuvo.test.foilBook = () => Yuvo.engine.state.foilBook;
```

`tools/proto-engine-test.mjs` ek assert'leri: (1) mevcut pity/oran assert'leri **değişmeden**
geçer (ritüel katmanı çekilişe dokunmaz); (2) altın: 5.000 açılışta goldenPity ≤ 40 aralık ihlali
yok; (3) kumbara: 15 çikolata → +1 yumurta, günde 1 sınırı ve ⭐ tavanı (40) korunur; (4) her
`openEgg` foilBook'a tam bir kayıt işler; (5) `todayEggs` boşken `{error:'no-egg'}`.
Manuel kabul: tam ritüel 25–35 sn, hızlı mod < 10 sn (ekran kaydı ile); `node tools/build-proto.mjs`
temiz build.

## 6. Telemetri & Başarı Metrikleri

| Metrik | Hedef / Alarm |
|---|---|
| Aşama-atlama oranı (aşama × yaş modu) | Herhangi bir aşamada > %40 → o aşamanın süresi kısaltılır (tören zorlanmaz) |
| Salla-dinle kullanımı | ≥ %35 (ipucu kanalı çalışıyor); < %10 → keşfedilebilirlik sorunu |
| Kumbara tercih oranı | İzlenir; optimize **edilmez** (ye/biriktir nötr sunulur) |
| Tam ritüele gönüllü dönüş ("Töreni izle") | ≥ %15 → tören hâlâ seviliyor sinyali |
| Defter'e gönüllü giriş (haftalık) | ≥ %50; seri tamamlama medyanı ≤ 3 hafta/seri |
| Altın folyo anı paylaşımı (vitrin kartı) | İzlenir; ebeveyn e-postası açılma oranıyla birlikte |
| Serbest mikro-etkileşim sıklığı | En yaygın jest sezon ortasında resmî animasyon adayı |

## 7. Backlog

1. Ambalaj şablonu (A–E bölgeleri) tasarım kiti + 6 serinin 8'er varyant sanatı.
2. Tomurcuk Kapsülü endüstriyel görünüm turu (hukuk: trade-dress ayrışma kontrolü).
3. Aile-tıkırtı ses sözlüğü (10 aile × 1 imza sesi) — docs/10 ses ekibine.
4. Altın Folyo canlı oranları + sezon pity'sinin `tools/economy-sim/`e eklenmesi.
5. Çikolata Kumbarası sayılarının Monte Carlo doğrulaması (docs/08 revizyonu: gider tablosuna
   "çikolata" satırı).
6. Sponsor sözleşme şablonu + Şeffaflık Kartı sponsor eki (hukuk görüşü sonrası).
7. Prototip uygulaması (§5) — engine → art-audio → scenes sırasıyla; ARCHITECTURE.md güncellemesi.
8. Hızlı mod / sepet akışı A-B süre ayarı (remote config anahtarları: şerit sayısı, ısırık
   sayısı, koda süreleri).
9. Mikro-an havuzu (12 adet, sezonla tazelenen) — dar kapsamlı animasyon listesi.
10. Applaydu dersi kaydı: ileride fiziksel Yuvo oyuncağı/QR köprüsü gelirse **asla ana döngüde
    zorunlu adım olmaz** (tasarım anayasasına not).

## Kaynaklar (seçilmiş)

ARAŞTIRMA-1: [Apptopia — ASMR oyun büyümesi](https://apptopia.com/en/insights/asmr-mobile-games-increase-13-consecutive-quarters/) ·
[Mystery Dumpling — AppBrain](https://www.appbrain.com/app/mystery-dumpling-unbox-asmr/com.mystery.dumplings.asmr.unboxing.squishy) ·
[Juicy Audio (ACM)](https://dl.acm.org/doi/pdf/10.1145/3677084) ·
[Apple — audio-haptic tasarım](https://developer.apple.com/videos/play/wwdc2021/10278/) ·
[Applaydu/AR — The Drum](https://www.thedrum.com/news/2021/11/04/gameloft-bringing-kinder-surprise-toys-life-with-ar) ·
[Hatchimals CollEGGtibles](https://hatchimals.fandom.com/wiki/Hatchimals_CollEGGtibles) ·
[Çocuk jest araştırması — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7303424/) ·
[NN/g — çocuk motor gelişimi](https://www.nngroup.com/articles/children-ux-physical-development/) ·
[TCG Pocket paket seçimi kritiği](https://ixd.prattsi.org/2025/09/design-critique-pokemon-tcg-pocket-android-app/) ·
[Klusowski 2021 — seçim yanılsaması](https://journals.sagepub.com/doi/10.1177/0956797620958009) ·
[Blind box ritüelleri — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0969698924004235) ·
[POP NOW — App Store](https://apps.apple.com/us/app/-/id1594346256) ·
[L.O.L. psikolojisi — Mental Floss](https://www.mentalfloss.com/article/570941/lol-surprise-dolls-kid-psychology-behind-obsession) ·
[Hearthstone pack tasarımı — TouchArcade](https://toucharcade.com/2017/04/04/designing-hearthstone-card-packs-animations-iterations-ungoro-and-more-with-art-director-ben-thompson/) ·
[Choreographed Emotion — N3TWORK](https://medium.com/n3twork/choreographed-emotion-6-steps-to-a-great-card-reveal-ux-a6e6bb8487dd)

ARAŞTIRMA-2: [Star Wars × Monopoly GO — GameRant](https://gamerant.com/monopoly-go-star-wars-crossover-collab-album-rewards/) ·
[Sensor Tower — Monopoly GO $6B](https://sensortower.com/blog/monopoly-go-app-revenue-milestone) ·
[Nikeland — Marketing Dive](https://www.marketingdive.com/news/nike-courts-next-generation-of-athletes-with-new-roblox-platform-nikeland/610343/) ·
[Roblox u13 reklam — AdExchanger](https://www.adexchanger.com/gaming/roblox-opens-up-advertising-to-kids-under-13/) ·
[Pop Mart telif — SmartBuy](https://smartbuy.alibaba.com/popmart/how-much-does-pop-mart-pay) ·
[Kinder × Minions — The Grocer](https://www.thegrocer.co.uk/news/kinder-surprise-is-latest-brand-to-get-minions-tie-up/521154.article) ·
[Wonka altın bilet — Campaign](https://www.campaignlive.com/article/golden-rules-promotion-50-years-on-why-willy-wonka-marketing-genius/1310294) ·
[Cadbury Creme Egg avı — PromoVeritas](https://www.promoveritas.com/case-studies/cadburys-hunt-the-half-and-half-creme-egg/) ·
[Panini 2026 — NPR](https://www.npr.org/2026/06/05/nx-s1-5844319/world-cup-2026-panini-stickers-album) ·
[Hearthstone kart sırtları](https://hearthstone.fandom.com/wiki/Card_back) ·
[Apple Kids / COPPA — Techlicious](https://www.techlicious.com/blog/apple-app-store-advertising-children/)
