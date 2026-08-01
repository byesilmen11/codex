# v2 · Doğrudan Satın Alma Senaryosu — Birleşik Kılavuz

> **v2 nedir?** v1 kılavuzun (docs/01-11) üzerine, kullanıcı kararıyla eklenen senaryo:
> yumurtalar oyunla kazanılmaya devam eder **ve** ebeveyn paneli üzerinden mikro fiyatla
> (tekli ₺9,99'dan 100'lü ₺199,99'a; birim fiyat ₺2'ye kadar iner) doğrudan satın alınabilir.
> Fikrin çekirdeği: *market rafındaki ₺40-500'lük sürpriz yumurta merakını, ailenin cebini
> yakmadan ₺2-5'lik dijital yumurtayla gidermek.* Bu klasör, 5 paralel araştırma ajanının
> çıktılarının uyumlaştırılmış birleşimidir.

## Bölümler

| # | Dosya | İçerik |
|---|-------|--------|
| 01 | [Rakip Ekonomiler](01-rakip-ekonomiler.md) | Monopoly GO ($6 mlr), Adopt Me/PS99 yumurta fiyatları, Pokémon GO, Brawl Stars loot-box kaldırma vakası (−%14 → 8,8×), EA FC/Hearthstone garanti kuralları, Pop Mart/Labubu (1/72 secret), Kinder/L.O.L. raf fiyatları, 15 kesişen tasarım deseni |
| 02 | [Koleksiyon Sistemi & Algoritma](02-koleksiyon-sistemi-ve-algoritma.md) | Monte Carlo ile doğrulanmış v2 matematiği, coupon-collector hesapları (Panini 7,1× israf → Yuvo 1,35×), soft/hard pity, düşüş algoritması pseudocode (commit-reveal RNG), 10 aile haritası + Güneş Çayırı'nın 31 isimli tam listesi, Gizli Pufi katmanı, kopya ekonomisi |
| 03 | [Hikâye & Karakterler](03-hikaye-ve-karakterler.md) | 3 dünya senaryosu (Ovalya / Tıkırtı Fabrikası / Rüzgâr Postası) + karşılaştırma + karar; 12 haftalık story bible, ilişki haritası, karakter replikleri, 3 sahne senaryosu, Sezon 2-3 tohumları |
| 04 | [Oyun Akışı & Zorluk](04-oyun-akisi-ve-zorluk.md) | Dakika dakika ilk oturum (ilk çıtlama <60 sn), ilk 7 gün planı, hafta 2-12 etkinlik takvimi, yaş modları ve DDA, geç oyun döngüsü, 11 sahnelik Altın Yumurta Töreni storyboard'u |
| 05 | [Mağaza & Yumurta Paketleri](05-magaza-ve-yumurta-paketleri.md) | 6 kademeli paket merdiveni, Kiler mekaniği, Dilek Kavanozu, Şeffaflık Kartı, hediye kanalı (bayram/karne), harcama limiti UX, 100K DAU gelir projeksiyonu, ters whale alarmı |
| — | [`tools/economy-sim/collection_sim.py`](../../tools/economy-sim/collection_sim.py) | 02'deki tüm eğrileri üreten Monte Carlo simülatörü (çalıştırılabilir) |

## Kanonik Kararlar (ajanlar arası uyumlaştırma)

Beş ajan bağımsız çalıştığı için birkaç sayı çelişti; bağlayıcı karar şudur:

1. **Oranlar:** v2·02 kanoniktir — %55 / %25 / %14 / %4,6 / %0,9+soft pity (konsolide %1,84) /
   Gizli %0,5. Başka dosyada görünen farklı oran taslak kalıntısıdır.
2. **Günlük açılış tavanı:** v2·05'in Kiler kuralı kanoniktir — kazanılan 3-5 + kilerden ≤5 +
   Club +1 (≈ maks 70 yumurta/hafta). v2·02'deki 100-200/hafta satırları tavansız duyarlılık
   analizidir; tavanın gerekçesini gösterir.
3. **Paket merdiveni:** v2·05 kanoniktir (₺9,99 → ₺199,99, 6 kademe). v2·04'teki eski tekli/3'lü
   fiyat referansları bu merdivene bağlanmıştır.
4. **Efsanevi kuralı (uzlaştırılmış):** Tek havuz, tek oran, ortak pity — satın alınan yumurta
   çocuk tarafında ayırt edilemez ve aynı şansı taşır. Ancak **hiçbir pakette Efsanevi vaadi ya da
   seçimi satılmaz** (garanti/seçim hakları Destansı'da durur). 100'lü pakette pity matematiğinin
   fiilen Efsanevi üretmesi gizlenmez, dürüstçe yazılır.
5. **Harcama limiti:** aylık, varsayılan ₺400, ebeveyn ayarlı (v2·05). Haftalık ifadeler bu
   limitin türevleridir.
6. **Sezon hedefleri:** ücretsiz-aktif çocuk medyan 81 günde (84 günlük sezon içinde) bitirir;
   tavan alıcısı ~45 günde bitirir ve sezon sonunu Gizli + Işıltılı + kozmetik kuyruk taşır.

## Araştırmanın v2'ye Yerleştirdiği Emniyet Rayları

Bunlar etik tartışmadan bağımsız olarak **mağaza kabulü ve pazar gerçekleri** gereği tasarımda:

- Oran tablosu satın alma öncesi ekranda (Apple 3.1.1 + Google Play zorunluluğu → "Şeffaflık Kartı"
  olarak güven kozuna çevrildi).
- Çocuk profili mağaza görmez ("Dilek Kavanozu"); satın alma ebeveyn PIN'i arkasında; aylık limit
  varsayılan açık; ters whale alarmı.
- Ara para birimi yok — TL-net fiyat (Roblox'a FTC şikâyetinin tam karşı pozisyonu; pazarlama kozu).
- Kiler mekaniği: 100'lük paket 3-4 haftaya yayılır; "binge" yapısal olarak engelli.
- Pity + akıllı düşüş + Atölye: her koleksiyon matematiksel olarak tamamlanabilir
  ("para parça satın almaz, zaman satın alır" — simülasyonla kanıtlı).

## Açık Konular (sonraki tartışmaya park edildi)

Kullanıcının talebiyle hukuk/mevzuat değerlendirmesi ertelendi. Karar anı geldiğinde masaya
gelecek üç madde (v1 docs/04 + v2·01 bulgularıyla):

1. **Paralı rastgele yumurtanın bölge matrisi** — Belçika/Hollanda için bölge bayrağı (vitrin o
   ülkelerde deterministik alternatife düşer) hazır; kapsam kararı hukuk görüşü sonrası.
2. **Mağaza kategorisi seçimi** — Kids kategorisi vs genel kategori + yaş kapısı; v2·01 §7'deki
   emsallerle birlikte değerlendirilecek. (Rakip ekonomiler araştırmasının kritik bulgusu:
   hiçbir lider ürün "çıplak rastgele mikro yumurta" satmıyor — hepsi garanti katmanı, bundle
   ya da emek-kapısı kullanıyor. v2 tasarımı bu yüzden garanti-ağır kuruldu.)
3. **"İçeriği görünür yumurta" alternatifi** — v2·01 desen #8: satın alınan yumurtalarda
   rastgeleliği daha da azaltan (set-tamamlama garantili paket) B planı; regülasyon sertleşirse
   geçiş yolu olarak rafta.
