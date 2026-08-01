# Master Studio — Arayüz Tasarım Yönleri

**Master Studio**: KOBİ e-ticaret satıcıları için yapay zekâ destekli ürün fotoğraf stüdyosu.
Bu klasör, uygulamanın arayüzü için üretilmiş **10 bağımsız tasarım yönünü** içerir.
Her dosya kendi kendine yeterli tek bir HTML gövdesidir (claude.ai Artifact olarak yayınlanır);
harici görsel/font/script içermez, tüm görseller satır-içi SVG yer tutuculardır.

Ortak içerik modeli, kalite çıtası ve yön kataloğu için: [`SPEC.md`](./SPEC.md)

## Yönler

| Yön | Dosya | Karakter | Gösterilen ekran | Canlı önizleme |
|-----|-------|----------|------------------|----------------|
| A · Stüdyo/Sinematik | `yon-a-studyo-sinematik.html` | Koyu, altın accent; renk-derecelendirme masası hissi | Stüdyo | [Artifact](https://claude.ai/code/artifact/489dd506-9bbd-47a8-a492-29ff31a4a750) |
| B · Berrak Fayda | `yon-b-berrak-fayda.html` | Linear/Vercel çizgisi; klavye-öncelikli; indigo | Stüdyo + komut paleti | [Artifact](https://claude.ai/code/artifact/156a3c08-0b7a-4a31-a82f-a62b594804ca) |
| C · Sıcak Yaratıcı | `yon-c-sicak-yaratici.html` | KOBİ'ye sıcak, rehberli adım akışı; turuncu | Stüdyo (adımlı) | [Artifact](https://claude.ai/code/artifact/0511f04f-70bd-4ec9-bfbf-dcfae66ab9b7) |
| D · Komuta Merkezi | `yon-d-komuta-merkezi.html` | Görev-kontrol odası; buz camgöbeği telemetri | Toplu Üretim (canlı operasyon) | [Artifact](https://claude.ai/code/artifact/0f0efb47-e296-4b32-b150-95d4bf1e4a89) |
| E · Bento Monokrom | `yon-e-bento-monokrom.html` | Monokrom bento ızgara; tek kobalt sinyal | Genel Bakış panosu | [Artifact](https://claude.ai/code/artifact/3b74455c-53fa-4190-a754-73e1caaebb62) |
| F · Copilot Stüdyo | `yon-f-copilot-studyo.html` | İstem-öncelikli üretim; gül/magenta yardımcı | Stüdyo (konuşma akışı) | [Artifact](https://claude.ai/code/artifact/b925dcb0-898d-4ae7-9e64-b1dbc4a53f4a) |
| G · Onay Hattı | `yon-g-onay-hatti.html` | Kanban onay akışı; SLA + toplu işlem; erik | Galeri (onay hattı) | [Artifact](https://claude.ai/code/artifact/3894090b-be98-4348-86c2-6fba3ecb77b2) |
| H · Sonsuz Tuval | `yon-h-sonsuz-tuval.html` | Figma-vari uzamsal tuval; çok oyunculu | Çekim düzenleme tuvali | [Artifact](https://claude.ai/code/artifact/32995520-2a68-44c6-a3de-30d9a3db20af) |
| I · Editoryal Atölye | `yon-i-editoryal-atolye.html` | Moda lookbook; serif; porselen + bordo | Galeri (lookbook + marka kiti) | [Artifact](https://claude.ai/code/artifact/2c050dc6-9579-44a2-ac6b-e267e5c328c9) |
| J · Akış Kurucu | `yon-j-akis-kurucu.html` | Düğüm tabanlı otomasyon; petrol/teal | Entegrasyonlar (otomasyon) | [Artifact](https://claude.ai/code/artifact/00adc5c7-7af0-41f3-a99c-b0e98c2db110) |

İş akışı süreçlerini doğrudan hedefleyen yönler: **D** (toplu operasyonu tek bakışta izleme),
**F** (niyetten sonuca en kısa yol), **G** (birikmiş onay işini eritme), **J** (uçtan uca otomasyon).

## Teknik sözleşme (tüm dosyalar)

- Namespace'li CSS (her yönün kendi kök sınıfı) — dosyalar çakışmadan yan yana yaşayabilir.
- Jeton tabanlı çift tema: `prefers-color-scheme` + `:root[data-theme]` ezmeleri
  (A ve D bilinçli tek-tema koyudur).
- Duyarlı düzen (~1140px ve ~760px kırılımları); gövde asla yatay kaydırmaz.
- Erişilebilirlik: `:focus-visible`, `aria-label`, `prefers-reduced-motion`, stillenmiş `::selection`.
- Çalışan mikro-etkileşimler: küçük, savunmacı, bağımsız IIFE.
