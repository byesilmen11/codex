# v2·02 · Koleksiyon Sistemi & Düşüş Algoritması (Satın Alınabilir Yumurta Matematiği)

> **Bağlam:** v1 tasarımı (300 parça; %55/25/14/4,5/1,5; pity 15/40/100; Atölye) yalnızca oyunla
> kazanılan ~4 yumurta/gün ritmine göreydi. v2'de yumurtalar satın alınabiliyor → haftalık açılış
> hacmi 20–75+ bandına çıkıyor; matematik yeniden dengelendi. Tüm sayılar Monte Carlo
> simülasyonuyla (400–2.000 koşu/senaryo) doğrulandı — sim kodu repoda:
> [`tools/economy-sim/collection_sim.py`](../../tools/economy-sim/collection_sim.py).

## KISIM 1 — Araştırma Özeti

### 1.1 Pop Mart blind box yapısı

| Parametre | Endüstri değeri |
|---|---|
| Seri boyutu | Tipik **6 veya 12 standart + 1 secret/chase** |
| Secret oranı | **1/72** standart; 1/144; ultra 1/720 |
| Şeffaflık | Oranlar **kutunun arkasına basılır** |
| Tam set garantisi | "Whole set" (koli) alımında kopyasız tam set — secret hariç |
| Koleksiyoncu davranışı | Kopyalar biriktirilip **hediye edilir**; secret ikincil pazarda statü |

**Yuvo çıkarımı:** Secret, set tamamlamayı bloke etmez (Pop Mart'ta set'e dahil sayılmaz);
"???" merakı + çok düşük oran + basılı şeffaflık birebir uyarlanabilir.
Kaynaklar: [smartbuy.alibaba](https://smartbuy.alibaba.com/popmart/what-are-the-odds-of-getting-the-secret-labubu) · [FunShop — rarity](https://www.funshop.com/drops/limited-editions-chase-figures-and-rarity-tiers-across-major-blind-box-brands/) · [StockX Guide](https://stockx.com/news/blind-box-guide/)

### 1.2 Panini albüm matematiği (coupon collector)

- Eşit olasılıklı N parça: **E[T] = N·H_N ≈ N(ln N + γ)**.
- **2018 Dünya Kupası: 682 çıkartma** → beklenen ~4.832-4.844 çıkartma = **967 paket ≈ £774**
  (Cardiff Üniversitesi, Prof. Paul Harper).
- **İsraf çarpanı 7,1×** — "kimse albümü bitiremezdi" anısının matematiksel kanıtı: sorun nadirlik
  bile değil, kopya birikiminin doğası.
- Takas etkisi: 2 kişi −%30, 5 kişi −%57, 10 kişi −%68 paket.

**Yuvo çıkarımı:** (a) İsraf çarpanını 7× → ~1,35×'e indiren şey akıllı düşüş + Atölye —
"dijital ama adil Panini" iddiasının sayısal kanıtı, ebeveyn sayfasına yazılabilir. (b) Takas
yasak olduğu için −%30/−%57'lik etki **hediye + Atölye** ile telafi edilmek zorunda: kopya
ekonomisi lüks değil, zorunluluk.
Kaynaklar: [Cardiff University](https://www.cardiff.ac.uk/news/view/1136091-world-cup-stickers) · [Whitehouse — CCP](https://www.siwhitehouse.co.uk/blog/2010/04/25/panini-football-stickers-and-the-coupon-collector-problem/) · [Goal.com](https://www.goal.com/en-us/news/panini-world-cup-stickers-how-much-will-it-cost-to-fill-russia-2018-album/1bz17wzsuvb9o1sfplclhy0k5t)

### 1.3 Modern gacha pity sistemleri

| Sistem | Mekanik | Değer |
|---|---|---|
| Genshin base | 5★ temel oran | %0,6 |
| Genshin **soft pity** | 74.'ten itibaren ~+6 puan/çekiliş | 74-85'te düşer |
| Genshin **hard pity** | Mutlak tavan | 90 |
| Genshin konsolide | Fiili ortalama | **%1,6** — temel oranın ~2,7 katı |
| FGO | 330 çekiliş, banner bitince **sıfırlanır** | Anti-örnek |
| Granblue **spark** | 300 çekiliş → **listeden seç** | "Seçmeli garanti"nin atası |

**Yuvo çıkarımı:** (a) "düşük taban + soft pity" = varyans kırpılır, heyecan korunur — Efsanevi
için uyarlandı. (b) Spark = 100'lü paketin "1 seçmeli" garantisinin emsali. (c) FGO'nun sıfırlanan
pity'si anti-örnek: **sayaç asla sıfırlanmaz, paket/gün sınırı tanımaz.**
Kaynaklar: [PlayAware](https://playaware.in/guides/genshin-pity) · [gbf.wiki — spark](https://gbf.wiki/Draw) · [GamePress — FGO](https://fgo.gamepress.gg/q-a/guaranteed-gacha-pulls-0)

### 1.4 Kinder serileri

Natoons serileri **16-17 figür**; dalga dalga yenilenen kısa dönemler. 30'luk Yuvo ailesi ≈ iki
Kinder serisi; kilometre taşları (10/20/27/30) fiilen o ritmi üretir.
Kaynak: [Coleka — Natoons](https://www.coleka.com/en/kinder-surprise/buildable-series/series-vd/natoons-animals_r35521)

## KISIM 2 — Tasarım

## 2.1 Yeniden Ayarlanmış Nadirlik Matematiği

### 2.1.1 v2 oran tablosu (kanonik)

| Nadirlik | Adet/aile | Toplam | v1 oran | **v2 oran** | Not |
|---|---|---|---|---|---|
| Yaygın | 12 | 120 | %55 | **%55** | — |
| Az Bulunur | 9 | 90 | %25 | **%25** | — |
| Nadir | 6 | 60 | %14 | **%14** | — |
| Destansı | 2 | 20 | %4,5 | **%4,6** | +0,1 |
| Efsanevi | 1 | 10 | %1,5 | **%0,9 + soft pity** | konsolide fiili **%1,84** |
| **Gizli (YENİ)** | +1 | +10 | — | **%0,5** | albüme **dahil değil**, "???" |

**Neden %1,5 → %0,9 + pity?** Genshin dersi: taban düşer, soft pity (70'ten itibaren +6
puan/yumurta) + hard pity (100) ortalamayı korur → **ortalama cömertleşir, varyans kırpılır.**
v1'de 200 yumurtada hiç Efsanevi görmeme olasılığı %4,9'du; v2'de 100 yumurtada matematiksel
kesinlik. 200.000 çekilişlik simülasyon: **ortalama 54,3 yumurtada 1 Efsanevi, konsolide %1,84** —
v1'den hem cömert hem öngörülebilir. Pop Mart'ın 1/72'siyle aynı mertebe: tür normu.

### 2.1.2 Coupon collector hesabı

Eşit olmayan olasılıklarda (Flajolet–Gardy–Thimonier):

```
E[T] = ∫₀^∞ [ 1 − Π_i (1 − e^(−p_i·t)) ] dt
```

Sınıf başına beklenen yumurta (pity'siz): Yaygın 1.171 · Az Bulunur 1.830 · Nadir 2.006 ·
Destansı 1.564 · **Efsanevi 3.254 ← darboğaz** · (Gizli 5.858).

| Senaryo (çıplak RNG, pity'siz) | Beklenen yumurta |
|---|---|
| Eşit olasılıklı 300 (teorik taban) | 1.885 |
| v1 oranları | 2.536 |
| v2 oranları | **3.420** |
| Gizli albüme dahil olsaydı (310) | 6.066 ← **bu yüzden dahil edilmez** |
| Tek aile, hedefli biyom yumurtası (30) | 173 |

Panini 682 için 4.844 idi. Çıplak RNG ile bizim albüm de "Panini kadar imkânsız" olurdu — pity +
akıllı düşüş + Atölye bu sayıyı 3.420'den **~400'e** indirir. **İsraf çarpanı: Panini 7,1× →
Yuvo v2 ~1,35×.**

### 2.1.3 Tamamlanma eğrisi (tüm sistemler dahil, Monte Carlo — 400 koşu/satır)

| Haftalık yumurta | Profil | Gün (P10/**medyan**/P90) | Açılan yumurta (P10/**medyan**/P90) |
|---|---|---|---|
| 28 | Ücretsiz, temel ritim (4/gün) | 92/**99**/106 | 368/**396**/424 |
| 35 | Ücretsiz + görevler (5/gün) | 78/**81**/85 | 390/**405**/425 |
| 50 | Hafif alıcı (~haftada 1×10'lu) | 57/**58**/64 | 407/**414**/457 |
| ~70 | Tavan alıcısı (kiler +5/gün dolu) | ~**45** (interpolasyon) | ~420-450 |
| 100* | Duyarlılık: tavan kaldırılırsa | 29/**31**/34 | 414/**442**/485 |
| 200* | Duyarlılık: sınırsız açılış | 15/**16**/18 | 428/**457**/514 |

\* **Uyum notu:** Kanonik günlük açılış tavanı v2·05'teki Kiler kuralıdır (kazanılan 3-5 +
kilerden ≤5 + Club +1 ≈ **maks ~70/hafta**). 100/200'lük satırlar tavansız duyarlılık analizidir —
tavanın neden var olduğunu gösterir.

**Okuma:**
- **Ücretsiz-aktif çocuk (35/hafta) medyan 81 günde bitirir** → 84 günlük sezonun içinde.
  (Önemli düzeltme: v1 parametreleriyle aynı simülasyon **~170 gün** veriyordu — v1'in "70-80 gün"
  vaadi ancak v2'nin akıllı düşüş ağırlıkları + Kabuk hibeleriyle tutuyor.)
- Temel ritim (28/hafta): sezonda ~%92 + Müze'de ~2 haftada bitirir (kayıp yok, gecikme var).
- Açılan yumurta sayısı hacimden bağımsız **~400-460'ta sabitlenir** (akıllı düşüş) →
  **"Para parça satın almaz, zaman satın alır."** Bu cümle ebeveyn sayfasına aynen yazılmalı.
- Tavan alıcısı ~6-7 haftada bitirir; sezonun kalanını **Gizli + Işıltılı + kozmetik** taşır (§2.4).

**Koruma rayları (v2 zorunlu):** Kiler tavanı (v2·05); aylık harcama limiti (varsayılan ₺400,
0'a indirilebilir); tüm oranlar + bu tablo Ebeveyn Bilgi Sayfası'nda.

### 2.1.4 Gizli Pufi katmanı ("secret/chase")

- Her ailede **1 Gizli** (toplam 10). Albümde **"???"** silueti; aile 30/30 olunca silüet
  belirginleşir + Kiki bilmece verir.
- Oran: biyom yumurtasında **%0,5 (1/200)** — Pop Mart 1/144'ün çocuk-dostu komşusu.
- **300/300 Altın Yumurta hedefine dahil DEĞİL** (dahil olsaydı beklenen tamamlama 3.420→6.066).
- **Atölye çıkışı:** aile 30/30 ise **300 Kabuk**'a üretilebilir → "chase" bile ulaşılabilir;
  tamamlanma olasılığı 1.
- 10/10 Gizli = **"Gölge Galerisi"** + "Gerçek Yumurta Bekçisi" nişanı (saf kozmetik/statü).
- Pity YOK (bilinçli): sistemdeki tek "saf şans" heyecanı — Atölye tavanı olduğu için etik.

## 2.2 Düşüş Algoritması (deterministik, sunucu-doğrulanabilir)

```text
# ---------- SABİTLER (sezon başında imzalanıp yayınlanır) ----------
ORAN      = {YAYGIN:0.550, AZBULUNUR:0.250, NADIR:0.140,
             DESTANSI:0.046, EFSANEVI:0.009, GIZLI:0.005}
SOFT_PITY_E = 70;  SOFT_ARTIS = 0.06;  HARD_PITY_E = 100
PITY_DESTANSI = 40          # 40 yumurtadır Destansı+ görmediyse
PITY_NADIR    = 15          # 15 yumurtadır Nadir+ görmediyse
KOPYA_SERI_ESIGI = 6        # 6 ardışık kopya → sıradaki kesin eksik parça
W_EKSIK = 4; W_EKSIK_SON3 = 12   # akıllı düşüş ağırlıkları
ONBOARDING = 10             # ilk 10 yumurta: hep eksik; 3.'sü Nadir+ garanti

# ---------- DETERMİNİSTİK RNG (denetlenebilirlik: commit-reveal) ----------
# Sezon başında sunucu SEED üretir, hash(SEED) yayınlanır (commit).
# Sezon sonunda SEED açıklanır → her açılış üçüncü tarafça yeniden hesaplanabilir.
fonksiyon rastgele(kullanici, n):
    return HMAC_SHA256(SEED, kullanici.id ‖ kullanici.yumurtaSayaci ‖ n) / 2^256

fonksiyon YUMURTA_AC(k, kaynakBiyom):
    k.yumurtaSayaci += 1

    # 1) ONBOARDING + anti-kötü-seri
    zorlaEksik = (k.yumurtaSayaci <= ONBOARDING) or (k.kopyaSerisi >= KOPYA_SERI_ESIGI)

    # 2) KADEME SEÇİMİ — önce hard pity, sonra ağırlıklı zar, sonra taban-yükseltme
    eger k.sayacE >= HARD_PITY_E - 1:
        kademe = EFSANEVI                            # mutlak tavan
    degilse:
        w = kopyala(ORAN)
        eger k.sayacE >= SOFT_PITY_E - 1:            # soft pity
            w[EFSANEVI] = min(0.95, ORAN[EFSANEVI] + SOFT_ARTIS*(k.sayacE - SOFT_PITY_E + 2))
            normalizeEt(w, sabit=GIZLI)              # Gizli oranına dokunma
        kademe = agirlikliSecim(w, rastgele(k,1))
        eger k.sayacD >= PITY_DESTANSI-1 ve kademe < DESTANSI: kademe = DESTANSI
        yoksa eger k.sayacN >= PITY_NADIR-1 ve kademe < NADIR: kademe = NADIR
        eger k.yumurtaSayaci == 3 ve kademe < NADIR:  kademe = NADIR   # onboarding garantisi

    # 3) PARÇA SEÇİMİ — akıllı düşüş
    havuz  = parcalar(kademe, kaynakBiyom)           # biyom yumurtası → o aile; karma → açık aileler
    eksik  = [p for p in havuz if !k.sahip(p)]
    eger kademe in {EFSANEVI, GIZLI} ve eksik != boş:
        parca = uniformSecim(eksik, rastgele(k,2))   # E/G hep eksik-öncelikli
    yoksa eger zorlaEksik ve eksik != boş:
        parca = uniformSecim(eksik, rastgele(k,2))
    degilse:
        agirlik(p) = 1                               eger k.sahip(p)
                   = W_EKSIK_SON3                    eger aileSayisi(p.aile) >= 27 veya albüm >= 270
                   = W_EKSIK                         diğer eksikler
        parca = agirlikliSecim(havuz, agirlik, rastgele(k,2))

    # 4) SONUÇ + SAYAÇLAR (asla süreyle/paketle sıfırlanmaz)
    eger k.sahip(parca): k.kabuk += KOPYA_DEGERI[kademe]; k.kopyaSerisi += 1
    degilse:             k.tahsisEt(parca);              k.kopyaSerisi  = 0
    k.sayacN = 0 eger kademe >= NADIR    degilse k.sayacN + 1
    k.sayacD = 0 eger kademe >= DESTANSI degilse k.sayacD + 1
    k.sayacE = 0 eger kademe >= EFSANEVI degilse k.sayacE + 1
    kaydet(k); return parca                          # append-only log → denetim

fonksiyon PAKET_AC(k, boyut, kaynakBiyom):           # paket garantileri
    sonuc = [YUMURTA_AC(k, kaynakBiyom) for i in 1..boyut]
    eger boyut >= 10  ve hicbiri(sonuc, >= NADIR):    yukselt(son(sonuc), NADIR)
    eger boyut >= 50  ve hicbiri(sonuc, >= DESTANSI): yukselt(son(sonuc), DESTANSI)
    eger boyut == 100: k.secimBileti += 1            # SPARK: 1 seçmeli parça (Efsanevi/Gizli hariç)
    return sonuc
# yukselt(): parça seçimi yeni kademede rastgele(k,3) ile DETERMİNİSTİK yeniden hesaplanır.
```

**Tasarım notları:** (1) Sayaçlar hesaba bağlıdır; paket, gün, biyom değişse de sıfırlanmaz.
(2) Sayaç sürekliliği sayesinde 100'lü pakette hard pity fiilen bir Efsanevi üretir — bu dürüstçe
ilan edilir ("pity matematiği gereği bu pakette en az 1 Efsanevi görme olasılığınız çok yüksektir"),
ama hiçbir pakette Efsanevi *vaat/seçim* olarak satılmaz (garanti ve seçim hakları Destansı'da durur).
(3) `HMAC(SEED, kullanıcı, sayaç)` + append-only log: her düşüş üçüncü tarafça yeniden üretilebilir.
(4) Çocuk arayüzünde sayaç yok; hepsi Ebeveyn Sayfası'nda.

## 2.3 Koleksiyon Haritası — 10 Aile

Oranlar **tüm ailelerde aynı** (adalet ilkesi); zorluk **erişim zamanı + yumurta kaynağı temposu +
mini oyun süresiyle** üretilir. Tek-aile hedefli simülasyon: P10 50 / medyan 72 / P90 ~81 yumurta.

| # | Aile | Tema | Çıtlatma varyantı | Açılış | Katman | Medyan bitirme |
|---|---|---|---|---|---|---|
| 1 | Güneş Çayırı | Çiftlik & çayır | Temel dokun-çıtlat + onboarding desteği | H1 | A | **6-7 gün** |
| 2 | Fısıltı Ormanı | Orman | Saklambaç: yumurta yaprak altında, önce bul | H1-2 | A | 8 gün |
| 3 | Pofuduk Tepeler | Bulut-yün | Yün topunu sürterek aç | H2-3 | A | 9 gün |
| 4 | Mercan Koyu | Deniz | Baloncuk patlatma; yumurta suda süzülür | H3-4 | B | 10 gün |
| 5 | Gökkuşağı Kanyonu | Renk | Kabuğu doğru renge boya | H4-5 | B | 11 gün |
| 6 | Yıldız Gölü | Işık | Gece modu: ateşböceği ışığıyla arama | H5-6 | B | 12 gün |
| 7 | Buz Pırıltısı Dağları | Kar | Buz katmanını ovarak erit (sabır jesti) | H6-7 | C | 13 gün |
| 8 | Kor Bahçesi | Sıcak | Ritim: kor söndüğü anda dokun | H7-8 | C | 14 gün |
| 9 | Bulut Krallığı | Gök | Eğim/kaydırma: uçan yumurtayı yakala | H8-9 | C | 15 gün |
| 10 | Ay Bahçesi | Gece | Ninni çal, yumurta ay ışığında yavaşça açılır | H10 | D | 14 gün |

Katman C'nin zorluğu kaynak kıtlığından gelir (günlük görev yumurtası az) — **oran asla
kötüleşmez**, pity aynen korur.

### Güneş Çayırı — tam aile listesi (12Y / 9AB / 6N / 2D / 1E + 1 Gizli)

| # | İsim | Tür | Nadirlik | Kart biyografisi (sesli okunur) |
|---|---|---|---|---|
| 1 | Cikcik | Civciv | Yaygın | Horoz çırağı; güneşten önce ötmeye çalışır, hep esner |
| 2 | Pamuş | Kuzu | Yaygın | Bulutları koyun sanıp gökyüzüne "mee" der |
| 3 | Vızbız | Bal arıcığı | Yaygın | Bütün çiçeklerin adresini bilir, kendi kovanını unutur |
| 4 | Mölü | Buzağı | Yaygın | Papatya koklamayı sever; her seferinde hapşırır |
| 5 | Gıdak | Tavukçuk | Yaygın | Sürpriz yumurta görünce heyecandan gıdaklar |
| 6 | Badi | Ördek yavrusu | Yaygın | Sıra olmayı hep şaşırır, hep en önde biter |
| 7 | Hophop | Çekirge | Yaygın | Zıplayışlarını sayar, hep "üç"te kaybolur |
| 8 | Fıstık | Yer sincabı | Yaygın | Yanaklarında tohum saklar; yerini asla hatırlamaz |
| 9 | Boncuk | Uğur böceği | Yaygın | Sırtındaki puanları sayarken uyuyakalır |
| 10 | Kıvrık | Solucancık | Yaygın | Toprak altı tünellerin haritasını çizer |
| 11 | Toprik | Tarla faresi | Yaygın | Hasat şarkıları mırıldanır |
| 12 | Çiğdem | Çayır çiçeği perisi | Yaygın | Sabah çiyinden kendine minicik taçlar yapar |
| 13 | Pırpır | Kelebek | Az Bulunur | Her sabah kanat desenini değiştirir; ikisi asla eş olmaz |
| 14 | Zıpzıp | Yavru tavşan | Az Bulunur | Havuç değil çilek delisi; kimseye söylemeyin |
| 15 | Cıvıl | Serçe | Az Bulunur | Her melodiyi ezberler — hep yanlış |
| 16 | Evcik | Salyangoz | Az Bulunur | Kabuğunu misafire açar, papatya çayı ikram eder |
| 17 | Dikenik | Kirpi | Az Bulunur | Sarılmayı çok ister; herkes uzaktan sarılır |
| 18 | Kösti | Köstebek | Az Bulunur | Gözlüğünü toprakta unutur, yine de yolu bulur |
| 19 | Meke | Oğlak | Az Bulunur | Kafa tokuşturmayı selamlaşma sanır |
| 20 | Fındık | Çoban köpeği yavrusu | Az Bulunur | Kuzular yerine kelebekleri güder |
| 21 | Kırıntı | Karınca | Az Bulunur | Yüz kat büyük yük taşır; teşekkür bekler |
| 22 | Petek | Arı kraliçesi | Nadir | Baldan tacı güneşte parlar; Vızbız'ın tek hatırladığı adres |
| 23 | İbik | Horoz | Nadir | Sesini sezonda bir kez tam ayarında bulur; o gün bayramdır |
| 24 | Yele | Midilli | Nadir | Koşarken yelesinden altın toz savrulur |
| 25 | Makas | Kırlangıç | Nadir | Kuyruğuyla bulutları ikiye böler |
| 26 | Tavus | Tavuskuşu | Nadir | Kuyruğunu yalnızca içten bir iltifat duyunca açar |
| 27 | İpekçe | İpek örümceği | Nadir | Çayıra sabah çiyinden dantel örer |
| 28 | Boğaç | Güneş buzağısı | Destansı | Boynuzları gün doğumu ışığı saçar; kışın çayırı o ısıtır |
| 29 | Şafak | Altın tarlakuşu | Destansı | Sabahı onun şarkısı getirir; geç kalkarsa sis basar |
| 30 | Gündoğan | Güneş kuşu | Efsanevi | Kanat çırpınca altın polen yağar; adanın ilk sabahının şarkısını hatırlayan tek Pufi |
| 31 | **Hışır** | Korkuluk Pufisi | **GİZLİ (???)** | Herkes onu cansız sanır; ay ışığında tek başına dans eder |

**Onboarding istisnası (yalnız bu aile):** Efsanevi hard pity 100 → **50** (ilk "VAY CANINA" anı
ilk 2 haftada garanti); ilk 10 yumurta hep yeni parça, 3.'sü Nadir+.

## 2.4 Kopya Ekonomisi v2

**Enflasyon teşhisi:** Albüm dolunca her yumurta kopya; v1 değerleriyle kopya beklentisi
3,03 Kabuk/yumurta → 100'lü paket ≈ 2 Efsanevi üretimi — tören değeri çökerdi. Ayrıca v1'de
üretim/kopya makası tutarsızdı (Yaygın 4×, Efsanevi 3,75×).

| Nadirlik | Kopya verirse (v1→v2) | Üretim maliyeti (v1→v2) | Makas |
|---|---|---|---|
| Yaygın | 1 → **1** | 4 → **5** | 5× |
| Az Bulunur | 2 → **2** | 8 → **10** | 5× |
| Nadir | 5 → **4** | 20 → **25** | 6,25× |
| Destansı | 15 → **10** | 60 → **80** | 8× |
| Efsanevi | 40 → **25** | 150 → **200** | 8× |
| Gizli | — → **60** | — → **300** (şart: aile 30/30) | 5× |

- Yeni kopya beklentisi **2,60 Kabuk/yumurta**; Efsanevi üretimi ≈ 77 kopya-yumurta emeği.
- **Usta Kabuk'un fırını: haftada 5 üretim** (albüm ≥290'da limitsiz — "final koşusu" hakkı).
  Yoğun alıcı Kabuk yığamaz → üretim "sabır yolu" kalır; ücretsiz oyuncu etkilenmez.
- **Hacimden bağımsız Kabuk gelirleri:** haftalık görev ~25 Kabuk; kilometre taşları 10/20/27/30 →
  **15/30/60/100 Kabuk** (sezon toplamı 2.050). Ücretsiz oyuncunun ~4-5 Efsanevi üretimini bu
  finanse eder — hibeler olmadan 28/hafta medyanı 99 → ~139 güne geriler (ölçüldü).
- **Işıltılı katmanı = kopya fazlasının prestij çukuru.** Tam Işıltılı albüm ≈ sezon boyu sürecek
  ~2.500-3.000 yumurtalık kozmetik-saf uzun kuyruk — tavan alıcısının sezon sonu içeriği budur.
  Karar gerilimi korunur: Kabuk mu, Işıltı mı, hediye mi?
- Ek Kabuk giderleri: kabuk kozmetikleri, dekorasyon, Şako'ya hediye sahneleri.

## 2.5 Zorluk Dereceleri — Sayısal Hedefler

| Katman | Aileler | Ücretsiz-aktif medyan | Tavan alıcısı | Ayar mekanizması |
|---|---|---|---|---|
| A — Isınma | Çayır, Orman, Tepeler | 6-9 gün/aile; 3 aile ≤ H4 | ≤ 10 gün toplam | Onboarding pity (E:50), bol görev yumurtası |
| B — Ritim | Koy, Kanyon, Göl | 10-12 gün; 6 aile ≤ H8 | ≤ H3 | Standart |
| C — Ustalık | Buz, Kor, Bulut | 13-15 gün; 9 aile ≤ H11,5 | ≤ H4-5 | Görev yumurtası kıt; oran/pity aynı |
| D — Final | Ay Bahçesi | 14 gün (H10-12) | H5-6 | Luna hedefli yumurta verir |
| Albüm 300/300 | — | **medyan 81 gün** · P90 85 | **~45 gün** | §2.1.3 |
| Gizli 10/10 + Işıltılı | — | sezonlar arası / Müze | sezon sonu kuyruğu | 1/200 + 300 Kabuk; 4 kopya |

**Kabul kriterleri (soft-launch telemetrisi):**
1. 35/hafta kohortunda sezon içi bitirme ≥ %55;
2. hiçbir kohortta "son 3 parça" fazı > toplam sürenin %15'i;
3. Efsanevi'siz en uzun seri ≤ 100 (matematiksel garanti, telemetriyle doğrula);
4. alıcı kohortunun D30 elde tutması ücretsiz kohorta ≥ −5 puan yakın (satın alma içeriği
   öldürmüyor kanıtı).

Sapma varsa sırasıyla oynanacak vidalar: `W_EKSIK` → kilometre taşı Kabuk hibeleri → `SOFT_PITY_E`.

## v1 Kılavuzuna İşlenecek Üç Kritik Değişiklik

1. Efsanevi %1,5 düz → **%0,9 + soft pity 70 / hard 100** (konsolide %1,84).
2. **Gizli Pufi** katmanı: albüm dışı "???" sayfası, %0,5, Atölye tavanlı.
3. v1'in "70-80 gün medyan" hedefi eski parametrelerle tutmuyordu (~170 gün çıkıyor) —
   v2'de akıllı düşüş ağırlıkları (`W_EKSIK=4/12`) + Kabuk hibeleriyle **81 güne** sabitlendi
   (simülasyonla doğrulandı: [`tools/economy-sim/collection_sim.py`](../../tools/economy-sim/collection_sim.py)).
