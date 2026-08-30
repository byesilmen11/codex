# 01 · Yol Haritası — Ne / Nasıl / Ne Zaman

> Fazların tek listesi. Ayrıntılı takvim ve KPI kapıları: [`docs/11 §4-§5`](../docs/11-teknik-mimari-ve-yol-haritasi.md) ·
> Unity fazlarının teknik ayrıntısı: [`docs/v2/07 §10`](../docs/v2/07-unity-tasima-plani.md) ·
> güncel ince taneli liste: [`03-yapilacaklar.md`](03-yapilacaklar.md).

## Çalışma yöntemi (nasıl)

1. **Önce prototipte dene:** HTML5 prototip (`prototype/`) oynanabilir spesifikasyondur;
   her tasarım fikri önce orada denenir, Unity'ye kanıtlanmış davranış gider (K-15).
2. **Testsiz teslimat yok:** motor testi + duman testi (sıfır konsol hatası) her teslimatın
   önkoşulu (K-08). Sayılar tek kaynaktan (`content/*.json`), determinizm altın vektörlerle kilitli.
3. **Kayıt ritüeli:** her iş bloğu `proje/` kayıtlarıyla kapanır (bkz. [`README.md`](README.md)).
4. **Etik değişmezler her fazda geçerli:** K-05 ve K-13'teki raylar tasarım tartışmasına
   kapalıdır (çocuk fiyat görmez, Efsanevi satılmaz, sayaç/baskı yok, cezasızlık).

## Fazlar

| Faz | Dönem | Kapsam | Durum | Kanıt / Kabul |
|---|---|---|---|---|
| **F0 · v1 Araştırma & Kılavuz** | 2026-08-01 | Pazar/rakip/psikoloji/yasal/vizyon/mekanik/ekonomi/monetizasyon/sanat/teknik — 11 bölümlük kılavuz (`docs/01-11`) | ✅ Bitti | Commit `b1a5087` |
| **F1 · v2 Derin Araştırma** | 2026-08-01 | Doğrudan satın alma senaryosu: 5 paralel ajan → `docs/v2/01-06` + Monte Carlo simülatörü; kanonik sayılar (K-06) | ✅ Bitti | Commit `51a9da2`; medyan tamamlama 70-80 gün doğrulandı |
| **F2 · Prototip Dikey Dilim** | 2026-08-28 | Vanilla JS prototip: tören + birleştirme + 31 Pufi + albüm + mini oyun + gacha/pity motoru; ARCHITECTURE.md sözleşmesi; motor+duman testleri | ✅ Bitti | Commit `2eb95d5`, `d3e5d51` |
| **F3 · Marka Sürümü** | 2026-08-28→29 | BRAND.md, logo+ikon seti, sticker görsel dili, 31 karakterin final çizimi, çevre sanatı, HUD/nav | ✅ Bitti | Commit `8d82f1e`, `a9616f3`, `1e8fb8d` |
| **F4 · Gerçek Yumurta Ritüeli** | 2026-08-29 | v2·06 dokümanı + uygulama: folyo→çikolata/kumbara→Tomurcuk Kapsülü (4 araç)→birleştirme; Ambalaj Defteri; Altın Folyo; dürüstlük sözleşmesi §1.3 | ✅ Bitti | Commit `c62a687` |
| **F5 · Tam Oyun Döngüsü** | 2026-08-29 | FTUE/intro + diyalog sistemi + ebeveyn paneli (PIN, DEMO mağaza, Kiler, Dilek Kavanozu) + 2. biyom Fısıltı Ormanı (31 Pufi) + Şako Saklambaç | ✅ Bitti | Commit `c3e722a`; duman 43 adım |
| **F6 · Yayın Öncesi Cila** | 2026-08-29 | 3 paralel araştırma (çocuk psikolojisi / unboxing sahneleme / etik monetizasyon → `docs/v2/08`) + P1-P6 uygulaması: reveal merdiveni, albüm oyuncak sandığı, oturum döngüsü (kuluçka/birikim/görev/takvim), ilk-60-saniye, ebeveyn güven kancaları, Çıt Çıt Köşesi | ✅ Bitti | Commit `b40509f`; duman 55 adım, sıfır konsol hatası |
| **F7 · Unity Köprüsü (U0)** | 2026-08-29→ | Taşıma planı (`docs/v2/07`) + ihraç boru hatları: içerik JSON + altın vektörler ✅ · sanat ihracı (`export-art`) ⬜ · ses ihracı (`export-audio`) ⬜ | 🔄 Sürüyor | Commit `3192049`, `22d1eda`; kalan işler `03-yapilacaklar.md` |
| **F8 · Unity U1 — Dikey Dilim** | planlı (~4 hafta) | Home+Ceremony+Assembly+Album, tek biyom; `Yuvo.Core` C# portu altın vektörlerle | ⬜ Bekliyor | 22 adımlık ritüel paritesi; 60fps orta segment Android |
| **F9 · Unity U2 — Tam Döngü** | planlı (~4 hafta) | Intro, oturum döngüsü, minigame+ÇıtÇıt, Orman+Şako, ebeveyn paneli (DEMO), bildirim altyapısı | ⬜ Bekliyor | 55 adım duman paritesi; 5 çocukta gülümseme testi |
| **F10 · Unity U3 — Yayın Hazırlığı** | planlı (~4 hafta) | Gerçek IAP + makbuz doğrulama, remote config, telemetri, kidSAFE ön denetim, mağaza sayfası | ⬜ Bekliyor | Families/Kids kontrol listesi tam; crash-free ≥ %99,5 |
| **F11 · Soft Launch** | planlı | TR + 1 pilot pazar; KPI kapıları `docs/11 §5` | ⬜ Bekliyor | D1 ≥ %45, ebeveyn NPS ≥ 50, iade < %1 |
| **F12+ · Sosyallik & Backend** | park | Arkadaş/hediye (ebeveyn onaylı), cloud save, sunucu-onaylı RNG; övünme kartı (backend'siz, erken alınabilir) | ⏸ Park | `docs/v2/07 §11` |

## Bilinçli ertelenen konular (park gerekçeleriyle)

| Konu | Neden park | Ne zaman masaya gelir |
|---|---|---|
| Hukuk/mevzuat değerlendirmesi | Kullanıcı kararı: "İtiraz etmeden legal kısmını da sonra tartışırız" (K-04) | Soft launch öncesi; `docs/v2/README` "Açık Konular" 3 maddesiyle |
| Belçika/Hollanda bölge matrisi | Hukuk görüşüne bağlı | U3'te bayrak altyapısı kurulur, kapsam kararı sonra |
| Mağaza kategorisi (Kids vs genel+yaş kapısı) | Emsal analizi hukukla birlikte anlamlı | U3 mağaza hazırlığında |
| Gerçek sosyallik | Backend + hesap + moderasyon ister | U3 sonrası (F12) |
| Sponsorlu ambalaj serileri (reklam alma fikri — K-10) | Gelir mimarisine yazıldı (`docs/v2/06`); yayın sonrası konu | Soft launch verisiyle |
