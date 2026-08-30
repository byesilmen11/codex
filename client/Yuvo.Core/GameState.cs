using System.Collections.Generic;

namespace Yuvo.Core
{
    /* Oyun durumu — prototype/js/engine/state.js `defaults()` şemasının birebir C# karşılığı.
       Alan adları JS anahtarlarının PascalCase halidir; anlamlar/varsayılanlar DEĞİŞMEZ.
       (Kalıcılık BU katmanda değil: SaveService ayrı iş paketi — docs/v2/07 §7.) */

    public sealed class Egg
    {
        public string Seri;
        public int Variant;
        public bool? Golden;          // null = altın çekilişi AÇILIŞTA yapılır (dürüstlük §1.3)
        public bool Kulucka;          // Şako'nun kuluçka yumurtası ("hazır!" rozeti)
    }

    public sealed class FoilRecord
    {
        public Dictionary<int, int> Variants = new Dictionary<int, int>();
        public int Golden;
    }

    public sealed class Wish
    {
        public string PufiId;
        public long Ts;
        public string Not;            // "dogumgunu" | null (ebeveyn notu)
        public string Durum;          // "sonra" | null ("şimdi değil" işareti)
    }

    public sealed class Purchase
    {
        public string PaketId;
        public string Ad;
        public double Tutar;
        public int Adet;
        public long Ts;
    }

    public sealed class ParentState
    {
        public string Pin = "1234";   // DEMO varsayılanı
        public double LimitTL;
        public double SpentTL;
        public string Ay = "";        // "YYYY-MM"
        public bool ClubActive;
        public long LimitRaiseTs;
    }

    public sealed class KilerState
    {
        public int Adet;
        public int BugunAcilan;
    }

    public sealed class GorevlerState
    {
        public int Ac;
        public int Oyun;
        public bool AlbumZiyaret;
        public bool BonusVerildi;
    }

    public sealed class StreakState
    {
        public int Yildiz;
        public int Rozet;
    }

    public sealed class KuluckaState
    {
        public string Seri;
    }

    public sealed class GameState
    {
        public int Version = 3;
        public int Stardust = 40;
        public int Kabuk;
        public int Day = 1;
        public int EggsAvailable;             // ZORUNLU senkron: her zaman TodayEggs.Count
        public int ExtraEggsBought;
        public int EggCounter;
        public int PityN;
        public int PityD;
        public int PityE;
        public int CopyStreak;
        public Dictionary<string, int> Owned = new Dictionary<string, int>();
        public List<string> Milestones = new List<string>();
        public int WeekCrafts;
        public int RewardedPlaysToday;
        public List<Egg> TodayEggs = new List<Egg>();
        public bool FirstRitualDoneToday;
        public int Chocolates;
        public int ChocolateStarsToday;
        public int KumbaraToday;
        public string LastChocolateChoice = "ye";
        public Dictionary<string, FoilRecord> FoilBook = new Dictionary<string, FoilRecord>();
        public int GoldenPity;
        public List<string> Tools = new List<string> { "burgu", "cekic", "firlat" };
        public string ActiveTool = "burgu";
        public ParentState Parent = new ParentState();
        public KilerState Kiler = new KilerState();
        public List<Wish> Wishes = new List<Wish>();
        public List<Purchase> Purchases = new List<Purchase>();
        public bool IntroDone;
        public bool IntroGiftShown;
        public string ActiveBiome = "cayir";  // "cayir" | "orman"
        public bool OrmanAcik;
        public string SakoHidden;             // null = saklı parça yok
        public string HedefPufi;              // null = hedef seçilmedi
        public KuluckaState Kulucka;          // null = kuluçka beklemiyor
        public List<string> BugunAcilanlar = new List<string>();
        public GorevlerState Gorevler = new GorevlerState();
        public bool GorevBonusYeni;
        public StreakState Streak = new StreakState();
        public uint Seed = 1;                 // mulberry32 tohumu (Rng.cs)
    }
}
