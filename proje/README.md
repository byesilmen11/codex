# proje/ — Yuvo Proje Yönetim Katmanı

> **Bu klasör projenin hafızasıdır.** Sohbet konteksti dolup gittiğinde kaybolmaması
> gereken her şey — plan, durum, kararlar, yapılan işlerin kaydı — burada yaşar.
> Yeni bir çalışma oturumu HER ZAMAN buradan başlar ve burada biter.
> İlke: *"Bir işin düzeni onu yapmaktan önemlidir; gözden kaçan şey iki kez yapılır."*

## Dosyalar ve rolleri

| Dosya | Soru | İçerik |
|---|---|---|
| [`01-yol-haritasi.md`](01-yol-haritasi.md) | **Ne yapacağız, nasıl, ne zaman?** | Fazlar (bitmiş + gelecek), her fazın kapsamı ve kabul ölçütü, çalışma yöntemi |
| [`02-durum.md`](02-durum.md) | **Neredeyiz? Kaldığımız yer neresi?** | Tek bakışta güncel durum: ne bitti, ne sürüyor, SIRADAKİ ADIM, açık konular. Oturuma dönüşün ilk okunacak dosyası |
| [`03-yapilacaklar.md`](03-yapilacaklar.md) | **Sırada ne var?** | Statülü iş listesi (yapılıyor / sırada / ileride / park). Yol haritasının güncel, ince taneli hali |
| [`04-kararlar.md`](04-kararlar.md) | **Neye, neden karar verdik?** | Numaralı karar günlüğü: tarih, karar, gerekçe, kaynak, nerede uygulandığı. Bir karar SADECE burada yazıyorsa alınmış sayılır |
| [`05-oturum-gunlugu.md`](05-oturum-gunlugu.md) | **Ne yaptık?** | Oturum oturum tam kayıt: istek, yapılanlar, commit'ler, doğrulama, teslimat, öğrenilen dersler |
| [`06-dosya-haritasi.md`](06-dosya-haritasi.md) | **Hangi dosya ne işe yarar?** | Deponun tamamının açıklamalı haritası |
| [`07-unity-kurulum-talimati.md`](07-unity-kurulum-talimati.md) | **Unity'yi nasıl kurarım?** | Kullanıcının makinesinde yapılacak 8 adım (~20 dk): proje, paket bağlama, duman testi, sorun giderme |

## Oturum ritüeli (BAĞLAYICI çalışma disiplini)

**Oturum başında:**
1. `02-durum.md` oku → kaldığımız yer + sıradaki adım.
2. Gerekirse `03-yapilacaklar.md` ve ilgili `04-kararlar.md` maddelerine bak.
3. İşe başlamadan kapsamı `03-yapilacaklar.md` ile eşle (listede yoksa önce ekle).

**Oturum içinde:**
- Yeni bir karar alındığı anda (sonraya bırakmadan) `04-kararlar.md`'ye numaralı madde yaz.
- Kapsam değişirse `03-yapilacaklar.md` anında güncellenir.

**Her iş bloğu bittiğinde ve MUTLAKA kontekst dolmadan önce:**
1. `05-oturum-gunlugu.md`'ye oturum kaydı ekle (istek → yapılan → commit → doğrulama → teslimat).
2. `02-durum.md`'yi yeni duruma getir (özellikle **Sıradaki adım** satırı).
3. `03-yapilacaklar.md` statülerini işle; yeni dosya eklendiyse `06-dosya-haritasi.md`'ye satır ekle.
4. **Commit + push.** Push edilmemiş kayıt, kayıt değildir.

**Teslimat tanımı (Definition of Done):** kod değişikliği + testler yeşil
(`proto-engine-test` + `proto-smoke`, sıfır konsol hatası) + artifact güncel +
**proje/ kayıtları güncel** + push. Kayıtsız iş bitmemiş iştir.

## Kayıt kuralları

- Dosyalar **eklemeli** tutulur: günlük ve karar maddeleri silinmez, gerekirse üstüne
  "iptal/revize → bkz. K-xx" notu düşülür. Yalnız `02-durum.md` ve `03-yapilacaklar.md`
  yaşayan dosyalardır, yerinde güncellenir.
- Tarihler `YYYY-AA-GG`; kararlar `K-01, K-02…`; oturumlar `O-01, O-02…` diye anılır.
- Kaynak gösterimi: kullanıcı sözü kısa alıntıyla, kod `dosya:satır` veya commit hash'iyle.
- Sabit referanslar: dal `claude/surprise-egg-collection-game-eycqiq` ·
  canlı prototip artifact'i `https://claude.ai/code/artifact/04cdcb1e-4e8b-4edf-9081-7e16ff8114ef`
  (hep AYNI URL'ye republish edilir).
