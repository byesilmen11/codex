# 04 · Yasal Çerçeve & Uyum

> Çocuklara yönelik bir koleksiyon oyunu, mobil sektörün en sıkı düzenlenen kesişimindedir:
> **çocuk verisi** + **rastgele ödül mekaniği** + **uygulama içi satın alma.** Bu bölüm, tasarım
> kararlarımızın (Bölüm 03, 07, 09) yasal gerekçelerini tek yerde toplar. *(Genel çerçevedir;
> lansman öncesi oyun hukuku uzmanından ülke bazlı görüş alınmalıdır.)*

## 1. Emsal Olay: FTC × Epic Games (520 Milyon $)

ABD Federal Ticaret Komisyonu 2022'de Epic Games'le toplam **520M$**'lık iki anlaşma imzaladı:
- **275M$** — COPPA (Çocukların Çevrimiçi Gizliliğini Koruma Yasası) ihlali: 13 yaş altından
  ebeveyn izni olmadan veri toplama. (FTC tarihinin en büyük kural cezası.)
- **245M$** — "Dark pattern" iadeleri: kafa karıştıran buton düzenleriyle istenmeyen satın almalar,
  tek dokunuşla ödeme, iade isteyen hesapların kilitlenmesi.

**Bizim için dersler:** (1) çocuk verisini hiç toplama; (2) satın alma akışını bilerek net ve yavaş
yap (ebeveyn kapısı + onay ekranı); (3) iade sürecini kolaylaştır.
Kaynaklar: [FTC basın açıklaması](https://www.ftc.gov/node/80135) ·
[TechCrunch](https://techcrunch.com/2022/12/19/ftc-fines-fortnite-maker-epic-games-520m-over-childrens-privacy-charges) ·
[GameDiscoverCo analizi](https://newsletter.gamediscover.co/p/epics-surprise-520m-ftc-penalty-lets)

## 2. Loot Box (Paralı Rastgele Ödül) Rejimleri

| Ülke/Bölge | Durum | Bize etkisi |
|------------|-------|-------------|
| **Belçika** | Parayla alınan loot box = kumar; ihlalde **800.000 €'ya kadar ceza + hapis** (çocuklara yönelikse ikiye katlanır) | Paralı rastgelelik olan hiçbir oyun Belçika'da çocuklara yasal sunulamaz. Yuvo'da paralı rastgelelik yok → **kısıt yok.** |
| **Hollanda** | Kumar otoritesi agresif; EA'ya 10M€ ceza kesildi (üst mahkeme oyunla bütünleşik olduğu gerekçesiyle bozdu, ama belirsizlik sürüyor) | Aynı şekilde: bizim modelde risk yok. |
| **Finlandiya ve diğer AB üyeleri** | Kumar tanımına alma / inceleme eğilimi büyüyor; AB düzeyinde tüketici koruma baskısı artıyor | "Şans satmayan" tasarım gelecekteki regülasyona da dayanıklı. |
| **ABD** | Federal yasak yok ama FTC dark-pattern doktrini + eyalet davaları; sınıf davaları artıyor | Ebeveyn kapısı + net fiyat + iade kolaylığı şart. |
| **Çin/Japonya/Kore** | Oran açıklama zorunlulukları, "kompu gacha" yasağı (JP) | Girersek zaten uyumluyuz; oranlar oyun içinde açık (Bölüm 07). |
| **Türkiye** | Kumar mevzuatı + Tüketici Kanunu + KVKK; çocuğa yönelik agresif ticari iletişim RTÜK/Ticaret Bakanlığı radarında | Model bu çerçevede temiz; TL fiyat şeffaflığı ve ebeveyn onayı zaten çekirdek tasarım. |

Kaynak: [Loot Box Laws by Jurisdiction 2025](https://blog.promise.legal/loot-box-laws-game-developers/) ·
[Linklaters – in-game spending & child safety](https://techinsights.linklaters.com/post/102j88o/gaming-series-8-challenge-of-regulating-in-game-spending-to-protect-online-chil)

## 3. Mağaza Politikaları (Fiili Yasa)

| Platform | Kural | Uygulamamız |
|----------|-------|-------------|
| **Apple App Store** | Kids kategorisi: reklam/davranışsal takip yasak; satın almalar ebeveyn kapısı arkasında; rastgele ödül satıyorsan **oran açıklama zorunlu** (2017'den beri) | Kids kategorisinde yayınlanacağız; paralı rastgelelik olmadığı için oran zorunluluğu tetiklenmez, yine de oyun içi yumurta oranlarını gönüllü yayınlarız (güven artırıcı). |
| **Google Play** | Families/Teacher Approved programı; loot box varsa oran açıklama (2019'dan beri); aile politikalarına aykırı reklam SDK'ları yasak | "Designed for Families" + Teacher Approved hedefi; üçüncü parti reklam SDK'sı hiç gömülmez. |
| **Her ikisi** | Ebeveyn onaylı satın alma akışları (Family Link / Ask to Buy) | Varsayılan: çocuk profili satın alma göremez; ebeveyn paneli PIN'lidir. |

Kaynak: [Fenwick – Google Play loot box odds](https://www.fenwick.com/insights/publications/google-play-now-requires-disclosure-of-loot-box-odds) ·
[Google Family purchase approvals](https://support.google.com/families/answer/7039872) ·
[App Store age ratings rehberi](https://capgo.app/blog/app-store-age-ratings-guide/)

## 4. Veri Koruma: COPPA · GDPR-K · KVKK

**Strateji: "sıfır çocuk verisi" mimarisi.** Uyum maliyetini düşürmenin en ucuz yolu, veriyi hiç toplamamaktır.

- Hesap = ebeveyn hesabı; çocuk yalnızca cihaz-yerel profil (isim yerine avatar).
- Davranışsal reklam yok, üçüncü parti izleme SDK'sı yok, IDFA/AAID kullanımı yok.
- Analitik: yalnızca anonim, toplulaştırılmış oyun telemetrisi (Bölüm 11); çocuk profiliyle
  ilişkilendirilebilir kimlik yok.
- Sohbet/serbest metin yok (isimler hazır listeden veya yerel; UGC moderasyon yükü sıfır).
- Sertifika hedefleri: **kidSAFE Seal**, **PRIVO/ESRB Privacy Certified** — ebeveyn pazarlamasında
  güçlü rozetler.

## 5. Uyum Kontrol Listesi (Lansman kapısı)

- [ ] Yaş kapısı (nötr tasarım, yönlendirmesiz) + ebeveyn kapısı (matematik sorusu değil; PIN/biyometri)
- [ ] Tüm satın almalar ebeveyn profilinde; çocuk profilinde fiyat/mağaza görünmez
- [ ] Paralı içerik listeleri satın alma ekranında eksiksiz görünür (rastgelelik yok beyanı)
- [ ] Oyun içi yumurta oranları "Ebeveyn Bilgi Sayfası"nda yayınlanır
- [ ] Harcama limiti (aylık, ebeveyn ayarlı) + tek dokunuş iade talebi akışı
- [ ] Gizlilik politikası çocuk-ebeveyn çift dilli (sade Türkçe/İngilizce özet + tam metin)
- [ ] kidSAFE/PRIVO denetim başvurusu
- [ ] Belçika/Hollanda dahil tüm hedef ülkelerde aynı sürüm yayınlanabilirlik onayı (hukuk görüşü)
- [ ] Mağaza "Families/Kids" program başvuru gereksinimleri (reklamsızlık, veri beyanları) tamam
