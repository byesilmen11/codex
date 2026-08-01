# 11 · Teknik Mimari & Yol Haritası

## 1. Motor Seçimi

| Seçenek | Artı | Eksi | Karar |
|---------|------|------|-------|
| **Unity (C#)** ⭐ | Stilize 3D + parçacık/animasyon gücü (çıtlatma töreni!), Addressables ile içerik akışı, iOS+Android tek kod, işe alım havuzu geniş | Runtime ücretlendirme politikası takip edilmeli | **Önerilen** |
| Godot 4 | Ücretsiz, hafif | Stilize 3D boru hattı ve mobil optimizasyon olgunluğu daha düşük, ekip bulma zor | Yedek |
| Flutter/Unity dışı | UI kolay | Oyun hissi (fizik, parçacık, ses senkronu) zayıf | Hayır |

## 2. Mimari İlkeler

- **Offline-first:** Çocuk cihazında internet garanti değildir. Çekirdek oyun tamamen çevrimdışı
  çalışır; senkron fırsatçıdır (cloud save ebeveyn hesabına bağlanınca).
- **Sıfır çocuk verisi (Bölüm 04):** Kimlik gerektiren her şey ebeveyn hesabında; çocuk profili
  cihaz-yerel. Üçüncü parti reklam/izleme SDK'sı gömülmez — bağımlılık listesi denetimi CI'da otomatik.
- **Remote config + içerik boru hattı:** Oranlar, pity eşikleri, görev tabloları, sezon içeriği
  sunucudan ayarlanabilir (istemci güncellemesiz canlı ayar). Yeni biyom/Pufi içerikleri
  Addressables paketleriyle indirilir.
- **Deterministik ekonomi çekirdeği:** Yumurta açılışı sunucu-onaylı RNG (root'lu cihazda hile ile
  Efsanevi basılamaz); çevrimdışıyken açılan yumurtalar yerel commit-log'la sonradan doğrulanır.
- **Backend:** Yönetilen BaaS ile başla (ör. Firebase'in çocuk-uyumlu yapılandırması: Analytics
  kişiselleştirme kapalı, reklam ürünleri hiç yok — veya Nakama/self-host). Faz kararı soft-launch
  öncesi maliyet analiziyle.
- **Analitik:** Yalnızca anonim oyun telemetrisi (oturum süresi, görev tamamlama, ekonomi akışları);
  cihaz reklam kimliği asla okunmaz. Pano: tamamlanma eğrileri + Bölüm 08 simülatör kalibrasyonu.

## 3. Ekip (çekirdek, Faz 1)

1 oyun tasarımcısı/PM · 2 Unity geliştirici · 1 backend/dev-ops (yarı zamanlı başlar) ·
1 sanat yönetmeni + 1 3D/animasyon sanatçısı (+dış kaynak illüstrasyon) · 1 ses tasarımcısı (sözleşmeli) ·
1 çocuk gelişimi danışmanı (sözleşmeli — Applaydu'nun Oxford modelinin mütevazı versiyonu; hem ürünü
iyileştirir hem pazarlama/sertifika değeri taşır).

## 4. Yol Haritası (12 ay)

| Faz | Ay | Hedef | Çıkış kriteri |
|-----|----|-------|---------------|
| **0 · Temel** | 1 | Bu kılavuzun onayı; marka/tescil taraması; ekonomi simülatörü (`tools/economy-sim/`) | Simülatör medyan tamamlama 70–80 gün veriyor |
| **1 · Prototip** | 2–3 | Çıtlatma töreni + birleştirme masası + 1 biyom + albüm çekirdeği (dikey dilim, sahte içerik) | "Çıtlatma anı" 5 çocukta gülümseme testi geçiyor (ebeveyn onaylı kullanıcı testi) |
| **2 · Vertical Slice** | 4–6 | 3 biyom, 90 Pufi, günlük ritim, ebeveyn paneli v1, Atölye | kidSAFE ön denetimi; çocuk testlerinde D1 dönüş isteği ölçümü |
| **3 · Soft Launch** | 7–9 | 10 biyom, 300 Pufi, sezon 1 hikâyesi, Yuvo Club, TR + 1 pilot pazar | Aşağıdaki KPI kapıları |
| **4 · Global** | 10–12 | Müze, hediye sistemi, 6+ dil, mağaza Kids programları, lansman pazarlaması | Teacher Approved / Kids kategori kabulleri |
| Faz 2 (yıl 2) | — | Sezon 2, Işıltılı derinliği, fiziksel kart hattı pilotu | — |

## 5. KPI Hedefleri (soft-launch kapıları)

| Metrik | Hedef | Not |
|--------|-------|-----|
| D1 / D7 / D30 retention | ≥ %45 / %20 / %10 | Çocuk oyunları üst çeyreği |
| Ortalama oturum | 12–22 dk | **Üst sınır da hedef:** 30 dk+ oturumlar sağlık alarmıdır (tasarım gereği düşmeli) |
| Günlük yumurta/oyuncu | 3,5–5 | Ritim çalışıyor mu? |
| Albüm ilerleme (D30) | Medyan ≥ %35 | Bölüm 07 matematiğinin sahada doğrulanması |
| Club dönüşümü | %3–5 (D60 kohortu) | Çocuk aboneliği sektör bandı |
| Ebeveyn NPS | ≥ 50 | Panel içi tek soruluk anket |
| İade oranı | < %1 | Dark-pattern yokluğunun turnusolu |
| Mağaza puanı | ≥ 4,6 | "Reklam yok" yorum akışı beklenir |

## 6. Riskler & Önlemler

| Risk | Önlem |
|------|-------|
| "Şans satmayan model az kazanır" iç şüphesi | Toca Boca kanıtı + soft-launch A/B'si paket fiyatlarında (asla mekanik karanlıklaştırmada) |
| Sezon içeriği üretim temposu (300 Pufi!) | Pufi üretim boru hattı şablonlaştırılır (rig paylaşımı, varyant sistemi); Yaygın katman varyant ağırlıklı |
| Platform politika değişimleri | Zaten en katı yorumla uyumluyuz; politika takibi üç aylık ritüel |
| Marka taklitçileri (çöp "surprise egg" uygulamaları adımızı kopyalar) | Erken tescil (TR/EU/US), mağaza marka şikâyet süreçleri |
| Çocuk testlerinde tören "uzun" bulunursa | Tören süreleri remote-config'te; hızlandırma dokunuşu zaten tasarımda |

## 7. Depo Yapısı Önerisi (kodlama fazı başlarken)

```
/docs                  ← bu kılavuz (canlı tutulur; her tasarım değişikliği PR'la)
/tools/economy-sim     ← Monte Carlo albüm simülatörü (Faz 0)
/client                ← Unity projesi
/server                ← backend (config, RNG onayı, ebeveyn hesapları)
/content               ← Pufi tanımları, oran tabloları, görev tabloları (JSON; remote config kaynağı)
```
