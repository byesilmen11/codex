# v2·05 · Mağaza & Yumurta Paketleri (Doğrudan Satış Modeli)

> **v2 tezi:** Market rafında tek bir sürpriz yumurta ₺55, üçlü paket ₺315, maxi boy ₺422
> ([Akakçe](https://www.akakce.com/cikolata/en-ucuz-kinder-surprise-20-gr-surpriz-yumurta-fiyati,876670504.html),
> [Cimri](https://www.cimri.com/cikolata/en-ucuz-kinder-20-gr-surprise-yumurta-fiyatlari,2584816518)).
> Yuvo'da yumurta ₺1–5 bandında: aileye "ucuz merak giderme" alternatifi. Satın alma tamamen
> ebeveyn katmanında, oranlar satın alma öncesi ekranda (Apple 3.1.1 ve Google Play zaten şart
> koşuyor), ara para birimi YOK — fiyat daima gerçek TL.

## 0. Araştırma Özeti (tasarım kararlarını besleyen bulgular)

| Bulgu | Kaynak | Tasarıma etkisi |
|---|---|---|
| Apple 900 fiyat noktası sunuyor; $10 altı $0,10 adımlarla. TR gibi oynak kurlarda **aylık manuel fiyat gözden geçirme** öneriliyor | [Mirava](https://www.mirava.io/blog/apple-app-store-price-tiers-how-they-work-2026), [Apple Developer](https://developer.apple.com/news/?id=4li349ao) | TR fiyatları **manuel bölgesel fiyat** olarak sabitlenir (₺1–5/yumurta vaadi kur dalgasında bozulmasın); aylık fiyat kurulu |
| Monopoly GO paket merdiveni: 6 kademe + web mağazasında aynı fiyata **+%16 içerik** (komisyon arbitrajı) | [Stash](https://www.stash.gg/blog/monopoly-go-store), [Theria](https://theriagames.com/guide/monopoly-go-store-guide/) | 6 kademeli merdiven; hediye akışı için web mağazası (komisyonsuz) Faz 1,5 |
| Pokémon GO Starter Box: ~$3, **profil başına 1 adet**, bariz aşırı değer | [Dexerto](https://www.dexerto.com/pokemon/pokemon-go-shop-updated-list-items-prices-box-changes-1315679/) | Starter pack: tek seferlik, düşük fiyat, "kıyaslanamaz değer" |
| Brawl Stars gem merdiveni $1,99→$99,99; ilk alımda 2× bonus; Supercell loot-box'ı tamamen kaldırdı | [Topuplist](https://topuplist.com/blogs/detail/brawl-stars-gems-price-best-value-packs-2026), [Sharpr](https://sharpr.substack.com/p/supercell-removes-loot-boxes-from) | İlk alım bonusu norm; sektör rüzgârı şeffaflık yönünde → oran kartımız pazarlama kozu |
| Starter pack normu $0,99–4,99; amaç kâr değil **ilk ödeme bariyerini kırmak** (ilk alım yapan 5–10× daha çok tekrar harcıyor); aşırı indirim değer algısını çökertiyor | [PocketGamer.biz](https://www.pocketgamer.biz/comment-and-opinion/64530/best-practices-starter-bundles/), [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2024/4/8/free-to-play-starter-pack-pricing-when-conversion-is-king-we-may-price-too-low) | Starter ₺19,99; indirim ~%60 (−%90 değil) |
| Robux/Roblox hakkında FTC'ye şikâyet: katmanlı ara para "gerçek maliyeti soyutluyor, gizliyor, şişiriyor" | [The Hill](https://thehill.com/homenews/5888060-roblox-gaming-platform-ftc-investigation/), [Claims Journal](https://www.claimsjournal.com/news/national/2026/05/21/337716.htm) | **Ara para kullanmıyoruz** — "1 yumurta = ₺X" her ekranda; ebeveyn pazarlamasının 2. cümlesi |
| Apple 3.1.1 + Google Play: rastgele içerik satan her uygulama **satın alma öncesi oran açıklamak zorunda** | [Fenwick (Apple)](https://www.fenwick.com/insights/publications/apple-now-requires-disclosure-of-loot-box-odds), [Fenwick (Google)](https://www.fenwick.com/insights/publications/google-play-now-requires-disclosure-of-loot-box-odds) | Oran tablosu zorunluluğu → "Şeffaflık Kartı" olarak güven unsuruna çevrilir |
| Dönüşüm benchmarkları: freemium %2–5; casual tabanı %0,5–1; 30 günde satın alma dönüşümü ort. %2,6; casual puzzle aylık ARPPU $8–15 | [MAF](https://maf.ad/en/blog/mobile-game-conversion-rates/), [Business of Apps](https://www.businessofapps.com/data/mobile-game-conversion-rates/), [Juego Studio](https://www.juegostudio.com/blog/arpdau-benchmarks-by-game-genre) | Çocuk segmenti + ebeveyn kapısı = bandın altı; projeksiyonda %1,2 / %2 / %3,5 kullanıldı |
| Apple Ask to Buy: çocuk istek gönderir, ebeveyn cihazından onaylar — ebeveynler akışa aşina | [Apple Support](https://support.apple.com/en-us/105055) | "Dilek Kavanozu" akışı bu zihinsel modeli kopyalar (öğrenme maliyeti sıfır) |

**Uyum notu:** TR Ticari Reklam Yönetmeliği rakip marka adıyla karşılaştırmalı reklamı kısıtlar →
mağaza metinlerinde asla "Kinder" yazmaz; "market rafındaki sürpriz yumurta" denir.

## 1. Yumurta Paket Mimarisi

### 1.1 Temel ilkeler (mevcut kılavuzla eklemlenme)

1. **Tek havuz, tek gerçek:** Satın alınan yumurta, oyunla kazanılanla **aynı oran tablosunu ve aynı
   pity sayacını** kullanır. "Paralı yumurta daha şanslı/şanssız" algısı doğamaz.
2. **Kiler mekaniği (aşırı açma freni):** Satın alınan yumurtalar anında açılmaz; adadaki
   **"Yumurta Kileri"ne** gider. Günlük açma tavanı korunur: oyunla kazanılan 3–5 + kilerden
   **en fazla +5/gün**. 100'lük paket = 3–4 haftalık sevinç takvimi. "Binge" dürtüsünü yapısal
   olarak keser ve paket başına oturum-gün sayısını artırır (retention'a çalışır).
3. **Ara para yok:** Her paket TL etiketiyle; paket kartında birim fiyat da yazar ("yumurta başına ₺2,00").
4. **Efsanevi vaat olarak satılmaz:** Tüm paket garantileri ve seçim hakları Destansı'da durur;
   hiçbir pakette Efsanevi vaadi/seçimi yoktur. Her yumurta (kazanılmış ya da satın alınmış) aynı
   oranı ve ortak pity sayacını taşıdığı için Efsanevi elbette her yumurtadan çıkabilir — ama onu
   getiren şey her zaman şans + pity'dir, cüzdan değil ("parayla bitmiyor, oyunla bitiyor" güven hattı).

### 1.2 Paket katmanları

| Paket | Adet | TR₺ | US$ | ₺/yumurta | Birim düşüş | Paket garantisi | Hedef persona |
|---|---|---|---|---|---|---|---|
| **Çıtlat Bakalım** (tekli) | 1 | ₺9,99 | $0,49 | ₺9,99 | — (çapa) | Standart oranlar | "Bir kere deneyelim" ebeveyni |
| **Cep Sepeti** | 5 | ₺24,99 | $0,99 | ₺5,00 | −%50 | Min 1 Az Bulunur | Haftalık harçlık (küçük ödül anı) |
| **Haftalık Sepet** ⭐EN POPÜLER | 10 | ₺39,99 | $1,99 | ₺4,00 | −%60 | Min 1 Nadir + 1 akıllı yumurta | "Her cumartesi" ritüeli |
| **Keşif Kolisi** | 25 | ₺79,99 | $3,99 | ₺3,20 | −%68 | Min 3 Nadir + görünür pity sayacı | Karne/ara ödül |
| **Koleksiyoncu Kasası** | 50 | ₺129,99 | $5,99 | ₺2,60 | −%74 | **Min 1 Destansı** + 5 Nadir | Doğum günü hediyesi |
| **Sezon Kumbarası** | 100 | ₺199,99 | $8,99 | ₺2,00 | −%80 | **1 seçmeli parça** (Efsanevi hariç) + min 2 Destansı + 10 Nadir + tam kopya koruması (ilk 25'te) | Bayram/büyük hediye; sezon koleksiyoncusu |

₺1–5 bandı 5'li ve üzeri tüm paketlerde tutuyor; en agresif nokta ₺2,00.

### 1.3 Fiyat psikolojisi gerekçeleri

- **Çapa = Tekli ₺9,99.** Görevi satmak değil, merdiveni ucuz göstermek: yanında 10'lu "%60 indirim"
  okunur. İkinci çapa 100'lük: "₺199,99'a 100 sürpriz" cümlesi tüm mağazanın değer algısını kurar.
- **"En popüler" rozeti = 10'lu (₺39,99):** (a) TR'de ilkokul haftalık harçlık bandına oturur;
  (b) kiler mekaniğiyle 2–3 güne yayılır, ideal tekrar-alım ritmi (2 hafta) üretir; (c) ortalama
  sepeti tekliden 4× yukarı çeker. Rozet **gerçek satış verisiyle** 30 günde bir doğrulanır —
  yalan rozet, güven markasında yasak.
- **Decoy = 25'li.** 50'linin hemen altında durur; "₺50 daha ver, Destansı garantisi al" sıçramasını
  tetikler. 50'li, hediye senaryosunun varsayılan seçimi olur.
- **Raf kıyası mağaza metni** (kategori kıyası; marka adı kullanılmaz — hukuk onayından geçirilir):
  - 100'lü kartında: *"Market rafında 3 sürpriz yumurta fiyatına¹ burada 100 sürpriz."*
    (¹ dipnot: dönem ortalama market fiyatlarıyla)
  - Ebeveyn paneli üst bandı: *"1 sürpriz yumurta marketten: ~₺55. Yuvo'da: ₺2'den başlayan
    fiyatlarla — üstelik şeker yok, çöp yok, kaybolan parça yok."*
  - Onboarding e-postası: *"Merakın fiyatını 25'e böldük."*
- **Fiyat sonları:** Satışta ,99; ebeveyn harcama raporunda **yuvarlanmış gerçek toplam** ("Bu ay: ₺120").
  Satışta psikoloji, raporda dürüstlük.

### 1.4 Biyom temalı özel paketler (deterministik + rastgele hibrit)

Ayda 1 biyom paketi dönüşümlü vitrine girer (canlı-ops takvimi sezon ritmiyle hizalı):

| Paket | İçerik | TR₺ | Not |
|---|---|---|---|
| **Mercan Koyu Paketi** | O aileden 10 filtreli yumurta (tamamlama olasılığı yüksek) + Mercan temalı dekor seti (listeli) + 1 kabuk kozmetiği | ₺59,99 | 10'ludan ₺20 pahalı; farkı deterministik kozmetik taşır |
| **Ay Bahçesi Paketi** (final haftası) | 10 filtreli yumurta + gece dekoru + 1 seçmeli Az Bulunur davetiyesi | ₺69,99 | FOMO değil kutlama: paket her sezon finalinde geri gelir |

Kural: filtreli havuzun kendi oranları **ayrı Şeffaflık Kartı** ile gösterilir (Apple/Google
gerekliliği paket bazında karşılanır).

### 1.5 Hediye paketleri (bayram · karne · doğum günü)

TR'de yılda net talep üreten üç hediye anı: **iki bayram + karne günü + doğum günü.**
Akraba (babaanne/dede, hala/teyze/amca/dayı) → çocuk akışı:

1. Akraba, web mağazasından (komisyonsuz kanal; aynı paraya +%16 içerik verilebilir — Monopoly GO
   emsali) veya uygulamadan "Hediye Gönder"e girer.
2. Paket seçer (varsayılan öneri: 50'li) → **hediye sarma ekranı:** kart deseni (bayram/karne/doğum
   günü/"aferin"), 15 sn **sesli mesaj** ("İyi ki doğdun Elif, dedenden!") ve teslim tarihi
   (bayram sabahı 09:00 vb.).
3. Bağlantı/QR çocuğun ebeveynine gider → panelde **tek dokunuş kabul** (ebeveynin harcama limitine
   sayılmaz — ayrı hediye sayacı; ama kiler açma tavanına sayılır → aşırı açma yine imkânsız).
4. Çocuk tarafında: adaya **sarılı hediye kutusu** düşer, seçilen tarihte açılır; açılışta sesli
   mesaj çalar, Kiki kurdeleyi çeker.
5. Teşekkür dönüşü: çocuğun (ebeveyn onaylı) çizim/ses teşekkürü — **viral döngü:** hediye alan
   aile, hediye gönderen aile olur.

Ürünleştirme: "Bayram Harçlığı" vitrini (bayram öncesi 10 gün), yazdırılabilir **hediye
sertifikası** PDF (zarfa koyup elden verme — bayram harçlığı ritüelinin dijital köprüsü).
Hedef: hediye kanalı = paket gelirinin %15–20'si (bayram haftalarında %30+).

### 1.6 Starter pack + sezon açılış paketi

| Paket | Koşul | İçerik | TR₺ | Mantık |
|---|---|---|---|---|
| **Hoş Geldin Sepeti** | Profil başına 1 kez; geri sayım YOK | 10 yumurta + 1 garantili Nadir + 1 dekor + 1 kozmetik (listeli) | ₺19,99 (~₺55 karşılığı → −%64) | İlk ödeme bariyerini kırmak; −%90 yapılmaz, değer algısı korunur |
| **Sezon Açılış Paketi** | Her sezonun ilk 14 günü | 25 yumurta + sezon dekor seti + 1 seçmeli Az Bulunur | ₺69,99 | "Kaçırdın" mesajı yok — gelecek sezon yine gelir |

### 1.7 Yuvo Club × Paket hibrit sinerjisi

Abonelik (₺79,99/ay) ana gelir kalır; paketlerin kanibalize etmemesi için **Club her pakette
görünür avantaj** verir:

| Club avantajı | Değer | Amaç |
|---|---|---|
| Tüm paketlerde **+%10 bonus yumurta** (10'lu→11, 100'lü→110) | ~%10 | "Önce Club, sonra paket" sıralaması |
| Ayda 1 kez 5'li paket **₺14,99** (−%40) | ₺10 | Aylık aktif dokunuş; iptal düşünene somut kayıp |
| Hediye sarma kartları + özel temalar ücretsiz | kozmetik | Hediye kanalını Club'a bağlar |
| Kilerden **+1/gün** ek açma (tavan 5→6) | pacing | Sağlıklı bant içinde kalır |

Çapraz mesaj (yalnız ebeveyn panelinde): *"Bu ay ₺120'lik paket aldınız. Club (₺79,99) ile aynı
içerik + günlük bonus + kozmetik dolap."* → paket alıcısını aboneye çevirme (upsell).

**Gelir karışımı hedefi (v2):** abonelik %45–55 / paket+hediye %35–45 / deterministik paketler %10.
*(v1'deki "%60–70 abonelik" hedefinin revizyonu.)*

## 2. Mağaza Ekranı Tasarımı

### 2.1 İki yüzlü mağaza: çocuk profili vs ebeveyn paneli

**Çocuk profili mağaza GÖRMEZ — "Dilek Kavanozu" görür** (nag-factor yasağı sürer):

- Albümde eksik parçaya bakarken tek buton: **"Dilek Kavanozuna At"** 🫙 (fiyat yok, TL yok,
  "aldır" yok).
- Kavanoz haftada en fazla 5 dilek alır. Kiki'nin repliği nötr: "Dileğin kavanozda!" — asla
  "annene söyle".
- Dilekler panele sessizce düşer (push YOK; ebeveyn paneli açınca görür). Apple **Ask to Buy**
  zihinsel modelinin karşılığı — öğrenme maliyeti sıfır.
- Satın alınan yumurta çocuğa **adaya gelen kargo balonu** olarak ulaşır — çocuk deneyiminde
  ticaret dili sıfır.

**Ebeveyn paneli mağazası (PIN/biyometri arkası):**

```
┌─────────────────────────────────────────────┐
│ [Bu ay: ₺120 / limit ₺400]  ▓▓▓░░░░  %30    │ ← her an görünür harcama barı
├─────────────────────────────────────────────┤
│ 🫙 Elif'in dilekleri (3)  [görüntüle]        │
├─────────────────────────────────────────────┤
│ PAKETLER  (birim fiyat her kartta yazılı)   │
│ [Tekli ₺9,99] [5'li ₺24,99] [10'lu ₺39,99★] │
│ [25'li ₺79,99] [50'li ₺129,99] [100 ₺199,99]│
├─────────────────────────────────────────────┤
│ 🎁 Hediye Gönder   │  🏝️ Mercan Koyu Paketi │
├─────────────────────────────────────────────┤
│ ℹ️ Oranlar ve nasıl çalışır?  [Şeffaflık]    │
└─────────────────────────────────────────────┘
```

### 2.2 Oran gösterimi: "Şeffaflık Kartı"

Her paket kartında **"Ne çıkabilir?"** butonu; satın alma özetinde oran tablosu **varsayılan açık**
(rakiplerin çoğu bunu gömüyor — [DiGRA uyum araştırması](https://digraa.org/wp-content/uploads/2022/02/DiGRAA_2022_paper_2.pdf);
biz vitrine koyuyoruz):

| Nadirlik | Olasılık (kanonik, v2·02) | Bu pakette garanti |
|---|---|---|
| Yaygın | %55 | — |
| Az Bulunur | %25 | ✓ en az 1 (5'li+) |
| Nadir | %14 | ✓ en az 1 (10'lu+) |
| Destansı | %4,6 | 50'li ve üzeri garantili |
| Efsanevi | %0,9 + kötü şans koruması (100 yumurtada kesin) | **Vaat/seçim olarak satılmaz** ✨ |
| Gizli Pufi | %0,5 | Hiçbir pakette garanti yok — saf sürpriz |

Altında iki cümle: *"Kopya koruması: üst üste aynı parça çıkma olasılığı her kopyada düşer.
Kötü şans koruması: 15 yumurtada Nadir çıkmazsa 16.'da garantidir."* → pity sistemi **sigorta
diliyle.** "Efsanevi vaat olarak satılmaz" satırı paradoksal biçimde en güçlü satış cümlesi:
"cüzdanla bitmiyor, oyunla bitiyor" güvencesi.

### 2.3 Satın alma onay akışı (3 adım — bilerek iki dokunuşta bitmez)

1. **PIN/biyometri.**
2. **Özet ekranı:** içerik + Şeffaflık Kartı (açık) + *"Bu ay: ₺120 → bu alımla: ₺160 / limit ₺400"* + birim fiyat.
3. **Onay:** platform IAP dialoğu. Sonrasında panelde makbuz + e-posta.

Sürtünme bilinçli: hedef dürtü alımı değil **pişmanlıksız alım** (iade oranını düşürür; iade oranı
mağaza algoritmalarında gizli sağlık sinyalidir).

### 2.4 Aylık harcama limiti UX

- İlk paket alımından **önce** zorunlu kurulum: *"Aylık harcama sınırınızı belirleyin."*
- **Slider: ₺0 ─ ₺100 ─ [₺400 varsayılan] ─ ₺750 ─ ₺1.500 (üst uç).** ₺400 ≈ 2× Sezon Kumbarası ≈
  1 market maxi yumurtası — "makul aile bütçesi" çapası.
- ₺750 üstünde yumuşak onay: *"Bu, ayda 3+ büyük pakete denk. Emin misiniz?"*
- Limit dolunca: kartlar gri + *"Bu ayın sınırına ulaştınız — 12 Ağustos'ta yenilenir."*
  Limit artırımı **24 saat bekleme süreli** (gece yarısı dürtüsüne soğuma tamponu).
  Hediyeler limite sayılmaz ama ayrı satırda raporlanır.

### 2.5 Aylık harcama raporu e-postası (her ayın 1'i)

Konu: **"Elif'in Ağustos özeti: ₺160 harcandı, 9 yeni Pufi 🥚"**

Bloklar: (1) Toplam: ₺160/₺400 — geçen ay ₺120; (2) Döküm: 10'lu ×2, Club ×1; (3) Hediye:
Babaanne'den 50'li (bütçenize sayılmadı); (4) Karşılık: 29 yumurta, 9 yeni parça, Mercan Koyu %71;
(5) Oyun sağlığı: ort. 24 dk/gün, en çok oynanan mini oyun; (6) Tek dokunuş: limit · iade ·
abonelik. **E-postada upsell yasak** — rapor satış kanalı değil güven kanalı (ekran görüntüsü okul
WhatsApp gruplarında bizim reklamımız olur).

## 3. Gelir Modeli Projeksiyonu (100K DAU)

### 3.1 Varsayımlar

| Varsayım | Muhafazakâr | Baz | İyimser |
|---|---|---|---|
| DAU | 100.000 | 100.000 | 100.000 |
| DAU/MAU | %25 → MAU 400K | %25 → MAU 400K | %28 → MAU 357K |
| Aylık ödeyen dönüşümü (MAU) | %1,2 | %2,0 | %3,5 |
| Ödeyen sayısı | 4.800 | 8.000 | 12.500 |
| Abone oranı (ödeyenler içinde) | %55 | %50 | %45 |
| Abonelik ARPPU | ₺79,99 | ₺79,99 | ₺83 |
| Paket alıcısı ARPPU | 1,1×₺52=₺57 | 1,3×₺64=₺83 | 1,6×₺78=₺125 |
| Hediye geliri (pakete ek) | +%8 | +%15 | +%22 |

### 3.2 Hesap (baz senaryo)

```
Aboneler: 8.000 × %50 = 4.000 × ₺79,99            = ₺319.960
Paket alıcıları: 4.000 × ₺83                      = ₺332.000
Abonelerin çapraz paket alımı: 1.200 × ₺50        = ₺60.000
Hediye kanalı: (332.000+60.000) × %15             = ₺58.800
─────────────────────────────────────────────────
Aylık BRÜT                                        ≈ ₺770.760
NET (−%30 komisyon)                               ≈ ₺539.500
NET (−%15 small business)                         ≈ ₺655.100
```

### 3.3 Üç senaryo özeti (aylık, 100K DAU, TR)

| | Muhafazakâr | Baz | İyimser |
|---|---|---|---|
| Brüt aylık | ≈ ₺445.000 | ≈ ₺771.000 | ≈ ₺1.560.000 |
| Net (−%30 / −%15) | ₺312K / ₺378K | ₺540K / ₺655K | ₺1.092K / ₺1.326K |
| Karışım (abonelik/paket/hediye) | 62/33/5 | 47/44/9 | 40/47/13 |
| ARPDAU (brüt) | ₺0,15 | ₺0,26 | ₺0,52 |
| Yıllık net | ~₺3,7–4,5M | ~₺6,5–7,9M | ~₺13–16M |

**Yorum:** ARPDAU bandı casual benchmarklarının altında — **bilinçli**: limit + tavan mimarisi
tavanı kırpar. İki büyüme kolu telafi eder: (1) **US/EU açılımı** — aynı merdiven $ fiyatlarıyla
3–5× ARPPU taşır; (2) **hediye kanalı** — dönüşüm hesabına girmeyen "ikinci cüzdan".

## 4. KPI Seti

### 4.1 Paket satış metrikleri

| Metrik | Tanım | Hedef / Alarm |
|---|---|---|
| Paket boyutu dağılımı | İşlemlerin kademelere dağılımı | 10'lu modda (%35–45); tekli >%30 → vitrin revizyonu |
| Ortalama sepet | Paket geliri / işlem | ₺60–70; ₺40 altı = küçük paket tuzağı |
| Tekrar alım aralığı | İki paket arası medyan gün | 14–21 gün (harçlık ritmi); <7 gün segmenti → sağlık alarmı |
| İlk alım dönüşümü | Starter görme → alma | %8–12 iyi; %20+ → fiyat değer algısını riske atacak kadar düşük olabilir |
| Kiler devir hızı | Satın alınan yumurtanın açılma süresi | 100'lük ~20–25 günde erimeli; 3 günde eriyor + limit artışı → pacing incele |
| Hediye payı | Hediye/paket geliri | %15; bayram haftaları ≥%30 |
| Dilek→alım dönüşümü | Kavanoz dileğinin 30 günde alıma dönmesi | İzlenir ama optimize EDİLMEZ (nag-factor deney yasağı) |
| Limit-doluluk | Limitinin ≥%80'ini kullanan ödeyen oranı | %15–25 normal; >%40 → mimari baskı üretiyor, gözden geçir |
| İade oranı | İade/toplam işlem | <%1,5; >%3 → onay akışını sertleştir |
| Club×paket çaprazı | Abonelerin paket alma oranı | %25–35 = sinerji; churn artarsa kanibalizasyon alarmı |

### 4.2 Sağlık metrikleri — "ters whale alarmı"

Klasik F2P'de yüksek harcayan "beslenir"; çocuk segmentinde aynı sinyal **müdahale sinyalidir**:

| Eşik (aylık, hesap bazında) | Otomatik müdahale |
|---|---|
| >₺750 **veya** 7 günde 3+ işlem | Panelde nötr bilgi kartı + limit hatırlatması |
| >₺1.500 **veya** limit 2 ay üst üste %100 + artırılmış | Yeni alımda 24 saat soğuma + destek ekibinden insan e-postası |
| Gece 00–06 işlem kümesi, iade sonrası hızlı tekrar alım, kısa sürede 2× limit artışı | "Çocuk PIN'i biliyor" şüphesi → PIN sıfırlama + ebeveyn doğrulaması |
| Gelirin >%20'si en üst %1 hesaptan | İş modeli alarmı — bu oyun whale ekonomisi OLMAYACAK; mimari revize (yatırımcı taahhüt metriği) |

Bu set pazarlanabilir: **"Aşırı harcamayı biz durdururuz"** — sürpriz fatura haberlerinin tam
karşı pozisyonu.

### 4.3 v1 kılavuzunda güncellenecekler

- `docs/09-monetizasyon-modeli.md` §4: "10'lu/50'li/100'lü paket = kumar mekaniği" satırı → v2
  kararıyla revize (oran açıklamalı + pity'li + limitli + Efsanevi-satılmaz yapı); §1 gelir
  karışımı hedefleri güncellenir.
- `docs/08-ekonomi-ve-odul-sistemi.md`: gider tablosuna "Kiler" satırı; Monte Carlo simülatörüne
  satın alma hacmi + limit dağılımı parametresi.
- Belçika/Hollanda için **bölge bayrağı**: o ülkelerde vitrin deterministik alternatiflere düşer
  (bölgesel kapamayla yönetilir).

## Kaynaklar

[Apple Developer — TR fiyat güncellemesi](https://developer.apple.com/news/?id=4li349ao) ·
[Mirava — App Store fiyat katmanları](https://www.mirava.io/blog/apple-app-store-price-tiers-how-they-work-2026) ·
[Stash — Monopoly GO mağazası](https://www.stash.gg/blog/monopoly-go-store) ·
[Theria — Monopoly GO store guide](https://theriagames.com/guide/monopoly-go-store-guide/) ·
[Dexerto — Pokémon GO shop](https://www.dexerto.com/pokemon/pokemon-go-shop-updated-list-items-prices-box-changes-1315679/) ·
[Topuplist — Brawl Stars gem fiyatları](https://topuplist.com/blogs/detail/brawl-stars-gems-price-best-value-packs-2026) ·
[Sharpr — Supercell loot-box kaldırımı](https://sharpr.substack.com/p/supercell-removes-loot-boxes-from) ·
[PocketGamer.biz — starter pack](https://www.pocketgamer.biz/comment-and-opinion/64530/best-practices-starter-bundles/) ·
[Deconstructor of Fun — starter pricing](https://www.deconstructoroffun.com/blog/2024/4/8/free-to-play-starter-pack-pricing-when-conversion-is-king-we-may-price-too-low) ·
[Fenwick — Apple oran zorunluluğu](https://www.fenwick.com/insights/publications/apple-now-requires-disclosure-of-loot-box-odds) ·
[Fenwick — Google Play oran zorunluluğu](https://www.fenwick.com/insights/publications/google-play-now-requires-disclosure-of-loot-box-odds) ·
[The Hill — Roblox/FTC](https://thehill.com/homenews/5888060-roblox-gaming-platform-ftc-investigation/) ·
[Claims Journal](https://www.claimsjournal.com/news/national/2026/05/21/337716.htm) ·
[MAF — dönüşüm benchmarkları](https://maf.ad/en/blog/mobile-game-conversion-rates/) ·
[Business of Apps](https://www.businessofapps.com/data/mobile-game-conversion-rates/) ·
[Juego Studio — ARPDAU/ARPPU](https://www.juegostudio.com/blog/arpdau-benchmarks-by-game-genre) ·
[Apple — Ask to Buy](https://support.apple.com/en-us/105055) ·
[Akakçe — Kinder Surprise](https://www.akakce.com/cikolata/en-ucuz-kinder-surprise-20-gr-surpriz-yumurta-fiyati,876670504.html) ·
[Akakçe — Kinder Maxi](https://www.akakce.com/cikolata/en-ucuz-kinder-100-gr-surprise-maxi-yumurta-fiyati,919026537.html) ·
[Cimri — Kinder 3'lü](https://www.cimri.com/cikolata/en-ucuz-kinder-20-gr-surprise-yumurta-fiyatlari,2584816518) ·
[DiGRA — oran açıklama uyumu](https://digraa.org/wp-content/uploads/2022/02/DiGRAA_2022_paper_2.pdf)
