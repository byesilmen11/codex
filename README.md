# YUVO — Sürpriz Yumurta Adası 🥚✨
## Kapsamlı Oyun Tasarım & Araştırma Kılavuzu

> **Tek cümlelik özet:** 4–9 yaş çocuklar için sürpriz yumurta çıtlatma, sevimli yaratık ("Pufi")
> koleksiyonu ve ada canlandırma oyunu — çocuklar yumurtaları **oynayarak kazanır**, gelir modeli
> **ebeveyn onaylı abonelik + içeriği belli paketler** üzerine kuruludur. Paralı şans mekaniği yoktur.

---

## 🎯 Elevator Pitch

Ovalya Adası'nın tüm renkleri soldu; adanın sevimli sakinleri Pufiler, Büyük Rüzgâr'la birlikte
yumurtalarına geri sarıldı. Çocuk, adanın yeni **Yumurta Bekçisi**'dir: mini oyunlar oynayarak
Yıldız Tozu kazanır, sürpriz yumurtaları çıtlatır, içinden çıkan Pufi'nin oyuncağını parça parça
birleştirir, 300 parçalık albümü doldurur ve her yeni Pufi'yle adaya bir renk daha geri döner.

**Kinder yumurtası deneyiminin dijital hali:** merak → çıtlatma → sürpriz → birleştirme → koleksiyon.
Ama kumarhane mantığıyla değil, **oyuncak kutusu** mantığıyla.

## 📔 Kılavuz İçindekiler

| # | Bölüm | İçerik |
|---|-------|--------|
| 01 | [Pazar Araştırması](docs/01-pazar-arastirmasi.md) | Pazar büyüklüğü, trendler, sürpriz/unboxing ekonomisi |
| 02 | [Rakip Analizi](docs/02-rakip-analizi.md) | Adopt Me, Hatchimals, Applaydu, Monopoly GO, Toca Boca… ve pazar boşluğu |
| 03 | [Çocuk Psikolojisi & Motivasyon Tasarımı](docs/03-cocuk-psikolojisi-ve-motivasyon.md) | Hangi psikolojik motorları kullanıyoruz, hangilerini bilinçli olarak KULLANMIYORUZ |
| 04 | [Yasal Çerçeve & Uyum](docs/04-yasal-cerceve-ve-uyum.md) | COPPA, GDPR-K, KVKK, loot box yasaları, Apple/Google politikaları |
| 05 | [Oyun Vizyonu: Dünya, Hikâye, Karakterler](docs/05-oyun-vizyonu-dunya-hikaye.md) | Ovalya, Pofu, Kiki, Usta Kabuk, Şako ve sezon hikâyesi |
| 06 | [Oyun Mekanikleri & Döngüler](docs/06-oyun-mekanikleri-ve-donguler.md) | Çekirdek döngü, yumurta töreni, birleştirme, mini oyunlar |
| 07 | [Koleksiyon Sistemi](docs/07-koleksiyon-sistemi.md) | 300 parçalık albüm, nadirlik katmanları, kötü şans koruması, Atölye |
| 08 | [Ekonomi & Ödül Sistemi](docs/08-ekonomi-ve-odul-sistemi.md) | Para birimleri, kaynak/gider tabloları, ödül takvimi |
| 09 | [Monetizasyon Modeli](docs/09-monetizasyon-modeli.md) | Yuvo Club aboneliği, deterministik paketler, ebeveyn paneli |
| 10 | [Sanat Yönü, UX & Ses](docs/10-sanat-ux-ses.md) | Görsel dil, çocuk UX kuralları, ses tasarımı |
| 11 | [Teknik Mimari & Yol Haritası](docs/11-teknik-mimari-ve-yol-haritasi.md) | Motor seçimi, backend, 12 aylık plan, KPI hedefleri |

## 📦 v2 — Doğrudan Satın Alma Senaryosu (derin araştırma, 5 paralel ajan)

Yumurtaların oyunla kazanılmaya ek olarak **mikro fiyatla satın alınabildiği** senaryonun
birleşik kılavuzu: **[docs/v2/README.md](docs/v2/README.md)**

| # | Bölüm | Öne çıkan |
|---|-------|-----------|
| v2·01 | [Rakip Ekonomiler](docs/v2/01-rakip-ekonomiler.md) | Monopoly GO $6 mlr modeli, PS99 yumurta merdiveni, Brawl Stars vakası, Pop Mart 1/72, 15 tasarım deseni |
| v2·02 | [Koleksiyon & Algoritma](docs/v2/02-koleksiyon-sistemi-ve-algoritma.md) | Monte Carlo doğrulamalı matematik, pity algoritması pseudocode, Gizli Pufi, 31 isimli örnek aile |
| v2·03 | [Hikâye & Karakterler](docs/v2/03-hikaye-ve-karakterler.md) | 3 dünya senaryosu + story bible + replikler + S2-3 tohumları |
| v2·04 | [Oyun Akışı & Zorluk](docs/v2/04-oyun-akisi-ve-zorluk.md) | Dakika dakika FTUE, 7 gün planı, 12 hafta takvimi, Altın Yumurta storyboard'u |
| v2·05 | [Mağaza & Paketler](docs/v2/05-magaza-ve-yumurta-paketleri.md) | 6 kademeli paket merdiveni (₺9,99-₺199,99), Kiler, Dilek Kavanozu, hediye kanalı, gelir projeksiyonu |
| — | [Ekonomi simülatörü](tools/economy-sim/collection_sim.py) | v2·02'nin eğrilerini üreten çalıştırılabilir Monte Carlo kodu |

## ⚖️ Etik Manifesto (Bu projenin anayasası)

Bu oyun çocuklara satış yapmaz; **ebeveynlere değer satar, çocuklara oyun verir.**

1. **Paralı şans yok.** Gerçek parayla rastgele içerik (loot box) satılmaz. Yumurtalar oyunla kazanılır;
   parayla satılan her şeyin içeriği satın alma öncesi bellidir. (Belçika/Hollanda dahil her pazara girebiliriz.)
2. **Sahte para katmanı yok.** "Elmas/jeton" soyutlamasıyla fiyat gizlenmez; gerçek para fiyatları nettir.
   (FTC'nin Epic Games'e 520M$ ceza kestiği "dark pattern" dosyasının birinci maddesi budur.)
3. **Her koleksiyon tamamlanabilir.** Nadirlik heyecanı vardır ama kötü şans koruması (pity) ve Atölye
   sistemi sayesinde hiçbir parça matematiksel olarak ulaşılmaz değildir.
4. **Sağlıklı ritim.** Günlük ~15–20 dk hedeflenir; "Pufiler de uyur" mekaniğiyle mola ödüllendirilir.
   FOMO sayaçları, kaçırılan içeriğin sonsuza dek yok olması gibi baskı araçları kullanılmaz.
5. **Ebeveyn her zaman kontrolde.** PIN'li ebeveyn paneli, harcama/süre limitleri, haftalık rapor.
   Tüm satın almalar ebeveyn kapısının arkasındadır. Reklam yoktur. Çocuk verisi toplanmaz (COPPA/KVKK).

> **Neden böyle?** Çünkü (a) çocukları ödemeye zorlayan tasarım hem etik dışı hem yasa dışıdır ve mağazalardan
> atılır; (b) kanıt, etik modelin daha çok kazandırdığını gösteriyor: Toca Boca abonelik+güven modeliyle
> 1 milyar $ kullanıcı harcamasını aştı, Applaydu (Kinder'ın resmî uygulaması) tamamen satın almasız/reklamsızdır.
> Ayrıntılar: [Bölüm 03](docs/03-cocuk-psikolojisi-ve-motivasyon.md) ve [Bölüm 09](docs/09-monetizasyon-modeli.md).

## 🎮 Künye (Özet)

| Alan | Karar |
|------|-------|
| Çalışma adı | **Yuvo: Sürpriz Yumurta Adası** (global: *Yuvo: Surprise Egg Island*) |
| Hedef kitle | Çekirdek 4–9 yaş; ikincil 9–12 (koleksiyoncu mod) |
| Platform | iOS + Android (tablet öncelikli düşün, telefon uyumlu) |
| Tür | Koleksiyon / bakım (nurture) / mini oyun derlemesi |
| Oturum hedefi | 15–20 dk/gün |
| Gelir modeli | Abonelik (Yuvo Club) + deterministik paketler + sezon yolu + (faz 2) fiziksel kart hattı |
| Motor önerisi | Unity (C#) — ayrıntı Bölüm 11 |
| Lansman dili | TR + EN, mimari 18+ dile hazır |
