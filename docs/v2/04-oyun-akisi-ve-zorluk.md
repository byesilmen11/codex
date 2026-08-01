# v2·04 · Oyun Akışı & Zorluk Eğrisi (FTUE · İlk 7 Gün · Sezon Kadansı · Bitiriş)

**Kapsam:** İlk oturum (0–15 dk), ilk 7 gün, hafta 2–12 kadansı, zorluk eğrisi, orta/geç oyun, bitirme deneyimi.
**v2 varsayımı:** Yumurtalar oyunla kazanılır **+** ebeveyn onaylı mikro fiyatla satın alınabilir (paket merdiveni: [v2·05](05-magaza-ve-yumurta-paketleri.md)). Hedef kitle 4–12 (çekirdek 6–10).

## 0. Araştırma Özeti (tasarım kararlarını besleyen 8 bulgu)

| # | Bulgu | Yuvo'ya uygulaması |
|---|-------|--------------------|
| 1 | FTUE'de "metinle değil oynayarak öğret"; tutorial funnel'ı adım adım event'lenmeli; D1 retention'ın ana belirleyicisi onboarding | Tüm tutorial adımları analytics event'i (`ftue_step_01…24`); hiçbir adım metin okumaya bağlı değil |
| 2 | "10 saniyede anlaşılan kanca"; ilk ödül mümkün olan en erken anda | İlk yumurta çıtlaması < 60 sn; ilk etkileşim < 15 sn |
| 3 | Meta katman ilk 3–5 oturumda görünür olmalı; D30 = metagame derinliğinin sinyali | Albüm D0'da hediye edilir, Bekçi Seviyesi D2'de, Atölye D5'te açılır |
| 4 | Okuma bilmeyenler: sesli yönerge + büyük vuruş alanı + çok-duyulu geri bildirim; 3–5 / 6–8 / 9–12 ayrı segment | Üç yaş modu; tüm yönergeler seslendirmeli; "klik + parıltı" her FTUE adımına yayılır |
| 5 | Monopoly GO albüm etkinlikleri: günlük/haftalık/sezonluk üç katmanlı takvim; flaş yoğunlaştırıcılar | Kadans katmanlaması alınır; **FOMO/yakma modeli alınmaz** — her şey Müze'den telafi edilebilir |
| 6 | Casual D1 benchmark ~%27; D7/D1 oranı sağlık göstergesi | Hedefler: D1 ≥ %45, D7 ≥ %25, D30 ≥ %12; D7/D1 ≥ 0,50 |
| 7 | Çocuk oyunlarında zorluk: döngüsel eğri (normal → tepe → dinlenme); DDA yalnız akış bölgesinde tutmak için | Zorluk rampası "dalga" biçiminde; DDA yalnız aşağı yönlü ve görünmez |
| 8 | Geri dönen oyuncu "ne değişti" bunalımıyla tekrar churn eder | "Neler değişti turu" 60 sn, en fazla 3 madde; dönüş günü görev yükü %50 |

**v2 kural kutusu (mikro satın alma entegrasyonu):** Çocuk arayüzü mağaza **görmez** (Dilek Kavanozu görür, bkz. v2·05). Satın alma yalnız ebeveyn panelinden; paket merdiveni ve fiyatlar v2·05'te. Guardrail'ler: (a) satın alınan yumurtalar Kiler'e gider, günlük açma tavanı korunur (organik 3–5 + kilerden en çok +5/gün), (b) pity sayaçları ortak — satın alma "şansı sıfırlamaz", (c) oran tablosu satın alma ekranında aynen yayınlanır, (d) satın alınan yumurta çocuk tarafında görsel olarak **ayırt edilemez** ("sepete ekstra sürpriz düştü") — kardeşler arası "parayla alan" ayrımı üretilmez, (e) aylık harcama limiti varsayılan açık. Bu kutu aşağıdaki tüm planlarda geçerlidir.

## 1. Dakika Dakika İlk Oturum (0–15 dk)

**Oyun öncesi (kurulumda, ebeveyn elinde, ~40 sn):** yaş kapısı → yaş modu seçimi (4–6 / 7–9 / 10–12) → ebeveyn PIN → "bildirimler kapalı başlar" bilgisi. Çocuğa cihaz verildiğinde sayaç 0:00'dan başlar.

| Zaman | Ekran / Sahne | Çocuk GÖRÜR | Çocuk DUYAR | Çocuk YAPAR | Tasarım gerekçesi |
|-------|---------------|-------------|-------------|-------------|-------------------|
| 0:00–0:08 | Yükleme | Karanlıkta hafif ışıyan tek yumurta; logo yok, menü yok | Kalp atışı gibi yumuşak "güm… güm…" | Hiçbir şey (bekleme < 8 sn) | Time-to-fun için menü/logo geçidi silindi; yumurta daha oyun açılmadan merak nesnesi |
| 0:08–0:20 | Açılış (in-engine, etkileşimli) | Gri Ovalya'ya süzülüş; gökten yıldız ışığı düşüyor ve **çocuğun parmağını bekliyor** (nabız halkası) | Anlatıcı (2 cümle): "Ovalya'nın renkleri uyuyor. Onları yalnızca sen uyandırabilirsin, Yumurta Bekçisi." | **İlk dokunuş ~0:12** — yıldıza dokunur, yıldız parmağına yapışıp çayıra iner | Pasif sinema yerine ilk dokunuş hikâyenin içinde; 15. saniyede fail edilemez bir eylem |
| 0:20–0:40 | Güneş Çayırı — ilk yumurta | Çimende titreyen sarı benekli yumurta; "ovala" el işareti | Yumurtadan minik hıçkırıklar; "Üşümüş… ısıtır mısın?" | Yumurtayı ovalar (dairesel sürtme, hedef alan ekranın %60'ı) — kabuk ısınır, titreşim | Isıtma = şefkat çerçevesi ("aç" değil "bakım" mekaniği); her motor beceri seviyesinde başarılır |
| 0:40–0:55 | **İLK ÇITLAMA** (< 60 sn: tutuldu) | Kabukta ışık sızdıran çatlaklar; ritim halkaları (3 dokunuş) | "çıt… çıt… ÇITT!" (ASMR) + konfeti | Halkalara 3 kez dokunur — ritmi kaçırmak imkânsız | Oyunun kalbi ilk dakikada tam haliyle yaşatılır; "bu oyun ne?" 55. saniyede bedende cevaplanır |
| 0:55–1:20 | Pofu ile tanışma | Pofu esneyerek çıkar, **doğrudan çocuğa bakar**, güler; burnuyla ekrana dokunur | Kelimesiz sevinç sesleri; ada müziğinin ilk 3 notası | Pofu'ya dokunur → Pofu zıplayıp parmağını takip eder | Sistemden önce **duygusal bağ**: ilk 90 saniyede "arkadaş" kazanıldı, "item" değil |
| 1:20–2:20 | Birleştirme Masası (ilk yetkinlik) | Pofu'nun oyuncağı (güneş çıngırağı) 3 parça; parçalar oversize, otomatik döner | Doğru oturuşta "klik" + parıltı çanı; yanlışta ceza sesi yok | 3 parçayı oturtur; oyuncağı Pofu'ya verir → sevinç dansı | Yetkinlik anı < 2,5 dk. Yanlışın cezasızlığı ilk dakikada öğrenilir → deneme korkusu oluşmaz |
| 2:20–2:50 | Ada canlanır (anlam katmanı) | Pofu şarkısını mırıldanır → çayırın bir yaması **renklenir**; kamera gri ada ile renkli yamayı yan yana gösterir | Ailenin şarkı motifi; "Her Pufi, adaya bir renk getirir." | İzler (8 sn) + Pofu'nun başını okşar | Koleksiyonun ahlaki çerçevesi görüntüye yüklendi; gri ada = baskısız hedef haritası |
| 2:50–4:00 | Kiki → ilk mini oyun | Kiki daldan iner; Eşle & Bul: **3 çift**, kartlar büyük | Kiki: "Yıldız Tozu toplayalım!" | 3 çifti eşler (süre yok) → 3 yıldız + Yıldız Tozu yağmuru | Kaynak döngüsünün ilk turu; kaybetmenin olmadığı mini oyunda da doğrulanır. Karakterler tek tek tanıtılır |
| 4:00–5:30 | İkinci yumurta töreni | Sayaç dolar → sepete **benekli** yumurta düşer | Kiki: "Bak, kabuğu benekli! Acaba kim?" | Töreni **daha az yardımla** kendi yapar; senaryolu Az Bulunur çıkar | "Kabuk deseni = aile/nadirlik ipucu" ikinci örnekle öğretilir; nadirlik merdiveni erken hissettirilir |
| 5:30–6:30 | **ALBÜMÜN HEDİYE EDİLİŞİ** | Pofu kütükten ışıldayan **Ovalya Albümü**'nü çıkarır; sahip olunan 2 kart sayfaya **uçarak yapışır**; kalan 28 yer "?" silüeti | Sayfa hışırtısı + "şlap"; "Bu senin albümün. Her sayfa bir aile." | Kartların yapışmasına dokunur; "?" silüetlerini görür | **Endowment:** albüm boş verilmez, 2 kart doluyken verilir. "?" = okuma gerektirmeyen hedef listesi |
| 6:30–8:30 | İkinci mini oyun + bakım tadımlığı | Renk Yağmuru (kolay); Pofu acıkır (komik gurultu) | Gurultu + beslenince "mmm!" | Renk yakalar → meyve kazanır → Pofu'ya verir → mutluluk kıvılcımı | Bakım mizahla tanıtılır; "bakım = bonus, ihmal = ceza değil" ilk oturumda kurulur |
| 8:30–10:30 | Üçüncü yumurta (serbest) | Hiçbir öğretim işareti yok | Ortam sesleri | Töreni tamamen kendi yürütür (takılırsa 6 sn sonra ipucu) | Gizli çıkış sınavı: "yardımsız yapabildim". Telemetri: ipucu tetiklenme oranı = FTUE sağlık metriği |
| 10:30–12:30 | Serbest oyun penceresi | Yuva alanı + 1 dekor; Pufiler gezinir | Ada ambiyansı | İsteğe bağlı: dekor, oyun, albüm | Otonomi: "bu dünya bana ne yaptırıyor" değil "ben ne yapmak istiyorum". 4–6 modunda pencere daha uzun |
| 12:30–13:30 | Albüm + yakın hedef | Albüm 3/30; 10/30 rozet yuvası parlar; "sıradaki hedef" şeridi | Kiki: "10 olunca sana bir sürprizim var!" | Yarınki rotayı görür (ikon dilinde) | Goal-gradient: ilk kilometre taşı kasten yakın; "sürprizim var" ödül adı vermez → merak boşluğu |
| 13:30–14:30 | **"YARIN SÜRPRİZİ" KANCASI** | Gökyüzü turunculaşır; **Şako'nun silüeti** geçer, parlak tüy ve **tuhaf desenli yumurta** bırakır; yumurta "kuluçka" moduna girer (ay ikonu: "yarın") | "Şak-şak" kanat sesi + gizemli 2 nota; Kiki: "Bu da neydi?! Sabaha hazır olur." | Yumurtaya dokunur → uykuya dalar; açamaz | D1 kancası bildirime değil **içeriğe** bağlı: cliffhanger fiziksel olarak yuvada. Şako'nun ilk görünümü korkusuz gizem |
| 14:30–15:00 | Günbatımı ritüeli | Luna yıldız tozu serper; Pufiler uyur; ekran kararır; ebeveyn paneli daveti PIN arkasında | Luna'nın ninni motifi (her gün aynı) | İsterse "iyi geceler" dokunuşu | Oturum sonu tasarlanmış kapanış: "oyun bitti" suçluluğu yerine "gün bitti" huzuru |

**FTUE başarı metrikleri:** ilk çıtlama medyanı ≤ 55 sn · adım tamamlama ≥ %90 · sessiz ustalık testinde ipucu ≤ %25 · D0 oturum medyanı 13–17 dk · albüme gönüllü ikinci giriş ≥ %60.

## 2. İlk 7 Gün Planı

Günlük omurga sabit (3 temel yumurta + görev zinciri 1–2 + Yıldız Tozu); tablo her günün ÜSTÜNE ekleneni gösterir.

| Gün | Açılan sistem / olay | Tempo | Duygusal tema | Ertesi güne kanca (bildirimsiz) |
|-----|----------------------|-------|----------------|--------------------------------|
| **D0** | Çekirdek döngü, albüm (2 kartla), bakım tadımlığı | 3 yumurta (senaryolu: Pofu + Yaygın + Az Bulunur) | "Bir arkadaş buldum" | Şako'nun **kuluçka yumurtası** yuvada |
| **D1** | Kuluçka yumurtası girişte AÇILMAYA HAZIR (ilk 30 sn'de); görev zinciri resmîleşir; dekorasyon dükkânı açılır | 3+1; kuluçkadan **Fısıltı Ormanı desenli** elçi çıkar | "Dünkü sürpriz gerçekleşti" (oyun söz tutar) | Elçi ormana bakıp iç çeker; haritada sisli kapı |
| **D2** | **Bekçi Seviyesi** reveal (sv.3'te); ödül: 1 **seçmeli-aile yumurtası**; +2 mini oyun türü | 5 yumurta; ilk seçim anı | "Büyüyorum ve seçebiliyorum" | Kiki **harita parçası** bulur; yarın açılacak kapının deseni |
| **D3** | **Fısıltı Ormanı açılır**: yeni müzik/desenler, Şako Saklambaç; **Şako ilk parçayı saklar** (yok olmaz, iz bırakır) | 4–5; saklanan parça geri kazanılır | "Dünya büyüdü, macera yaşadım" | Şako kaçarken **parlak bir şey** düşürür |
| **D4** | İlk set kilometre taşı: **Çayır 10/30** (akıllı yumurta bunu D4'e mühendisler) → dekor seti + hikâye sahnesi | 4–5; rozet töreni | "İlk hedefimi tamamladım" (D0'daki söz tutuldu) | Usta Kabuk silüeti sahilde; kopyaların köşesi ışıldar |
| **D5** | **Atölye açılır**: ilk kopya→Kabuk; ilk üretim indirimli, mini törenle | 4–5; eksik parça sevinci | "Kopyalar çöp değilmiş!" | Usta Kabuk: "Benekli kabuk getir, sır göstereyim" |
| **D6** | **Vitrin kartı** + (onaylı arkadaş varsa) **hediye**; pity ilk **Nadir**'i garantiler (15 eşiği) | 4–5; sedefli kabuk kutlaması | "Gösterebileceğim bir şeyim var" | Kiki: "Yarın çok özel bir gün… şenlik hazırlıyorum!" |
| **D7** | **İlk Aile Şenliği** (sonra cumartesilere sabitlenir): ebeveyn-çocuk ortak oyun → aile desenli yumurta; haftalık özet | 4–5 + şenlik yumurtası; albüm ~%8–10 | "Ailemle oynadım; neler yaptım!" | Özetin son karesi: sisli **Pofuduk Tepeler** + perde 2 fragmanı |

**Mantık:** Her gün tek yeni sistem (bilişsel yük, 4–6 için şart) · her sistem ihtiyaç doğduktan sonra açılır · her günün kancası ekranda fiziksel durur — dönüş dürtüsü bildirimden değil, yarım kalan hikâyeden.

**v2 dokunuşu:** D2–D3 arası ebeveyn paneline tek seferlik sakin kart: "Dilerseniz sepete ek sürpriz yumurta ekleyebilirsiniz — oranlar ve sınırlar burada." Çocuk akışında iz yok; satın alınan yumurta ertesi sabah sepette sıradan bir yumurta gibi belirir.

**Hedefler:** D1 ≥ %45 · D3 ≥ %32 · D7 ≥ %25 · D7 kohortunda Atölye kullanımı ≥ %70 · Şenlik'e ebeveyn katılımı ≥ %35.

## 3. Hafta 2–12 Kadansı

**Katmanlar:** (1) günlük görev ritmi; (2) haftalık Aile Şenliği (cmt); (3) iki haftalık biyom dalgası; (4) sezon perdeleri; (5) nokta etkinlikleri. **FOMO kuralı:** hiçbir içerik kalıcı kaybolmaz; her şey Müze'den tamamlanabilir. Etkinlik "şimdi yaparsan tören burada" der, "yapmazsan yanar" demez.

### Etkinlik sözlüğü

| Etkinlik | Süre | Mekanik | Not |
|----------|------|---------|-----|
| Biyom Dalgası | 2 hafta | Günün yumurtaları vurgulu biyoma %60 ağırlıklı; biyoma özel mini oyun çeşitlemesi | Monopoly GO "spotlight" kadansının FOMO'suz hali |
| Aile Şenliği | Haftalık | Ortak mini oyun → aile desenli yumurta | Kaçırılırsa pazar telafi penceresi |
| Şako Avı | 3–4 gün | Şako 3 parça saklar; ipuçları + saklambaç zinciri; final: mağaradan seçmeli parça | Sezonun gerilim vuruşları |
| Kabuk Şenliği | Hafta sonu | Atölye %30 indirim + kopya dönüşümü +1 | Tamamlanmayı sezon ortasında iter |
| Desen Atölyesi | 3 gün | Kozmetik kabuk deseni zanaatı (⭐ gideri) | Yıldız Tozu fazlasını emer |
| Işıltı Haftası | 1 hafta | Işıltılı dönüşüm vurgusu (7+) | Kopya ekonomisine ikinci anlam |
| Müze Günü | 1 gün | Eski sezon yumurtası 1→2 (2. sezondan itibaren) | Arşiv gururu |

### Sezon 1 takvimi

| Hafta | Biyom dalgası / açılış | Perde | Nokta etkinlik | Tepe ödül |
|-------|------------------------|-------|----------------|-----------|
| 1 | Çayır (+D3: Orman **açılır**) | P1: Uyanış | — | 10/30 rozeti; ilk Nadir |
| 2 | Çayır ↔ Orman | P1 | Desen Atölyesi | Çayır 20/30; **Tepeler açılır** (sv.6) |
| 3 | Tepeler | P2: Fısıltılar | **Şako Avı #1** | Mağaradan seçmeli parça |
| 4 | Tepeler | P2 | Desen Atölyesi | İlk aile 27/30 → akıllı yumurta finali; **Koy açılır** (sv.8) |
| 5 | Koy | P2 | **Kabuk Şenliği #1** | İlk **30/30 aile** → Büyük Kutlama + Işıltılı hak |
| 6 | Koy | P3: Derin Sular | — | **Kanyon açılır** (sv.14) |
| 7 | Kanyon | P3 | **Şako Avı #2** | İlk senaryolu **Destansı** penceresi (pity 40) |
| 8 | Kanyon | P3 | **Işıltı Haftası** (7+) | İlk Işıltılı Pufi; **Göl açılır** (sv.20) |
| 9 | Göl | P4: Işık ve Buz | **Kabuk Şenliği #2** | **Buz Dağları açılır** (sv.26); albüm ~%55–65 |
| 10 | Buz | P4 | **Şako Avı #3** (mağaranın sırrı: Şako'nun kendi koleksiyonu) | **Kor Bahçesi açılır** (sv.32) |
| 11 | Kor + Bulut | P4 | Desen Atölyesi (final desenleri) | **Bulut Krallığı açılır** (sv.36); ilk Efsanevi çoğunlukta bu civarda (pity 100) |
| 12 | **Ay Bahçesi açılır** (sv.40) | P5: Final — Şako ile barış | Kapanış Haftası: Kabuk Şenliği + tüm havuzlar açık | Şako'ya hediye sahnesi; **Altın Yumurta Töreni**; Müze taşınması; Sezon 2 fragmanı |

**Kadans ilkeleri:** Haftada en fazla 1 nokta etkinlik · Şako Avları 3–4 hafta arayla · Kabuk Şenlikleri sezonun %40 ve %75 noktalarında · 2. sezondan itibaren aynı iskelet + Müze Günleri.

## 4. Zorluk Eğrisi

### 4.1 Üç faz, sayısal hedefler

| Faz | Dönem | Tanım | Sayısal hedefler |
|-----|-------|-------|------------------|
| Kolay Başla | D0–D7 | Kaybetmek yapısal olarak imkânsız; her oturumda ≥1 "vay canına" | 3-yıldız oranı ≥ %85; tören tamamlama %100; ipucu ≤ %25; oturum başına ödül anı ≥ 6 |
| Ustalaş | H2–H8 | Zorluk dalga deseninde artar; Usta Modu rozetleri (7+) | 3-yıldız %60–75 bandı (DDA hedefi); Usta Modu deneme (7+) ≥ %40; Kabuk biriktiren oyuncu ≥ %50 |
| Gururlan | H9–12 | Zorluk artmaz, **anlam** artar: Efsanevi anları, Işıltılı, kürasyon | Sezonda ≥1 Efsanevi anı/oyuncu (pity 100); aile kutlaması ≥ 3/oyuncu; final haftası oturum +%20 (törenle, baskıyla değil) |

### 4.2 Biyom bazında koleksiyon rampası

Nadirlik dağılımı her ailede sabit; zorluk **erişim zamanı + takvim + üretim maliyeti** üzerinden:

| Biyom grubu | Açılış | Zorluk kaynağı | Medyan bitirme hedefi |
|-------------|--------|----------------|------------------------|
| B1–B2 (Çayır, Orman) | D0 / D3 | Yok — akıllı yumurta cömert, pity hızlı | ~10–18. gün |
| B3–B5 (Tepeler, Koy, Kanyon) | H2–H6 | Dalga dışı günlerde havuz seyrelir; kopya artar → Atölye kararları | ~25–45. gün |
| B6–B8 (Göl, Buz, Kor) | H8–H10 | Takvim kısalır → Kabuk Şenlikleri ve (v2) satın alma opsiyonu burada anlam kazanır | ~55–75. gün |
| B9–B10 (Bulut, Ay) | H11–H12 | En kısa pencere; final haftası tüm havuzlar açık + Müze güvencesi | Sezon içi ya da Müze'den |

Kural: zorluk asla oranların gizlice kötüleşmesiyle üretilmez; yalnız **zaman penceresi** ve **emek türü seçimi** (şans / Kabuk / hediye / [v2] ebeveyn desteği) zenginleşir.

### 4.3 Yaş modları

| Parametre | Filiz (4–6) | Kâşif (7–9) | Küratör (10–12) |
|-----------|-------------|-------------|------------------|
| Birleştirme parçası | 3, otomatik döndürme | 4–5, elle döndürme | 6, aynalı/dönük (Usta Modu varsayılan) |
| Süre baskısı | Kapalı | İsteğe bağlı "yıldızlı ustalık" (cezasız) | Rozetli ustalık hedefleri |
| Vuruş alanları | ≥ ekranın %12'si | Standart | Standart |
| Yönerge | Yalnız ses + animasyon | Ses + kısa metin | Metin öncelikli |
| Mini oyun süresi | 45–60 sn | 60–90 sn | 90–120 sn |
| DDA | 2 üst üste zorlanmada kademe iner; asla yukarı zorlamaz | Bant: 3-yıldız %60–75; görünmez | Bant + oyuncunun açtığı "meydan okuma" anahtarı |
| Ek derinlik | — | Işıltılı, Usta Modu | Müze küratörlüğü, dekorasyon blueprint'leri, Koleksiyoncu Defteri |

DDA ilkesi: yalnız aşağı yönlü ve görünmez — çocuk asla "oyun bana kolay davranıyor" mesajı almaz.

## 5. Orta ve Geç Oyun (albüm ≥ %70)

### 5.1 Geç oyun döngüsü — kopyanın üç hedefi

Erken oyun "yeni parça" merkezli; geç oyunda yumurtanın beklenen değeri kopyaya kayar. Kopya üç hedefe akan kaynak olur:

| Sütun | Mekanik | Oturumdaki yeri |
|-------|---------|------------------|
| Işıltılı üretim | 4 kopya + mutlu bakım bağı → Işıltılı Pufi | Haftada 1–2 üretim kararı |
| **Gizli Pufi Avı** (yeni öneri) | Her biyomda albüm köşesinde soluk "11. desen" ipucu; koşul tabanlı ortaya çıkış (ör. 3 Pufi'yi aynı yuvada mutlu et + gece ziyareti) → sayfa dışı **yıldız köşesine** işlenir | 300 matematiğini bozmaz (+10 kozmetik/statü); okul arası söylenti üretir |
| Atölye hedefli üretim | Akıllı yumurta ≥ %90'da tamamen eksiklere kilitlenir | "Son 10 parça" plan tahtası (cehennem değil, proje) |
| Müze & kürasyon (9–12) | Sergi düzenleme, ziyaretçi tepkileri | Haftalık kürasyon görevi |
| Dekorasyon derinliği | Yuva temaları, biyom bahçeleri; ⭐ fazlasının emildiği yer | Serbest oyun penceresi büyür |

### 5.2 Sezon geçişi: "Taşınma Günü"

1. Final kapanışında çocuk albümünü Müze'ye **kendisi taşır** (el arabası sahnesi, Pufiler eşlik eder). Albüm silinmez, taçlandırılır.
2. Müze salonunda eksikler tamamlanabilir (günde 1 Müze yumurtası) — "kaçırdım" yapısal olarak imkânsız.
3. **Ada sıfırlanmaz:** Pufiler, dekorlar, anıt kalır; yeni sezon yeni bölge/yağmur ekler ("albüm yeniden başlar, ev kalabalıklaşır").
4. Bekçi Seviyesi → "Bekçi Yıldızı" prestij rozetine dönüşür; yeni sezon hızlandırılmış açılışla (ikinci FTUE yok, 2 dk "yeni yumurtalar geldi" sahnesi).
5. Geçiş haftasında ritim düşürülmez — içerik boşluğu churn'ün ana kapısı; fragman + ilk yeni biyom aynı gün oynanabilir.

### 5.3 Dönüş akışı (churn kurtarma)

| Adım | 7–29 gün ara | 30+ gün / sezon değişmiş |
|------|--------------|---------------------------|
| Karşılama | Pufiler koşarak karşılar; suçluluk cümlesi YOK | Aynı + ada "altın saat" ışığında |
| Hediye | Birikmiş sepet: 2 yumurta + ⭐ (hediye çerçevesi, telafi değil) | Sepet + **Hatırlama Yumurtası**: en ilerlemiş aileden garantili eksik parça |
| "Neler değişti" turu | 45–60 sn, en fazla 3 madde, sesli-görsel; atlanabilir | Aynı + "albümün Müze'de güvende" güvencesi + 1 ekranlık sezon köprüsü |
| İlk gün yükü | Görev zinciri %50 hafif; DDA bir kademe aşağıda | Aynı + senaryolu "kolay zafer" (10 dk'da 1 kilometre taşı) |
| Kanca | O akşam yuvada yeni kuluçka yumurtası | Aynı |

Bildirim politikası korunur: dönüş push ile değil, ebeveyn kanalı (opt-in haftalık özet) ve organik dönüşle.

## 6. Bitirme Deneyimi — 300/300: Altın Yumurta Töreni (ekran akışı)

~4–5 dk; her adım dokunuşla ilerler (çocuk töreni "izlemez", **yürütür**):

| # | Sahne | Süre | Akış | Gerekçe |
|---|-------|------|------|---------|
| 1 | Son parça | 15 sn | 300. kart yapışır; albüm titrer, sayfalar altın kenar alır; çocuk albümü kendi eliyle kapatır | Doruk anın tetiği oyuncunun elinde |
| 2 | Sayfa geçidi | 25 sn | 10 sayfa art arda açılır; her sayfada o ailenin şarkı motifi bir enstrüman olarak eklenir | "Her renk bir şarkı" lore'unun müzikal ödemesi: 10 sayfa = tam orkestra |
| 3 | Ada uçuşu | 30 sn | Kamera adayı uçar: gri başlayan dünya tamamen renkli; tüm Pufiler el sallar; boş anıt kaidesi görünür | 12 haftalık emeğin tek plan kanıtı; boş kaide merak tohumu |
| 4 | Meydan | 20 sn | Tüm karakterler + Pufiler meydanda; gökte ışık büyür | "Herkes benim için burada" |
| 5 | Altın Yumurta iner | 20 sn | Isıtma kolektif: çocuk dokundukça **bütün Pufiler de** sokulup ısıtır | Çekirdek ritüelin en büyük ölçekli hali; "bakım = topluluk" |
| 6 | Büyük çıtlama | 25 sn | Ritim halkaları — Pufiler davul çalar; "ÇITT"ta gökyüzü şölen | İlk 60 saniyedeki anın kasıtlı aynası ("ilk yumurtanı hatırlıyor musun?") |
| 7 | Altın Pofu | 30 sn | Altın Pofu çıkar, sarılır; profile **"Altın Bekçi"** unvanı | Taç ödül statü + duygu; oynanış avantajı yok |
| 8 | Anıt seçimi | 45 sn | Çocuk **en sevdiği Pufi'yi seçer**; anıt dikilir, üstünde Bekçi adı | Kalıcı, kişisel, seçilmiş statü; her çocuğun anıtı farklı |
| 9 | Fotoğraf anı | 20 sn | Pufiler anıtın etrafında poz; otomatik "tören kartı" (ebeveyn paneli üzerinden aileye) | Organik paylaşım — dışa açık sosyal ağ olmadan |
| 10 | Ebeveyn köprüsü | — | Kutlama e-postası + yazdırılabilir "Yumurta Bekçisi Diploması" | Diplomanın buzdolabına asılması oyun dışında ikinci kutlama |
| 11 | "Altın hafta" | 7 gün | Ada altın ışıkta; kürasyon daveti (9–12) + Gizli Pufi ipuçları + sezon fragmanı | Doruk sonrası boşluk üç kancayla köprülenir; yeni harcama döngüsü tetiklenmez |

## 7. Backlog'a girecek maddeler

1. FTUE event şeması (`ftue_step_01…24`) + ipucu-tetiklenme telemetrisi.
2. Senaryolu ilk 3 yumurta tablosu + D6 Nadir / H7 Destansı / H11 Efsanevi pity pencereleri — `tools/economy-sim/` girdisi.
3. Kuluçka/"yarın sürprizi" sistemi — D0, sezon geçişi ve dönüş akışında ortak bileşen.
4. Etkinlik takvimi veri modeli: hafta × dalga × perde × nokta (remote config).
5. Yaş modu parametre matrisi (§4.3) — tek config, DDA bantlarıyla.
6. Gizli Pufi sistemi (10 adet, sayfa dışı, koşul tabanlı) — Bölüm 07'ye ek.
7. Taşınma Günü + dönüş akışı sahneleri.
8. v2 satın alma guardrail seti: ortak pity, kiler tavanı, yayınlanan oranlar, çocuk tarafında görsel eşitlik, aylık limit.
9. Altın Yumurta Töreni 11 sahnelik akış (§6 tablosu birebir storyboard).

## Kaynaklar

[GameAnalytics — FTUE Tips](https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games) ·
[Udonis — FTUE](https://www.blog.udonis.co/mobile-marketing/mobile-games/first-time-user-experience) ·
[Keewano — FTUE Tips](https://keewano.com/blog/first-time-user-experience-ftue-mobile-games/) ·
[Roblox Creator Hub — Onboarding](https://create.roblox.com/docs/production/game-design/onboarding) ·
[AppMagic — Album Events](https://appmagic.rocks/blog/top-events-june-2024/?hl=en) ·
[IGGM — Monopoly GO Album Mechanics](https://www.iggm.com/news/monopoly-go-the-simpsons-album-mechanics-event-guide-collect-episode-sticker-sets) ·
[Mogo — Monopoly GO Events](https://mogostickers.com/monopoly-go/events) ·
[NN/g — Children's UX](https://www.nngroup.com/articles/childrens-websites-usability-issues/) ·
[UserTesting — UX for Kids](https://www.usertesting.com/blog/ux-for-kids) ·
[AufaitUX — Design for Children](https://www.aufaitux.com/blog/ui-ux-designing-for-children/) ·
[ThinkingData — Hybridcasual](https://thinkingdata.io/blog/breaking-down-the-evolution-of-hypercasual-mobile-games-to-hybridcasual/) ·
[TAP Nation — Hybrid Casual KPIs](https://www.tap-nation.io/blog/kpis-that-matter-metrics-to-track-in-hybrid-casual-games/) ·
[AppAgent — Retention Benchmarks](https://appagent.com/blog/mobile-game-retention-benchmarks/) ·
[Segwise — Retention 2026](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies) ·
[GameRefinery — Re-engagement](https://www.gamerefinery.com/four-ways-how-mobile-games-re-engage-lapsed-players/) ·
[Helpshift — Re-engagement](https://www.helpshift.com/blog/re-engagement-campaigns-for-mobile-games/) ·
[Frontiers — Difficulty Curves for Children](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02271/full) ·
[Game Developer — Difficulty Curves](https://www.gamedeveloper.com/design/difficulty-curves-how-to-get-the-right-balance-)
