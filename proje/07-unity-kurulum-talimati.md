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
| **Unity LTS sürümü** | **Android + iOS modülleri kurulu olan LTS** (paket `2021.3+` uyumlu). Hub'da birden çok editör varsa → aşağıdaki "Hangi Unity sürümü?" bölümü |
| Modüller | **Android Build Support** (SDK/NDK+OpenJDK dahil). iOS için ayrıca **iOS Build Support** (Mac gerekir) |
| Disk | Editör + proje kütüphanesi için ~15 GB |
| Git | Depoyu klonlamak için |

## Hangi Unity sürümü? (Hub'da birden fazla editör varsa)

Yuvo **mobil** bir oyundur (docs/11 §1) → projeyi **Android/iOS modülleri kurulu olan
LTS** ile açmalısın. Hub ▸ Installs ekranında her sürümün altındaki rozetler kurulu
modülleri gösterir.

| Sürüm | Rozetler | Karar |
|---|---|---|
| **Unity 6.3 LTS** (`6000.3.23f1`) | Android · iOS · Windows | ✅ **BUNU KULLAN** |
| Unity 6.5 (`6000.5.10f1`) | Web · Windows | ❌ Android/iOS modülü yok — mobil hedef listede çıkmaz |

Yanlış editörle açarsan Build Settings'te Android görünmez ve bunu ancak U3'te fark
edersin. Proje oluştururken Hub'ın **Editor Version** açılırından `6000.3.23f1` seçili
olduğundan emin ol.

## Adımlar

### 1. Depoyu klonla ve dalı geç

**Windows (PowerShell)** — Başlat ▸ "PowerShell" yaz ▸ aç:
```powershell
cd $HOME\Documents
git clone https://github.com/byesilmen11/codex.git
cd codex
git checkout claude/surprise-egg-collection-game-eycqiq
```
Depo yolun: `C:\Users\<kullanıcı>\Documents\codex`

**macOS / Linux:**
```bash
cd ~/Documents
git clone https://github.com/byesilmen11/codex.git
cd codex
git checkout claude/surprise-egg-collection-game-eycqiq
```

> `git` bulunamazsa: git-scm.com/download/win (Git for Windows) kur, PowerShell'i kapat-aç.

### 2. (İsteğe bağlı ama önerilir) Çekirdeği Unity'siz doğrula
.NET 8 SDK kuruluysa — Unity'ye girmeden çekirdeğin sağlam olduğunu görürsün:
```bash
dotnet test client/Yuvo.Core.Tests
```
Beklenen: **Passed! … Total: 50**.

### 3. Unity projesini oluştur
Unity Hub → **Projects** ▸ **New project** →
- **Editor Version: `6000.3.23f1` (6.3 LTS)** ← Android/iOS olan sürüm (yukarıdaki tabloya bak)
- Şablon: **Universal 2D** (yoksa düz **2D**; U1'de yükseltilir)
- Project name: `UnityProject`
- Location: klonladığın deponun **`client`** klasörü
  → Windows'ta: `C:\Users\<kullanıcı>\Documents\codex\client`
  → sonuç yolu: `…\codex\client\UnityProject`

Bu konum önemli: paket bağlantısı ve `.gitignore` kalıpları bu yola göre yazıldı.
İlk açılış birkaç dakika sürer (paketler derlenir).

### 4. Çekirdek paketini bağla (tek satır)
`…\codex\client\UnityProject\Packages\manifest.json` dosyasını **Not Defteri** (ya da
VS Code) ile aç ve `"dependencies"` bloğunun İÇİNE, ilk satır olarak şunu ekle:

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
Kaydet ve Unity'ye geri dön (pencereye tıkla) — paketi otomatik alır, birkaç saniye sürer.

> ⚠️ **En sık hata: JSON virgülü.** Eklediğin satırın sonunda virgül OLMALI (arkasından
> başka satırlar geliyor). Console'da `manifest.json` / `Failed to parse` hatası çıkarsa
> ilk bakılacak yer budur.

> **Neden kopyalamıyoruz?** Kaynak tek yerde (`client/Yuvo.Core`) kalır; `dotnet test`
> ve Unity aynı dosyaları derler, ikizlenme/sürüklenme olmaz.

### 5. Derlemeyi doğrula
- **Project** penceresi → `Packages` altında **Yuvo Core** görünmeli.
- **Console** penceresi → kırmızı hata **olmamalı** (Clear'a basıp bekle).

### 6. Duman testini çalıştır (asıl kanıt)
1. Unity'de **Project** penceresinde `Assets` üstüne sağ tık ▸ **Create ▸ Folder** ▸ adı
   **`Editor`** (tam bu yazım — Unity bu klasörü editör kodu olarak tanır).
2. `…\codex\client\unity-smoke\YuvoCoreSmokeTest.cs` dosyasını Dosya Gezgini'nden
   `…\codex\client\UnityProject\Assets\Editor\` klasörüne **kopyala** (sürükle-bırak da olur).
   PowerShell ile:
   ```powershell
   Copy-Item client\unity-smoke\YuvoCoreSmokeTest.cs client\UnityProject\Assets\Editor\
   ```
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
Depo klasöründe (PowerShell veya terminal, ikisinde de aynı):
```powershell
git add client/UnityProject
git commit -m "Unity projesi iskeleti (U1 baslangici)"
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
| `Duplicate assembly attribute` / `AssemblyInfo` hataları | Paket klasöründe eski `bin/`–`obj/` kalıntısı var. **Windows:** `Remove-Item -Recurse -Force client\Yuvo.Core\bin, client\Yuvo.Core\obj` · **Unix:** `rm -rf client/Yuvo.Core/bin client/Yuvo.Core/obj` (yeni derlemeler zaten `client/.build/` altına gider). |
| `git` / `dotnet` komutu bulunamadı (Windows) | Git for Windows (git-scm.com) ve/veya .NET 8 SDK (dotnet.microsoft.com) kur, PowerShell'i kapat-aç. Adım 2 zaten isteğe bağlı — .NET kurmadan da devam edebilirsin. |
| Build Settings'te **Android yok** | Proje yanlış editörle açılmış (6.5 = Web+Windows). Hub ▸ Projects ▸ projenin yanındaki sürüm açılırından `6000.3.23f1` seç, yeniden aç. |
| Kod düzenleyici açılmıyor / IntelliSense yok | Visual Studio 2026 Community zaten kurulu (Hub modül listesinde görünüyor). Unity ▸ Edit ▸ Preferences ▸ External Tools ▸ External Script Editor → Visual Studio. |
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
