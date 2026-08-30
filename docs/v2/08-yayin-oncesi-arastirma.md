# v2·08 · Yayın Öncesi Araştırma — Psikolojik Kancalar ve Uygulanması

> **Bağlam:** Kullanıcının yayın öncesi denetim isteği üzerine (2026-08-29) üç paralel web
> araştırması koşuldu: (1) çok indirilen çocuk oyunlarının indirme/tutundurma psikolojisi,
> (2) unboxing/gacha reveal sahnelemesi, (3) monetizasyon etiği ve emsaller. Bulgular
> geliştirici teşhisiyle birleştirilip **"Yayın Öncesi Cila" (P1-P6)** olarak uygulandı
> (commit `b40509f`). Bu doküman bulguların, teşhisin ve bulgu→özellik izlenebilirliğinin
> kalıcı kaydıdır.
>
> *Yöntem notu:* bazı kaynak alan adları çalışma ortamının ağ politikasında engelliydi;
> o başlıklardaki bulgular arama özetleri üzerinden derlendi ve tekil sayılar (ör. indirme
> adetleri) kesin istatistik değil büyüklük sırası olarak okunmalıdır.

## 1. Araştırma A — Çocuklar basit oyunları neden indirir, neden bırakamaz?

**İndirme psikolojisi:**
- Keşif kanalı ezici biçimde **YouTube/video** (çocuk izlediği YouTuber'ın oynadığını ister;
  ~%78 bandında video-güdümlü keşif) + mağaza gezinmesinde **ikon/yüz tanıma**: yüzü olan,
  tek bakışta "ne yapacağımı anladım" hissi veren ikonlar kazanıyor.
- İsimde arama-terimi eşleşmesi ("surprise egg", "pop it" gibi çocukların ağzındaki kelime).
- İlk 60 saniye sözleşmesi: **vaat → dokunuş → ödül** zinciri ilk dakikada kurulmazsa
  silinme anında geliyor; okuma gerektiren her şey engel.

**Tutundurma/başında tutma psikolojisi (dörtlü motor):**
1. **Değişken ödül** (ne çıkacağı belirsiz açılış anları),
2. **Zeigarnik/set-tamamlama** (yarım kalan albüm zihni bırakmaz; "son 2 parça" en güçlü an),
3. **Tamagotchi/bakım** (bana ihtiyacı olan sevimli varlık — suçluluk değil şefkat dozunda),
4. **ASMR/duyusal doku** (crinkle, çıt, pop; Kaufcom tarzı "albüm = ses tahtası").
- Endowed progress (Nunes & Drèze): çubuğu 0'dan değil dolu başlatmak tamamlama isteğini büyütür.
- "Yarın sebebi"nin en sağlıklı biçimi **ekranda fiziksel duran randevu nesnesi** (kuluçkadaki
  yumurta, yarın açılacak kapı) — geri sayım sayacı değil.

## 2. Araştırma B — Unboxing/gacha reveal sahnelemesi

- **Loewenstein bilgi-boşluğu:** merak, kısmi bilgi anında zirve yapar. Hiç ipucu = ilgisizlik,
  tam bilgi = merak ölümü. Reveal bir **merdiven** olmalı: ipucu → daralt → duraklat → patlat.
- **POP öncesi sessizlik:** doruğun hemen öncesinde 300-500 ms TAM sessizlik + görsel daralma,
  algılanan değeri en çok artıran tek dokunuş (konser "drop"u prensibi).
- **Nadirlikte dallanan reveal:** sıradan sonuç hızlı (≈0,8 sn), nadir sonuç uzatılmış
  (≈2,5 sn) + çok kanallı işaret (renk + ses + hareket + rozet). Brawl Stars deseni: sonuç
  animasyondan ÖNCE hesaplanır, animasyon yalnız sahneler (bizim mimaride zaten böyleydi).
- **POP MART "shake for hints":** kutuyu sallayınca olasılık ipucu vermek merakı besler —
  dürüst hali: yalnız GERÇEKTEN olası adaylar gösterilir (eleme/olabilirlik, asla vaat).
- **Oturum kapıları:** TCG Pocket modeli — günlük haklar birikir, kaçıran cezalanmaz;
  kuluçka/inkübasyon nesneleri (yarına bekleyen yumurta) sayaçsız geri-gelme sebebi.
- **Kinder Applaydu emsali:** ~52M indirme, tamamen reklamsız/satın almasız; "açma anını"
  dijitalleştirmiyor — tören + dünya + koleksiyon birleşimi boşluğu bizim iddiamız (v2·06).
- Monopoly GO deseni: büyük ödülü ÖNCEDEN göster (kilitli vitrin) — baskısız hedef çekimi.

## 3. Araştırma C — Monetizasyon etiği ve emsaller

- **JAMA Pediatrics 2022:** popüler çocuk uygulamalarının ~4/5'inde manipülatif tasarım
  (yalvaran karakterler, süre baskısı, reklam tuzakları). Pazar "temiz uygulama"ya aç.
- **FTC v. Epic (520M$)** ve **HoYoverse (20M$, 16 yaş altı onayı)**: dark-pattern +
  çocuk onayı ihlallerinin fiyat etiketi; CHI 2025 literatürü loot-box'ın çocukta kumar
  benzeri bilişsel örüntülerle ilişkisini işaretliyor.
- **Yapısal doğrulama:** mevcut mimarimiz (çocuk fiyat görmez + Dilek Kavanozu + PIN + Kiler
  yayılımı + oran şeffaflığı + Efsanevi satılmaz + ara para birimi yok) literatürdeki en
  riskli kancaları zaten yapısal olarak engelliyor — cila fazı bu rayların ÜSTÜNE
  etik-ama-güçlü kancalar ekledi, rayları esnetmedi.
- Ebeveyn tarafında güven = dönüşüm: kaygı söndürücü bilgi ("ücretsiz yolla ~X günde
  gelebilir", yayılım önizlemesi, güven şeridi, geri sayımsız karşılama teklifi) hem etik
  hem satışa zemin (Toca Boca/Applaydu konumlanması).

## 4. Geliştirici teşhisi (cila öncesi zayıf noktalar)

| # | Teşhis | Neden sorun |
|---|---|---|
| 1 | İntro göğü boş, anlatıcı balonları dokunuş bekliyor | İlk 60 saniye sözleşmesi geç kuruluyor |
| 2 | Kapsül POP'u sahnelenmemiş (duraklatma/doruk yok) | Bilgi-boşluğu merdiveninin en değerli basamağı israf |
| 3 | Nadirlik reveal'i tek tip | Nadir an "büyük an" gibi hissedilmiyor |
| 4 | "Yarın sebebi" yok — gün bitince ölü ekran | D1 dönüş kancası eksik |
| 5 | Koleksiyon çekimi pasif (albüm ölü vitrin) | Set-tamamlama motoru rölantide |
| 6 | Sahne geçişleri sert kesme | Ucuz his; marka cilasını zayıflatıyor |

## 5. Bulgu → Özellik izlenebilirliği (uygulandı: commit `b40509f`)

| Bulgu | Uygulanan özellik | Dosya |
|---|---|---|
| POP öncesi sessizlik | 420 ms hush (sessizlik + vinyet + zoom) | `ceremony.js`, `story.css` |
| Dallanan reveal + çok kanallı işaret | Tier kutlaması 900/1300/2200/2600 ms + "◆ NADİR!" splash + Kiki balonu (tier≥2) | `ceremony.js` |
| Bilgi-boşluğu: kart sonrası merak | Seri numarası satırı ("Güneş Çayırı · 7/30") | `ceremony.js` |
| Shake-for-hints (dürüst hali) | Salla = eksik dostlardan 3 gerçek-olası silüet (§1.3 ihlalsiz) | `home.js` |
| ASMR/karakter sesi | pufiChirp: id-hash imzalı özgün cıvıltı; albüm soundboard | `audio.js`, `album.js` |
| Set-tamamlama + ödülü önceden göster | Son-3 ışıltısı, "Hedefim Bu!" hedef çipi, kilitli Altın Yumurta teaser'ı | `album.js`, `home.js` |
| Randevu nesnesi (sayaçsız) | Kuluçka yumurtası: Şako gece uçuşunda bırakır, sabah "☀️ Hazır!" | `home.js`, `state.js` |
| Haklar birikir (TCG Pocket) | newDay sıfırlamaz: kalan+3, tavan 9; kuluçka tavana sayılmaz | `state.js` |
| Cezasız süreklilik | Bekçi Takvimi: 7 yıldız → +25 Kabuk; kaçan gün zinciri KIRMAZ | `state.js`, `home.js` |
| Günlük mini hedefler | Görev zinciri 🥚3·🎮1·📔 → 🎁 +1 (bir kez) | `state.js`, `gacha.js`, sahneler |
| Kapanış ritüeli | Bugünün Dostları + yarının seri silueti (geri sayım YOK) | `home.js` |
| İlk 60 saniye | İntro hızlandırma (yıldız yüzü/kuyruk/serpinti, otomatik balonlar, ≤25 sn), el ipucu, yuva canlılığı, 180 ms fade | `intro.js`, `home.js`, `main.js` |
| Ebeveyn kaygı söndürücüler | Dilek Kartı+ (yaş + ücretsiz varış tahmini), yayılım önizlemesi, güven şeridi, yıl toplamı | `parent.js` |
| FOMO tersine çevirme | Hoş Geldin Sepeti: tek seferlik ama SÜRESİZ ("burada durur") | `store.js`, `parent.js` |
| Ticaret dili sıfır teslimat | Kilerden çekim = kargo balonu animasyonu | `home.js` |
| ASMR sakinleşme modu | Çıt Çıt Köşesi: ödülsüz sonsuz çıtlatma | `minigame.js` |

Doğrulama: motor testi P3 bölümü + duman testi 55 adım (splash, kuluçka sabahı, kapanış
ritüeli, baskı-dili denetimleri dahil) — sıfır konsol hatası.

## 6. Mağaza sayfası notları (yayın hazırlığına devir — U3)

- **İkon:** maskot yüzü + KAPALI parlayan yumurta (merak boşluğu ikonda başlar; yüz tanıma).
- **İlk 3 görsel:** kapalı yumurta → kırılma anı → dolu albüm (vaat → doruk → hedef).
- **Ad/arama:** "Sürpriz Yumurta" aramasını hedefleyen ad varyantı.
- **Konumlanma:** "Reklamsız + ebeveyn kapılı + oranlar açık" — Applaydu'nun kanıtladığı
  güven boşluğu; ebeveyn yorum akışında "reklam yok" beklenen ana övgü.
