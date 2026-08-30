# Yuvo.Core Port Sözleşmesi (BAĞLAYICI)

> Kaynak gerçek: `prototype/js/engine/state.js` + `prototype/js/engine/gacha.js`.
> Hedef: davranışsal ve (RNG yolunda) BİT düzeyinde özdeş C# portu. Kabul:
> `dotnet test client/Yuvo.Core.Tests` → altın vektörler (5 senaryo / 3.800 açılış,
> `content/golden/*.json`) bire bir + davranış asertleri yeşil.
> Hazır dosyalar (DOKUNMA): `Yuvo.Core.csproj`, `GameState.cs`, `GameContent.cs`, `Rng.cs`,
> test csproj. Her ajan YALNIZ kendine atanan dosyayı yazar.

## Dosya sahiplikleri

| Dosya | İçerik |
|---|---|
| `Yuvo.Core/StateEngine.cs` | state.js API'lerinin portu |
| `Yuvo.Core/GachaEngine.cs` | gacha.js portu (`OpenEgg`) |
| `Yuvo.Core.Tests/Fixtures.cs` + `Yuvo.Core.Tests/GoldenVectorTests.cs` | içerik/vektör yükleyici + altın vektör testleri |
| `Yuvo.Core.Tests/BehaviorTests.cs` + `Yuvo.Core.Tests/ContentTests.cs` | davranış + statik veri asertleri |

## JS→C# anlam eşleme kuralları (her port bunlara uyar)

1. `x | 0` → alanlar zaten `int`; JS'te savunmacı coercion olan yerlerde C#'ta ekstra iş yok.
2. `>>> 0` / `>>>` → `uint` aritmetiği / mantıksal kaydırma. RNG HAZIR: `Rng.Next(state)` —
   yeniden yazma, yalnız çağır. rand() ÇAĞRI SAYISI VE SIRASI kutsaldır (altın vektörler).
3. `Math.round(x)` (JS: floor(x+0.5)) → `System.Math.Floor(x + 0.5)`; `round2(n)` →
   `Math.Floor(n * 100 + 0.5) / 100`. C# `Math.Round` KULLANMA (banker's rounding sapar).
4. Kayan nokta işlem SIRASI korunur (weightedPick toplama sırası, soft-pity normalize çarpanları).
5. JS nesne anahtar sırası → C#'ta `List` sırası: havuz taramaları `Content.Pufis` dizi
   sırasıyla; seri rotasyonu `Content.SeriesKeys` sırasıyla.
6. `Math.random()` (tohumsuz — makeEgg variant, Şako saklama, dilek/id dışı işler) →
   `UnseededRandom()` delegesi (ctor'da enjekte; varsayılan `System.Random`). Rng.Next İLE
   KARIŞTIRMA: gacha çekilişleri YALNIZ Rng.Next kullanır.
7. Zaman: `Date.now()` → `NowMs()` delegesi; `monthKey()` → `MonthKeyFn()` delegesi
   (test enjekte eder). Core'da doğrudan DateTime KULLANMA (varsayılan delege hariç).
8. commit()/save()/refresh() çağrılarının C# karşılığı YOK (kalıcılık ayrı katman) — atla.
9. Hata asla fırlatma stili: JS savunmacı `return false` desenleri aynen korunur.
10. **Platformlar arası sayı doğrulaması METİN üzerinden YAPILMAZ.** `double`→metin biçimi
    çalışma zamanına göre değişir: .NET Core 3.0+ `ToString("R")` en kısa geri-dönüştürülebilir
    yazımı verir (`0.9797282677609473`), Unity'nin Mono'su 17 basamak yazar
    (`0.97972826776094735`) — AYNI sayı, farklı metin. Parite testlerinde
    `BitConverter.DoubleToInt64Bits` (C#) / bit deseni karşılaştırması kullanılır. Bu kural
    Unity duman testinde gerçek bir sahte alarmla öğrenildi (2026-08-30, O-12).

## StateEngine API'si (imzalar SABİT)

```csharp
public sealed class StateEngine
{
    public GameState S;                    // aktif durum (Reset kurar)
    public readonly GameContent Content;
    public Func<double> UnseededRandom;    // JS Math.random karşılığı
    public Func<long> NowMs;               // JS Date.now karşılığı (ms)
    public Func<string> MonthKeyFn;        // "YYYY-MM"

    public StateEngine(GameContent content, Func<double> unseededRandom = null,
                       Func<long> nowMs = null, Func<string> monthKeyFn = null);
    // ctor: delegeleri kur (null→gerçek saat/Random), sonra Reset(null).

    public GameState Reset(uint? seed = null);       // defaults() + fillTodayEggs(3); seed verilmişse (seed==0→1)
    public string DaySeries(int day);                // SeriesKeys[max(0,day-1) % n]
    public string ActiveSeries();                    // DaySeries(S.Day)
    public string YarinSeri();                       // DaySeries(S.Day + 1)
    public Egg MakeEgg(int day, string seri = null); // geçersiz seri→DaySeries(day); Variant=floor(UnseededRandom()*WrapperVariants); Golden=null
    public void NewDay();                            // state.js newDay birebir (streak→day++→birikim tavan 9→club→kuluçka→senkron→sıfırlamalar→ay→Şako→hafta)
    public void AddStardust(int n);
    public bool SpendStardust(int n);
    public bool BuyExtraEgg();                       // 120⭐, günde max 2
    public Egg GrantEgg(string seri = null);
    public int EatChocolate();                       // dönen = kazanılan ⭐ (tavan 40, ısırık 2)
    public int BankChocolate();                      // dönen = yeni kumbara sayısı
    public bool RedeemChocolates();                  // eşik 15, günde 1 → GrantEgg
    public FoilRecord RegisterFoil(string seri, int variant, bool golden);
    public bool SetTool(string id);
    public int OwnedCount(string biome = null);      // gizli HARİÇ; biome verilirse filtre
    public List<string> CheckMilestones();           // çayır sayacı; MILESTONES: 10/15,20/30,27/60,30/100
    public CraftResult Craft(string pufiId);         // {Ok, Reason}; gizli→OwnedCount(biome)==30 şartı
    public bool SetBiome(string b);
    public bool CheckOrmanUnlock();                  // çayır>=10 → bir kez true
    public bool SakoRecover();
    public bool GorevIlerle(string tip);             // "ac"|"oyun"|"album"; 3/1/albüm tamam→BİR KEZ GrantEgg + GorevBonusYeni + true
    public (int Ac, int Oyun) GorevHedef();          // (3, 1)
    public bool KuluckaBirak(string seri = null);    // doluysa false; seri geçersizse DaySeries(Day+1)
    public (int Hedef, int Kabuk) StreakInfo();      // (7, 25)
    public bool AddWish(string pufiId);              // 7 gün budama (NowMs), kopyasız, tavan 5; Not/Durum alanlarını KORU
    public bool ClearWish(string pufiId);
    public BuyResult BuyPack(string paketId);        // {Ok, Reason, Adet, Tutar}; SyncMonth; limit; Club bonus Ceiling; Kiler'e ekler
    public bool DrawFromKiler();                     // tavan KilerGunluk (+KilerEk Club'da)
    public SetLimitResult SetLimit(double tl);       // {Ok=true, Soguma, SogumaSaat}
    public bool SetPin(string p);                    // ^\d{4}$
    public bool ToggleClub();
    public SpendReport BuildSpendReport();           // spendReport() portu
    public void SyncMonth();                         // ay değiştiyse SpentTL=0
}
public sealed class CraftResult { public bool Ok; public string Reason; }
public sealed class BuyResult { public bool Ok; public string Reason; public int Adet; public double Tutar; }
public sealed class SetLimitResult { public bool Ok; public bool Soguma; public int SogumaSaat; }
public sealed class SpendReport { public string Ay; public double SpentTL; public double LimitTL;
    public bool ClubActive; public int PaketAdet; public int Yumurta; public int KilerAdet; public int Pufi; }
```

Sabitler (state.js ile aynı, `content/ritual.json` "engine" bölümüyle çapraz-doğrulanır):
`DAILY_EGGS=3, EGG_STACK_MAX=9, STREAK_GOAL=7, STREAK_KABUK=25, GOREV_AC_HEDEF=3,
GOREV_OYUN_HEDEF=1, EXTRA_EGG_COST=120, EXTRA_EGG_MAX=2`. Ritüel sabitleri
`Content.Ritual`dan okunur (JS'teki `ritual()`/`storeLimits()`/`clubInfo()` karşılığı).

## GachaEngine API'si (imzalar SABİT)

```csharp
public sealed class GachaEngine
{
    public GachaEngine(StateEngine engine);
    public OpenEggResult OpenEgg(int? eggIdx = null);   // gacha.js openEgg birebir
    public void ForceGoldenNext();                       // test kancası
}
public sealed class OpenEggResult
{
    public string Error;             // "no-egg" | null
    public PufiDef Pufi; public string Rarity; public bool IsNew; public int KabukGained;
    public int CelebrationTier; public WrapperInfo Wrapper; public int Chocolate;
    public bool OrmanUnlocked; public bool GorevBonus;
}
public sealed class WrapperInfo { public string Seri; public int Variant; public bool Golden; }
```

Sabitler (gacha.js): `SOFT_PITY_E=35, SOFT_ARTIS=0.06, HARD_PITY_E=50, PITY_DESTANSI=40,
PITY_NADIR=15, ONBOARDING=10, KOPYA_SERI_ESIGI=6, W_EKSIK=4, W_EKSIK_SON3=12`.
`TIERS` sırası: yaygin, azbulunur, nadir, destansi, efsanevi, gizli. rand() tüketim noktaları
(SIRA KUTSAL): pickTier weightedPick → [zorlaEksik yükseltmede adaylar>1 ise weightedPick] →
pickPufi (E/G-eksik | zorlaEksik | weightedPick yollarından tam biri) → altın folyo kontrolü
(`forceGoldenNext` FALSE iken her açılışta TAM BİR rand: `rand() < GoldenOran` kısa devre
sırası JS ile aynı). `weightedPick` kayan-nokta artığı geri-tarama dalı dahil birebir.

## Test fikstürleri

- Depo kökü: testin çalıştığı dizinden yukarı yürüyerek `content/` klasörünü bul.
- `Fixtures.LoadContent()`: pufis/rarities/wrappers/packs/ritual JSON'larını `GameContent`e
  yükler. wrappers.json "series" ANAHTAR SIRASI `SeriesKeys`e aynen (System.Text.Json
  `JsonDocument.EnumerateObject` belge sırasını korur). ritual.json "ritual" bölümü →
  `RitualDef` (GOLDEN_ORAN→GoldenOran vb.); "engine"/"gacha" bölümleri sabit çapraz-doğrulama
  için ham değer olarak da erişilebilir olsun.
- Altın senaryo koşucusu: `Reset((uint)seed)` → kurulum JSON'undan `owned` (sıra: JSON belge
  sırası), `eggCounter`, `ormanAcik`, `activeBiome` uygula → her vektör için
  `S.TodayEggs = [ new Egg{Seri="gunesbahcesi", Variant=0, Golden=null} ]; S.EggsAvailable=1;`
  → `OpenEgg()` → karşılaştır: `[rarity, pufiId, isNew, golden, pityN, pityD, pityE, copyStreak]`
  (pity/copyStreak = AÇILIŞTAN SONRAKİ durum). Uyuşmazlıkta indeks + beklenen/ölçülen yazdır.

## Davranış testleri kapsamı (tools/proto-engine-test.mjs çevirisi)

Statik: 62 Pufi, biyom başına 12/9/6/2/1/1, benzersiz id, oran toplamı 1, 6 seri, merdiven
6 + tekSeferlik hoşgeldin, birim fiyat tekdüze iner. Motor: onboarding (ilk 10 yeni, 3.
Nadir+); 5.000 açılışta pity ihlali yok; çikolata (⭐ tavan 40, kumbara günde 1, yeni gün
tazeler); newDay birikimi (4 kalan→7; tavan 9; Club tavanı aşmaz); kuluçka (İLK sıra, doğru
seri, tavana sayılmaz, tek seferlik); görev zinciri (+1 BİR KEZ, openEgg üzerinden);
Bekçi Takvimi (oynanan gün 1 yıldız, kaçan gün DÜŞÜRMEZ, 7→+25 Kabuk+rozet+sıfır);
mağaza (limit reddi, Club yuvarlama 10→11, kiler tavan 5/+1, ay devri); dilek (kopyasız,
tavan 5, 7 gün budama — NowMs enjeksiyonuyla); setLimit soğuma yalnız artırımda; setPin
format; biyom (kilitliyken geçilemez, çayır 10'da açılır, havuz sızdırmaz ×600, gizli kapısı
kendi 30/30'u, kilometre taşları çayıra bağlı, sakoRecover). Migrasyon testleri KAPSAM DIŞI
(SaveService ayrı iş paketi).

---

# EK — SaveService Katmanı Sözleşmesi (2. iş paketi, BAĞLAYICI)

> Kaynak gerçek: `prototype/js/engine/state.js` `load()` (satır ~168-280) + docs/v2/07 §7.
> Kabul: `content/golden/migration/*.json` altın fikstürleri (JS load() gerçek çıktıları)
> C# migratöründe bire bir + SaveService yuva/fuzz testleri yeşil.
> Core kuralı DEĞİŞMEZ: Yuvo.Core'da dosya G/Ç'si ve dış JSON bağımlılığı YOK.

## Dosya sahiplikleri (EK)

| Dosya | İçerik |
|---|---|
| `Yuvo.Core/SaveValue.cs` | Bağımlılıksız mini JSON modeli + `JsonCodec.Parse/Write` |
| `Yuvo.Core/SaveCodec.cs` | `GameState → SaveValue/JSON` (JS alan adlarıyla) + `StateEngine.Load` portu (SaveMigrator) |
| `Yuvo.Core/SaveService.cs` | `ISaveStore` + çift yuvalı zarf servisi |
| `tools/export-migration-fixtures.mjs` | JS load() → altın migrasyon fikstürleri |
| `Yuvo.Core.Tests/SaveTests.cs` | MigrationGolden + RoundTrip + SaveService yuva/fuzz testleri |

## SaveValue / JsonCodec (netstandard2.1, sıfır bağımlılık)

```csharp
public sealed class SaveValue
{
    public enum Kind { Null, Bool, Num, Str, Arr, Obj }
    public Kind K;
    public bool B; public double N; public string S;
    public List<SaveValue> Items;                              // Arr
    public List<KeyValuePair<string, SaveValue>> Props;        // Obj — EKLEME SIRASI KORUNUR
    // kurucular: Nil()/Of(bool)/Of(double)/Of(string)/NewArr()/NewObj()
    // erişim: Get(name) -> SaveValue|null; Set(name, v); IsObj/IsArr/IsStr/IsNum/IsBool özellikleri
    // Truthy(): JS truthiness (null/false/0/NaN/"" → false) — migrasyondaki `||`/`if (x)` denetimleri için
    // DeepEquals(a, b): yapısal eşitlik (Obj'de SIRA BAĞIMSIZ, sayılar double ==)
}
public static class JsonCodec
{
    public static SaveValue Parse(string json);   // HATADA null (asla fırlatmaz); tam JSON grameri:
                                                  // obj/arr/str (escape+\uXXXX), sayı (int/frac/exp), true/false/null
    public static string Write(SaveValue v);      // kompakt; string escape JSON.stringify uyumlu;
                                                  // sayı: tam sayıysa noktasız ("40"), değilse R-format ("9.99")
}
```

## SaveCodec: GameState → JSON (JS alan adları BİREBİR)

`SaveCodec.ToSave(GameState)` state.js `defaults()` anahtar SIRASI ve adlarıyla nesne üretir:
`version, stardust, kabuk, day, eggsAvailable, extraEggsBought, eggCounter, pityN, pityD,
pityE, copyStreak, owned, milestones, weekCrafts, rewardedPlaysToday, todayEggs,
firstRitualDoneToday, chocolates, chocolateStarsToday, kumbaraToday, lastChocolateChoice,
foilBook, goldenPity, tools, activeTool, parent{pin,limitTL,spentTL,ay,clubActive,limitRaiseTs},
kiler{adet,bugunAcilan}, wishes, purchases, introDone, introGiftShown, activeBiome, ormanAcik,
sakoHidden, hedefPufi, kulucka, bugunAcilanlar, gorevler{ac,oyun,albumZiyaret,bonusVerildi},
gorevBonusYeni, streak{yildiz,rozet}, seed`.
Şekil kuralları: yumurta `{seri,variant,golden}` (+ yalnız true iken `kulucka:true`); golden
null→JSON null; foilBook `{seriId:{variants:{"0":n,...},golden:n}}` (variant anahtarları
STRING); wish `{pufiId,ts}` (+yalnız varsa `not`/`durum`); kulucka null→null, doluysa `{seri}`;
sakoHidden/hedefPufi null→null; seed sayı (uint değer).

## StateEngine.Load — state.js load() portu (SaveMigrator)

```csharp
// StateEngine'e EK metot (SaveCodec.cs içinde partial DEĞİL — SaveCodec statik sınıfına
// public static GameState Load(StateEngine eng, SaveValue saved) yaz; eng.S'i değiştirir ve döndürür):
public static GameState Load(StateEngine eng, SaveValue saved);
```
Birebir JS sırası (RASTGELELİK TÜKETİMİ DAHİL — altın fikstürler bunu ölçer):
1. `base = Defaults()` → 1 UnseededRandom (freshSeed) + 3 UnseededRandom (variant) TÜKETİR.
   (StateEngine.Defaults private — Load bunu `eng.Reset(null)` üzerinden DEĞİL, Reset'in
   S'e atamasından bağımsız kullanmak için: `eng.Reset(null)` çağır, `base = eng.S` al —
   Reset(null) JS `defaults()` ile aynı tüketimi yapar, seed'i freshSeed bırakır.)
2. savedHadEggs = saved geçerli obj && todayEggs bir Arr.
3. Bilinen-anahtar birleştirme: defaults'taki HER alan için saved'de alan varsa ve JS
   `!== null && !== undefined` ise base'e KOPYALA (nesne alanlarında saved değeri komple alınır,
   tip onarımı sonra düzeltir — JS satır 177-181 semantiği).
4. Tip onarımları JS satır satır: owned obj değilse {}, milestones Arr değilse [], seed
   Truthy değilse freshSeed() (1 random daha); todayEggs: savedHadEggs değilse
   fillTodayEggs(base, max(0, eggsAvailable|0)) (n × random), else temizle (geçersiz seri →
   daySeries(day), variant clamp 0..7, golden!==true→null, kulucka!==true→alan yok);
   foilBook/tools (FREE_TOOLS tamamla)/activeTool/lastChocolateChoice('biriktir' değilse 'ye')/
   sayaç max(0,·|0)'ları/firstRitualDoneToday===true; v3 bloğu: parent onarımları (pin ^\d{4}$
   değilse "1234", limitTL sayı&&>=0 değilse varsayılan, spentTL max(0,round2), ay string
   değilse MonthKeyFn(), clubActive===true, limitRaiseTs max(0,·|0)), syncMonth, kiler
   onarımları, wishes süz ({pufiId string} şart; ts max(0,·|0); not==='dogumgunu' ve
   durum==='sonra' KORUNUR), purchases Arr değilse [] (İÇERİK DOĞRULANMAZ — JS de doğrulamaz;
   öğeler ham SaveValue'dan Purchase'a alan-adıyla okunur: paketId/ad/tutar/adet/ts, eksikse
   varsayılan 0/null), kulucka obj&&seri string değilse null, bugunAcilanlar Arr değilse []
   (elemanlar string olmayanlar JS'te KALIR mı? — JS süzmez, C# string olmayanı String()'e
   çevirmek yerine atla ve bunu fikstürle kilitle), gorevler onarımı, gorevBonusYeni===true,
   streak onarımı; version=3; eggsAvailable=todayEggs.Count.
   `x | 0` = ToInt32 çevirisi: Num→trunc(int32), diğer türler→0 (JS ToInt32(NaN)=0).
5. Purchases sayısal alanlar: JS `pr.adet | 0` yalnız spendReport'ta; load'da purchases olduğu
   gibi kalır → C# Purchase tipine okurken Num değilse 0, Str değilse null (fikstürle kilitli).

## ISaveStore + SaveService (çift yuva, zarf)

```csharp
public interface ISaveStore
{
    string ReadSlot(string slot);            // yoksa/okunamazsa null (fırlatmaz)
    bool WriteSlot(string slot, string content);  // ATOMİK yazım uygulamanın işi; başarı döndürür
}
public sealed class SaveService
{
    public SaveService(ISaveStore store, StateEngine engine);
    public bool Save();     // zarf: {"surum":1,"sira":N,"sum":"8-hane-hex","kayit":{...}}
                            // sum = FNV-1a 32 (SaveCodec kayit JSON dizgisi üzerinden, UTF-16 kod birimleriyle
                            // pufiChirp'teki formülle aynı: h=2166136261; h^=ch; h*=16777619)
                            // hedef yuva: son geçerli yuvanın TERSİ ("a"/"b"; hiç yoksa "a"); sira = sonSira+1
    public bool Load();     // iki yuvayı oku; parse+sum geçerli olanlardan sira'sı büyük olanı
                            // SaveCodec.Load ile engine.S'e migre et; ikisi de geçersizse false (S DOKUNULMAZ)
    public int LastSira;    // teşhis (Load/Save günceller; başlangıç 0)
    public string LastSlot; // "a"|"b"|null
}
```
Testlerdeki `FileSaveStore` (SaveTests.cs içinde): temp dosyaya yaz + `File.Move(temp, hedef,
overwrite)` (atomik değiştirme); `InMemorySaveStore`: sözlük. Core'a dosya kodu GİRMEZ.

## Altın migrasyon fikstürleri (tools/export-migration-fixtures.mjs)

- Sandbox: proto-engine-test.mjs deseni + İKİ stub: (a) Math.random → gacha-rand formülüyle
  yerel tohum 42 (her vaka taze); (b) Date → sabit 2026-01-15 (monthKey "2026-01"; Date.now
  sabit 1768435200000). localStorage 'yuvo-proto-v1' anahtarına vakanın `girdi`si (string;
  obje vakalarında JSON.stringify) konur → `Yuvo.engine.load()` → sonuç state JSON.
- Çıktı: `content/golden/migration/<ad>.json` =
  `{ "_meta", "ad", "aciklama", "rngTohum": 42, "sabitAy": "2026-01", "girdi": <string|null>,
     "beklenen": <state objesi> }` (girdi null = localStorage boş vakası).
- Vakalar (EN AZ): `bos-depo` (girdi yok), `cop-json` ("{{bozuk"), `v1-kayit` (todayEggs'siz,
  eggsAvailable 2, owned dolu, seed VAR), `v2-kayit` (bozuk yumurtalar: geçersiz seri, variant 99,
  golden "evet"; foilBook; tools eksik; seed VAR), `v3-bozuk` (pin "abc", negatif kiler, çöp
  wishes+not/durum karışık, gorevler string, streak dizi, ay "2000-01", seed VAR), `v3-tam`
  (kulucka+hedefPufi+sakoHidden+wish notları+bugunAcilanlar dolu modern kayıt, ay "2026-01").
  Her vakada seed açıkça verilir (freshSeed bit eşleşmesi istenmez — sözleşme gereği C#
  FreshSeed yaklaşık eşlemedir; SEED'SİZ VAKA YAZMA).
- `--check` modu diğer export araçlarıyla aynı.

## SaveTests.cs kapsamı

- MigrationGolden: her fikstür → `girdi` parse (null/bozuk dahil) → StateEngine
  (MonthKeyFn=()=>"2026-01"; UnseededRandom = Rng.Next(new GameState{Seed=42}) akışı) →
  SaveCodec.Load → SaveCodec.ToSave → `beklenen` ile SaveValue.DeepEquals (uyuşmazlıkta
  farklı İLK yol adını yazdır — özyineli fark bulucu).
- RoundTrip: Reset(9001) + birkaç mutasyon (openEgg×2, addWish, kuluckaBirak, buyPack) →
  ToSave → Write → Parse → Load (AYNI rastgelelik akışına dokunmadan: Load öncesi motoru
  taze kur) → tekrar ToSave → DeepEquals.
- SaveService: (1) Save→Load round-trip (InMemory); (2) dönüşümlü yuva: 2×Save → a ve b dolu,
  sira 1,2; (3) bozuk son yuva → önceki sağlam yuvaya düşer (b'yi elle boz → Load a'yı seçer);
  (4) sum ihlali (kayit içi 1 karakter oynat) → o yuva reddedilir; (5) iki yuva da çöp →
  Load false ve S değişmez; (6) FileSaveStore ile gerçek dosya round-trip.
- Fuzz: 200 üretilmiş çöp girdi (kesik JSON, yanlış tipler, derin iç içe, boş obje) →
  JsonCodec.Parse + SaveCodec.Load HİÇ fırlatmaz; sonuç state her zaman geçerli
  (eggsAvailable==TodayEggs.Count, sayaçlar >=0). Rastgelelik: System.Random(sabit tohum).

## EK notu — tipli alan sıkılaştırması (kapsam eleştirmeni sonrası, BİLİNÇLİ)

JS load() bazı alanlarda HİÇ tip onarımı yapmaz ve çöpü olduğu gibi taşır (ör. sayı
`hedefPufi`, string `day`, `bugunAcilanlar` içinde sayı/null öğe, `purchases` içinde obj
olmayan öğe). C#'ın tipli GameState'i bu şekilleri TEMSİL EDEMEZ ve varsayılana düşürür —
bu bilinçli bir sıkılaştırmadır: JS motoru bu şekilleri asla üretmediğinden gerçek kayıtlar
etkilenmez, elle bozulmuş depoda C# daha güvenli davranır. Altın fikstürler bu yüzden
motor-imkânsız şekiller İÇERMEZ (eleştirmen raporu B1-B3); string-tipli-ama-geçersiz
değerler ise (activeBiome "uzay", kulucka.seri "yok-boyle") JS gibi olduğu gibi taşınır ve
fikstürle KİLİTLİDİR (v3-bozuk2, v3-sinir). Kapsam: 11 fikstür / load() dallarının tam
haritası eleştirmen raporundadır (proje/05 O-09).
