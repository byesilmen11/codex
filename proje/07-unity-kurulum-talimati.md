# 07 · Unity Kurulum Talimatı (senin makinende, ~20 dakika)

> **Amaç:** `client/Yuvo.Core` (oyun çekirdeği: gacha/pity, oyun durumu, ekonomi, kalıcılık)
> Unity'de derlensin ve çalıştığı KANITLANSIN. Bu adım bittiğinde U1 (ekranlar) başlayabilir.
> **Bu ortamda yapılamaz** — Unity editörü gerektirir; hazırlıkların TAMAMI bitmiş durumda,
> sana kalan yalnız aşağıdaki adımlar.
>
> Hazır olanlar: paket manifesti (`package.json`) + assembly tanımı (`Yuvo.Core.asmdef`) ·
> derleme çıktıları Unity'yi kirletmeyecek şekilde yönlendirildi (`client/Directory.Build.props`)
> · `.gitignore` Unity kalıplarıyla güncellendi · duman testi scripti yazıldı ve Unity API'leri
> taklit edilerek burada koşuldu (**9/9 geçti**).

## Ön koşullar

| Gereksinim | Not |
|---|---|
| **Unity Hub** | unity.com/download |
| **Unity LTS sürümü** | Hub'ın önerdiği güncel **LTS**'i kur (Unity 6 LTS ya da 2022.3 LTS — paket `2021.3+` uyumlu, üçü de olur) |
| Modüller | **Android Build Support** (SDK/NDK+OpenJDK dahil). iOS için ayrıca **iOS Build Support** (Mac gerekir) |
| Disk | Editör + proje kütüphanesi için ~15 GB |
| Git | Depoyu klonlamak için |

## Adımlar

### 1. Depoyu klonla ve dalı geç
```bash
git clone https://github.com/byesilmen11/codex.git
cd codex
git checkout claude/surprise-egg-collection-game-eycqiq
```

### 2. (İsteğe bağlı ama önerilir) Çekirdeği Unity'siz doğrula
.NET 8 SDK kuruluysa — Unity'ye girmeden çekirdeğin sağlam olduğunu görürsün:
```bash
dotnet test client/Yuvo.Core.Tests
```
Beklenen: **Passed! … Total: 50**.

### 3. Unity projesini oluştur
Unity Hub → **New project** →
- Şablon: **2D (URP)** — URP yoksa düz **2D** de olur, U1'de yükseltilir
- Project name: `UnityProject`
- Location: klonladığın deponun **`client/`** klasörü
  → sonuç yolu: `<depo>/client/UnityProject`

Bu konum önemli: paket bağlantısı ve `.gitignore` kalıpları bu yola göre yazıldı.

### 4. Çekirdek paketini bağla (tek satır)
`<depo>/client/UnityProject/Packages/manifest.json` dosyasını bir metin düzenleyicide aç ve
`"dependencies"` bloğunun İÇİNE şu satırı ekle (virgüllere dikkat):

```json
"com.yuvo.core": "file:../../Yuvo.Core",
```

Örnek görünüm:
```json
{
  "dependencies": {
    "com.yuvo.core": "file:../../Yuvo.Core",
    "com.unity.render-pipelines.universal": "…",
    …
  }
}
```
Kaydet ve Unity'ye geri dön — otomatik olarak paketi alır (birkaç saniye).

> **Neden kopyalamıyoruz?** Kaynak tek yerde (`client/Yuvo.Core`) kalır; `dotnet test`
> ve Unity aynı dosyaları derler, ikizlenme/sürüklenme olmaz.

### 5. Derlemeyi doğrula
- **Project** penceresi → `Packages` altında **Yuvo Core** görünmeli.
- **Console** penceresi → kırmızı hata **olmamalı** (Clear'a basıp bekle).

### 6. Duman testini çalıştır (asıl kanıt)
1. Unity'de `Assets` altında **`Editor`** adında bir klasör oluştur.
2. `<depo>/client/unity-smoke/YuvoCoreSmokeTest.cs` dosyasını bu klasöre **kopyala**.
3. Üst menüde beliren **Yuvo ▸ Çekirdek Duman Testi** komutunu çalıştır.
4. Console'da beklenen çıktı:

```
YUVO ÇEKİRDEK DUMAN TESTİ — TÜMÜ GEÇTİ
  ✔ RNG 1. çekiliş
  ✔ RNG 2. çekiliş
  ✔ RNG 3. çekiliş
  ✔ RNG tohum ilerlemesi
  ✔ GameState varsayılanları
  ✔ JSON sayı yazımı kültürden bağımsız
  ✔ JSON round-trip
  ✔ kayıt yazıldı
  ✔ kayıt geri yüklendi (Kabuk 77, migrasyon damgası 3)
```

Bu çıktı şunu kanıtlar: paket derlendi **ve** çekilişin rastgelelik akışı Unity içinde de
masaüstü .NET ile JS prototipiyle **birebir aynı** sayıları üretiyor (oranlar/pity Unity'de
de aynı davranacak).

### 7. Temel proje ayarları (U1 hazırlığı, 2 dakika)
**Edit ▸ Project Settings**:
- **Player ▸ Resolution and Presentation**: Default Orientation → **Portrait**
- **Player ▸ Other Settings**: Color Space → **Linear** (sticker görsel dili için)
- **Game** penceresi çözünürlüğü: **390×844** (prototiple aynı referans çerçeve)

### 8. Commit et
```bash
git add client/UnityProject
git commit -m "Unity projesi iskeleti (U1 başlangıcı)"
git push
```
`.gitignore` `Library/`, `Temp/`, üretilen `.csproj`/`.sln` dosyalarını zaten dışarıda tutar —
`git status` bunları göstermemeli (gösteriyorsa commit etme, haber ver).

## Doğrulama kontrol listesi

- [ ] `dotnet test client/Yuvo.Core.Tests` → 50/50 (isteğe bağlı adım 2)
- [ ] Unity Console'da hata yok
- [ ] Project ▸ Packages altında **Yuvo Core** var
- [ ] **Yuvo ▸ Çekirdek Duman Testi** → "TÜMÜ GEÇTİ"
- [ ] `git status` içinde `Library/` **yok**

## Sorun giderme

| Belirti | Sebep / çözüm |
|---|---|
| Paket görünmüyor, manifest hatası | `file:` yolu yanlış. Proje **`client/UnityProject`** altında mı? Değilse yolu düzelt: manifest.json'un bulunduğu `Packages/` klasöründen `Yuvo.Core`'a göreli yol. |
| `The type or namespace 'Yuvo' could not be found` | Paket yüklenmemiş (yukarıdaki madde) **ya da** script `Assets/Editor` yerine paket içine konmuş. |
| `Duplicate assembly attribute` / `AssemblyInfo` hataları | Paket klasöründe eski `bin/`–`obj/` kalıntısı var. Sil: `rm -rf client/Yuvo.Core/bin client/Yuvo.Core/obj` (yeni derlemeler zaten `client/.build/` altına gider). |
| Duman testinde **RNG satırları hatalı** | CİDDİ: Unity çalışma zamanı `uint` aritmetiğinde sapıyor demektir; altın vektör paritesi bozulur. Ekran görüntüsüyle haber ver — `Rng.cs` ve IL2CPP ayarları birlikte incelenir. |
| Duman testinde **JSON/kayıt satırı hatalı** | Cihaz kültürü sızmış olabilir. Hangi satırın düştüğünü ilet. |
| Console'da URP/shader uyarıları | Zararsız; U1'de görsel boru hattı kurulurken düzelir. |

## Bundan sonrası (U1 — ekranlar)

Bu adım bittiğinde sıradaki iş paketi (`docs/v2/07 §10`):
1. **İçerik boru hattı**: `content/*.json` → StreamingAssets/Addressables + `GameContent` yükleyici
   (test tarafındaki `Fixtures.LoadContent` mantığının Unity karşılığı).
2. **Testleri Unity Test Runner'a bağlama**: `Yuvo.Core.Tests` şu an `dotnet test` ile koşuyor;
   Unity'de koşmak için paket içinde `Tests/` klasörü + test asmdef gerekir (isteğe bağlı —
   `dotnet test` zaten CI kapısı olarak yeterli).
3. **Ekranlar**: Home → Ceremony → Assembly → Album (tek biyom), prototipteki 22 adımlık
   ritüel paritesi.

## Yapılmaması gerekenler

- `Yuvo.Core` dosyalarını `Assets/` altına **kopyalama** — paket bağlantısı bunun için var.
- Paket içine `UnityEngine`/`UnityEditor` kullanan kod **ekleme** — asmdef'te
  `noEngineReferences: true` var, kasıtlı bir kilit: çekirdek motor Unity'den bağımsız kalmalı
  ki `dotnet test` ile saniyeler içinde doğrulanabilsin.
- `Library/` klasörünü commit etme.
