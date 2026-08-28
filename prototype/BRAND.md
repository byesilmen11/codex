# YUVO Marka Kitabı — "Gün Doğumu Çayırı" (v1, BAĞLAYICI)

> Bu dosya prototipin GÖRSEL ANAYASASIDIR. Her ajan buradaki hex/px/ağırlık değerlerine
> birebir uyar. Davranış sözleşmesi `ARCHITECTURE.md`'dir; bu dosya yalnız görünüşü bağlar.
> Uygulanmış referans: `css/style.css` (tokenlar + sticker bileşenleri) ve `js/ui-icons.js`.

## 0. Marka özü (tek paragraf)

Yuvo bir **oyuncak kutusudur**: elde tutulası, vinil parlaklığında, çıkartma (sticker)
defterinden fırlamış gibi. His: **gün doğumunda bir çayır** — zemin sıcak krem, üzerindeki
her şey **doygun şeker tonu**. Soluk/juvenil pastel YASAK; "yumuşaklık" formdan (yuvarlak),
"canlılık" renkten (doygun) gelir. Her ekran tek temadır (açık, sıcak); koyu tema yoktur ve
hiçbir zemin şeffaf bırakılmaz — her yüzey açıkça boyanır.

## 1. Palet (kesin hex — başka renk türetme, "yaklaşık ton" yok)

### 1.1 Zemin & mürekkep

| Token | Hex | Kullanım |
|---|---|---|
| `--bg` | `#FFF4DC` | Ana zemin (sıcak krem) |
| `--bg2` | `#FFE9C4` | HUD/nav zemini, yumuşak buton, ikincil yüzey |
| `--paper` | `#FFF9EC` | Albüm sayfası "kâğıt" hissi |
| `--card` | `#FFFFFF` | Kart/modal/hap yüzeyi + sticker halesi |
| `--line` | `#3E2A1C` | **Kontur mürekkebi** (tüm sticker konturları) |
| `--ink` | `#4A2E1D` | Başlık/gövde metni (krem üstünde ≥7:1) |
| `--ink-soft` | `#8A6B4F` | İkincil metin, ipuçları |

### 1.2 Gün doğumu şekerleri (vurgular — hepsi DOYGUN)

| Token | Hex | Derin eş | Kullanım |
|---|---|---|---|
| `--sun` | `#FFC734` | `--sun-deep #F2A400` | Aktif nav, yıldız, ilerleme dolgusu |
| `--accent` | `#FF7C33` | `--accent-deep #E85C1E`, açık ucu `--accent-light #FFA94D` | Birincil CTA, vurgu |
| `--sky` | `#8AD9F7` | `--sky-deep #3FA9DE` | Gök bandı, sakin ikincil |
| `--meadow` | `#8ED94F` | `--meadow-deep #55B944` | Çayır, onay/başarı |
| `--pink` | `#FF8FB0` | `--pink-deep #F26D96` | Yanak, kutlama, sevinç anları |

Kural: Beyaz metin yalnız `--accent`/`--accent-deep`/`--meadow-deep`/`--ink` zeminlerde
(≥3:1, yalnız ≥18px kalın metin). `--sun` ve `--sky` üstüne DAİMA `--ink` metin.

### 1.3 Nadirlik (KİLİTLİ — `Yuvo.data.RARITIES.renk` ile birebir aynı, DEĞİŞTİRİLEMEZ)

| Kademe | Ana hex | Yumuşak dolgu (hücre zemini) | Desen (border-style) | Simge |
|---|---|---|---|---|
| Yaygın | `#9AA5B1` | `--r-yaygin-soft #EEF1F5` | düz 3px | ● |
| Az Bulunur | `#58B368` | `--r-azbulunur-soft #E3F5E4` | kesikli 3px | ▲ |
| Nadir | `#4FB8D8` | `--r-nadir-soft #E0F4FB` | çift 6px | ◆ |
| Destansı | `#B266E8` | `--r-destansi-soft #F3E8FC` | noktalı 4px | ★ |
| Efsanevi | `#F2A61B` | `--r-efsanevi-soft #FFF1D4` | kalın düz 5px + nefes alan ışıma | ✹ |
| Gizli | `#5C4A9E` | `--r-gizli-soft #EAE5F8` | kesikli 5px + mor ışıma | ☾ |

**Nadirlik asla yalnız renkle kodlanmaz:** her kademe = renk + desen + simge ÜÇLÜSÜ.
Simgeler `.rf::after` rozetinde (beyaz daire, 2px `--line` kontur) ve `rarity-tag`
metninin başında görünür. Bu üçlü hiçbir yeni bileşende düşürülemez.

## 2. Tipografi (index.html'de yüklü; başka font ekleme)

Yığınlar (aynen kopyala):

```css
--font-display: 'Baloo 2', 'Nunito', 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif;
--font-body:    'Nunito', 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif;
```

| Rol | Font | Boyut | Ağırlık | Not |
|---|---|---|---|---|
| Wordmark/logo | Baloo 2 | 26px optik | 800 | Yalnız `Yuvo.icons.logo()` |
| Sahne başlığı (H1) | Baloo 2 | 26px | 800 | `letter-spacing:.2px` |
| Kart adı (Pufi adı) | Baloo 2 | 30px | 800 | Tören/albüm modal |
| Bölüm başlığı (H3) | Baloo 2 | 21px | 700 | |
| HUD sayıları / ödül sayıları | Baloo 2 | 17px | 800 | `font-variant-numeric:tabular-nums` |
| Buton etiketi | Baloo 2 | 19px | 700 | |
| Nav etiketi | Baloo 2 | 15px | 700 | |
| Gövde | Nunito | 16px / 1.45 | 700 | Nunito 600'ün altı kullanılmaz |
| İpucu / small | Nunito | 13.5px | 700 | Renk `--ink-soft`; **13px altı yasak** |

## 3. Sticker bileşen dili (ölçülebilir reçete)

Her "nesne" (kart, hap, buton, aktif nav, modal, ikon) bir ÇIKARTMADIR. Reçete:

1. **Kontur:** `2.5px solid var(--line)` (CSS). SVG'de: 28'lik viewBox'ta `stroke-width:2`
   (120'lik viewBox'ta 5), `stroke-linejoin:round; stroke-linecap:round`.
2. **Beyaz hale:** konturun DIŞINDA — box-shadow ilk katmanı
   `0 0 0 6px rgba(255,255,255,.9)` (büyük yüzey: kart/modal/aktif nav/rozet)
   veya `0 0 0 4px rgba(255,255,255,.9)` (küçük: hap, hücre). SVG'de: ana şeklin
   altına aynı path, `stroke:#FFFFFF; stroke-width:7` (28'lik kutuda).
3. **Şeker-vinil dolgu:** dikey gradyan `açık uç → ana → derin eş`
   (örn. buton: `linear-gradient(180deg, #FFA94D 0%, #FF7C33 55%, #E85C1E 100%)`) +
   **iç parlama** `inset 0 2px 0 rgba(255,255,255,.55)` + üst-solda küçük beyaz
   parlama noktası (SVG: `opacity:.75` elips).
4. **Vinil kenar (bası öncesi):** `0 4px 0 <derin eş>` sert alt gölge +
   `0 10px 18px rgba(122,74,32,.20)` yumuşak zemin gölgesi.
5. **Bası hissi (:active):** `transform:translateY(3px)` + sert alt gölge `0 1px 0`'a iner.
   `scale` tek başına bası hissi SAYILMAZ; düşey çökme şart.
6. **Köşe yarıçapları:** kart/modal `--radius:26px`, hücre/küçük kart `--radius-sm:16px`,
   hap/buton `999px`. **12px altında yarıçap ve keskin köşe yasak.**

Atmosfer katmanı: geniş zeminlere hafif doku serbesttir (ör. %3–6 opaklıkta nokta/benek
`radial-gradient` deseni) — metnin arkasında asla %6'yı geçmez.

## 4. İkonografi — `Yuvo.icons` (js/ui-icons.js)

Emoji, kabuk UI'ında (HUD, nav, buton, rozet, başlık) YASAKTIR; yerine `Yuvo.icons`:

| Çağrı | İçerik | Nerede |
|---|---|---|
| `logo()` | "Yuv" + çatlak yumurta "o" wordmark (yatay, ~26px yükseklik) | HUD sol |
| `yuva()` `album()` `oyna()` | Yuva sepeti / defter / yap-boz parçası | Alt nav |
| `star()` | Yıldız Tozu | HUD, ödüller |
| `shell()` | Kabuk (salyangoz sarmalı) | HUD, Atölye maliyeti |
| `egg()` | Çatlak çizgili yumurta | HUD "bugün", ek yumurta |
| `close()` `back()` `skip()` `check()` | Daire içinde glif | Modal çarpısı, geri, Atla, onay |

Kurallar:
- Optik boy 24–28px; hepsi `viewBox="0 0 28 28"` (logo hariç), iki-tonlu şeker gradyan +
  `#3E2A1C` kontur (`stroke-width:2`), yuvarlak uç/birleşim, üst-solda parlama noktası.
- Gradient/clip id'leri BENZERSİZ üretilir (`yi-<ad>-<sayaç>`); statik id yazma —
  aynı ikon bir sayfada iki kez basılınca id çakışmamalı. (`pufi-svg.js` `yv-` kullanır;
  `yi-` öneki ona ayrılmış alandır, başka dosya bu önekleri kullanamaz.)
- İkonlar `aria-hidden="true"`; anlam taşıyorsa kapsayıcıya `aria-label` verilir.
- Çağıran kod DAİMA emoji fallback'li sarmalayıcı kullanır (main.js `ico()` deseni):
  `Yuvo.icons` yoksa UI kırılmaz.
- Sahne içi büyük illüstrasyonlar `Yuvo.art`'ındır; `Yuvo.icons` yalnız UI glifidir.

## 5. Sahne başına atmosfer notu

- **Yuva (home):** Ekranın TAMAMI kompozisyondur; boş bant yasak. Yukarıdan aşağı:
  gök bandı (`#8AD9F7 → #CFF0FE`), ufukta gün doğumu ışıması (`#FFE9A8`), güneş (ışın
  halkalı, `--sun`), tepeler halinde katmanlı çayır (`#A5E36B` üst / `#55B944` derin,
  yuvarlak tepe siluetleri), çiçek benekleri. Yuva sepeti örgülü sıcak kahve
  (`#B77B3F` / `#8E5A2B`, örgü çizgileri `--line`), yumurtalar sepetin İÇİNDE durur.
- **Tören (ceremony):** Sahne ışığı hissi — merkezde sıcak radyal parlama, kenarlarda
  hafif vinyet; yumurtanın altında yumuşak zemin gölgesi elipsi; tier arttıkça nadirlik
  renginde aura + parçacık. "Ovala!" yönergesi sticker hap içinde, el ikonu animasyonlu.
- **Birleştirme (assembly):** Atölye masası — `--bg2` ahşap-sıcak zemin, yuvalar sticker
  kesikli kontur + iç gölge; oturan parça `check()` parıltısı alır. Raf, beyaz sticker şerit.
- **Albüm (album):** Defter hissi — `--paper` sayfa, hücre zemini kademenin yumuşak
  dolgusu (`--r-*-soft`), kilometre taşı çipleri şeker hap; "???" gizli hücresi gece
  moru (`#5C4A9E`) ama sayfanın açık temasını bozmayan TEK vurgu adası.
- **Eşle & Bul (minigame):** Kart sırtı markalı: `--accent` şeker gradyan + ortada beyaz
  Yuvo yumurta amblemi + %5 beyaz benek deseni; eşleşme `--meadow` onay parıltısı.

## 6. YAPMA listesi

1. Soluk/gri pastel vurgu YAPMA — vurgular §1.2 hex'leridir; gri yalnız Yaygın çerçevesidir.
2. Kabuk UI'ında emoji YAPMA (`Yuvo.icons` varken); sahne metni içinde de önce ikon düşün.
3. Nadirliği yalnız renkle kodlama — desen + simge üçlüsünü her yerde koru.
4. `--r-*` ana hex'lerini ve ● ▲ ◆ ★ ✹ ☾ simgelerini DEĞİŞTİRME (veri sözleşmesi).
5. KonturSUZ "düz beyaz kutu" bileşen YAPMA — her nesne §3 reçetesinden geçer.
6. 64px altı dokunma hedefi, 13px altı metin, 12px altı köşe yarıçapı YAPMA.
7. Koyu tema, şeffaf zemin, dış kaynak (görsel/CDN/font) YAPMA — her şey inline SVG/CSS.
8. SVG'de statik `id` YAPMA — benzersiz üret; `yi-`/`yv-` öneklerini sahibinden çalma.
9. Metin gölgesiyle kontrast kurtarmaya çalışma — zemini uygun renge boya.
10. Mevcut sınıf adlarını/id'leri yeniden adlandırma (`.pill`, `.home-egg`, `#hud`,
    `#bottom-nav`, `.rf-*`, `.btn*`…) — testler ve sahneler bunlara bağlı.
