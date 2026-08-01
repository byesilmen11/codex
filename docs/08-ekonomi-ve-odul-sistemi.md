# 08 · Ekonomi & Ödül Sistemi

## 1. Para Birimleri

| Birim | Tür | Nasıl kazanılır | Nereye harcanır | Parayla satın alınabilir mi? |
|-------|-----|-----------------|-----------------|------------------------------|
| **Çıt Puanı (ÇP)** | İlerleme (XP) | Her aktivite | Harcanmaz; Bekçi Seviyesi'ni yükseltir | ❌ |
| **Yıldız Tozu** ⭐ | Yumuşak para | Mini oyunlar, görevler, bakım kıvılcımları | Ek yumurta (günlük tavana kadar), dekorasyon, mini oyun süslemeleri | ❌ |
| **Kabuk** 🐚 | Zanaat parası | Kopya parçaların dönüşümü | Atölye üretimi (eksik parça, Işıltılı Pufi) | ❌ |

> **Bilinçli karar: premium para birimi YOK.** "Elmas" katmanı fiyat algısını bulanıklaştırır ve
> FTC'nin Epic dosyasındaki temel dark-pattern'dir. Gerçek para yalnızca ebeveyn panelinde, gerçek
> fiyat etiketiyle, deterministik içerik için kullanılır (Bölüm 09). Oyun içi paralar hiçbir
> kanaldan satılmaz — ekonomi %100 emek ekonomisidir.

## 2. Kaynaklar & Giderler (denge tablosu)

| Kaynak (earn) | Miktar (başlangıç ayarı) |
|---------------|--------------------------|
| Günlük görev zinciri (3–4 görev) | 2 yumurta + 60–100 ⭐ |
| Temel günlük yumurta hakkı | 3 yumurta (oynamadan birikmez; en fazla 1 gün devreder) |
| Mini oyun serbest tur | 10–20 ⭐/tur (günlük ⭐ tavanı: 200) |
| Bakım kıvılcımları | 5–15 ⭐/gün |
| Haftalık Aile Şenliği | 1 özel yumurta (aile deseni) |
| Set/albüm kilometre taşları | ⭐ + dekorasyon + kozmetik (Bölüm 07) |
| Bekçi Seviyesi atlaması | 1 seçmeli-aile yumurtası ("hangi biyomdan olsun?") |

| Gider (sink) | Maliyet |
|--------------|---------|
| Ek yumurta (günlük tavan: +2) | 120 ⭐/adet |
| Dekorasyon & yuva eşyaları | 30–300 ⭐ |
| Atölye üretimi | Kabuk tablosu (Bölüm 07) |
| Işıltılı dönüşüm | 4 kopya + 100 ⭐ |

**Denge ilkeleri:** (1) Günlük yumurta tavanı 5–6 → "sonsuz açma" dürtüsü yapısal olarak imkânsız;
(2) ⭐ enflasyonu dekorasyon havuzuyla emilir; (3) tüm sayılar uzaktan ayarlanabilir (remote config)
ve soft-launch verisiyle kalibre edilir.

## 3. Bekçi Seviyesi (meta-ilerleme)

- ÇP eşikleriyle 50 seviye/sezon; her seviye küçük ödül, her 5 seviyede "büyük an"
  (yeni biyom vurgusu, seçmeli yumurta, kostüm).
- Biyom kilitleri seviyeyle açılır (asla parayla): ör. Mercan Koyu = Seviye 8,
  Ay Bahçesi = Seviye 40 + sezon finali haftası.

## 4. Ödül Takvimi Mimarisi

| Zaman ölçeği | Ödül anı | Tasarım amacı |
|--------------|----------|----------------|
| Dakika | Mini oyun yıldızları, çıtlatma töreni | Anlık sevinç |
| Gün | Görev zinciri sonu "Kiki'nin teşekkürü" + günün yumurtaları | Ritim; yarın beklentisi |
| Hafta | Aile Şenliği yumurtası; haftalık albüm özeti ("bu hafta 9 parça!") | Aile bağı; ilerleme farkındalığı |
| 2 hafta | Yeni biyom vurgusu + hikâye perdesi | Yenilik dalgası |
| Sezon | Aile tamamlama kutlamaları; Altın Yumurta Töreni; Müze taşınması | Doruk deneyim; kalıcı statü |

**Login-streak yok, kayıp telafisi baskısı yok:** dönen çocuğa "özledik" hediyesi verilir ama
seri bozulma cezası diye bir kavram tasarımda mevcut değildir. Ödül daima *oynamaya*, asla
*uygulamayı açmaya* bağlanır.

## 5. Bildirim Politikası (ödül sisteminin uzantısı)

- Varsayılan: bildirim KAPALI. Ebeveyn isterse günde en fazla 1, sabit saatte, nötr içerikli
  bildirim açabilir ("Ovalya'da yeni bir gün başladı").
- "Pufin seni özledi 😢", "Son 2 saat!" gibi suçluluk/aciliyet bildirimleri **yasak** (tasarım sözleşmesi).

## 6. Ekonomi Simülasyonu Gereksinimleri (geliştirme görevi)

1. Monte Carlo albüm-tamamlama simülatörü (oran, pity, akıllı yumurta, Atölye parametreleriyle);
   çıktı: medyan/90. persentil tamamlama günü, Kabuk birikim eğrileri.
2. "Kayıp çocuk" senaryoları: haftada 2 gün oynayan profil sezon sonunda nerede? (hedef: ≥%60 + Müze yolu açık)
3. Duyarlılık analizi: Efsanevi oranı ±0,5 puan değişince tamamlama medyanı kaç gün oynar?
4. Bu simülatör repo'da `tools/economy-sim/` altında kod olarak yaşayacak (Faz 1 görevi, Bölüm 11).
