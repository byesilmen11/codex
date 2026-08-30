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
