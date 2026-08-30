using System;
using System.Collections.Generic;

namespace Yuvo.Core
{
    /* StateEngine — prototype/js/engine/state.js portu (PORT-CONTRACT.md imzaları SABİT).
       load()/save()/migrasyon KAPSAM DIŞI (kalıcılık ayrı katman); commit()/refresh() atlandı
       (sözleşme kural 8). Hata fırlatılmaz: JS savunmacı `return false` desenleri korunur. */

    public sealed class CraftResult { public bool Ok; public string Reason; }
    public sealed class BuyResult { public bool Ok; public string Reason; public int Adet; public double Tutar; }
    public sealed class SetLimitResult { public bool Ok; public bool Soguma; public int SogumaSaat; }
    public sealed class SpendReport { public string Ay; public double SpentTL; public double LimitTL;
        public bool ClubActive; public int PaketAdet; public int Yumurta; public int KilerAdet; public int Pufi; }

    public sealed class StateEngine
    {
        // Sabitler — state.js satır 7-14 (ritual.json "engine" bölümüyle çapraz-doğrulanır)
        private const int EXTRA_EGG_COST = 120;
        private const int EXTRA_EGG_MAX = 2;
        private const int DAILY_EGGS = 3;
        private const int EGG_STACK_MAX = 9;
        private const int STREAK_GOAL = 7;
        private const int STREAK_KABUK = 25;
        private const int GOREV_AC_HEDEF = 3;
        private const int GOREV_OYUN_HEDEF = 1;
        private static readonly string[] FREE_TOOLS = { "burgu", "cekic", "firlat" };

        // Kilometre taşları — state.js satır 18-23
        private struct Milestone { public int At; public string Key; public int Kabuk; }
        private static readonly Milestone[] MILESTONES =
        {
            new Milestone { At = 10, Key = "m10", Kabuk = 15 },
            new Milestone { At = 20, Key = "m20", Kabuk = 30 },
            new Milestone { At = 27, Key = "m27", Kabuk = 60 },
            new Milestone { At = 30, Key = "m30", Kabuk = 100 }
        };

        public GameState S;                    // aktif durum (Reset kurar)
        public readonly GameContent Content;
        public Func<double> UnseededRandom;    // JS Math.random karşılığı (sözleşme kural 6)
        public Func<long> NowMs;               // JS Date.now karşılığı (ms)
        public Func<string> MonthKeyFn;        // "YYYY-MM" — state.js monthKey() satır 157-162

        public StateEngine(GameContent content, Func<double> unseededRandom = null,
                           Func<long> nowMs = null, Func<string> monthKeyFn = null)
        {
            Content = content;
            if (unseededRandom != null) UnseededRandom = unseededRandom;
            else
            {
                var rnd = new Random();
                UnseededRandom = () => rnd.NextDouble();
            }
            NowMs = nowMs ?? (() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
            // JS monthKey(): yerel tarih "YYYY-MM" (state.js satır 157-162)
            MonthKeyFn = monthKeyFn ?? (() =>
            {
                var d = DateTime.Now;
                return d.Year + "-" + d.Month.ToString("00");
            });
            Reset(null);
        }

        /* ---------- yardımcılar ---------- */

        // round2 — state.js satır 164; JS Math.round = floor(x+0.5) (sözleşme kural 3).
        // JS'teki `Number(n) || 0` koruması: NaN/±Inf 0'a iner (parite denetimi bulgusu —
        // aksi hâlde SetLimit(NaN) limit kapısını ters yönde etkisizleştirirdi).
        private static double Round2(double n)
        {
            if (double.IsNaN(n) || double.IsInfinity(n)) return 0;
            return Math.Floor(n * 100 + 0.5) / 100;
        }

        // freshSeed — state.js satır 25-27; bit hassasiyeti gerekmez (tohumsuz yol)
        private uint FreshSeed()
        {
            unchecked
            {
                uint v = (uint)((int)NowMs() ^ (int)(long)(UnseededRandom() * 4294967295.0));
                return v != 0 ? v : 1u;
            }
        }

        // seriesKeys — state.js satır 40-44 (boşsa güvenli varsayılan)
        private List<string> SeriesKeysSafe()
        {
            var keys = (Content != null) ? Content.SeriesKeys : null;
            if (keys == null || keys.Count == 0) return new List<string> { "gunesbahcesi" };
            return keys;
        }

        // variantCount — state.js satır 46-49
        private int VariantCount()
        {
            var n = (Content != null) ? Content.WrapperVariants : 0;
            return n > 0 ? n : 8;
        }

        // daySeries — state.js satır 58-61
        public string DaySeries(int day)
        {
            var keys = SeriesKeysSafe();
            // JS: keys[Math.max(0, ((day || 1) - 1)) % keys.length] — day<=0 için de aynı sonucu verir
            return keys[Math.Max(0, day - 1) % keys.Count];
        }

        // activeSeries — state.js satır 53-56
        public string ActiveSeries()
        {
            return DaySeries(S != null ? S.Day : 1);
        }

        // yarinSeri — state.js satır 538-540
        public string YarinSeri()
        {
            return DaySeries(S.Day + 1);
        }

        // makeEgg — state.js satır 65-68: golden:null → altın çekilişi AÇILIŞTA (dürüstlük §1.3)
        public Egg MakeEgg(int day, string seri = null)
        {
            if (string.IsNullOrEmpty(seri) || SeriesKeysSafe().IndexOf(seri) == -1) seri = DaySeries(day);
            return new Egg
            {
                Seri = seri,
                Variant = (int)Math.Floor(UnseededRandom() * VariantCount()),
                Golden = null
            };
        }

        // fillTodayEggs — state.js satır 71-75: eggsAvailable = todayEggs.length garantisi
        private void FillTodayEggs(GameState s, int count)
        {
            s.TodayEggs = new List<Egg>();
            for (var i = 0; i < count; i++) s.TodayEggs.Add(MakeEgg(s.Day));
            s.EggsAvailable = s.TodayEggs.Count;
        }

        // defaults — state.js satır 77-126 (alan varsayılanları GameState.cs'te; burada
        // yalnız delegelere bağlı olanlar doldurulur)
        private GameState Defaults()
        {
            var s = new GameState();
            s.EggsAvailable = DAILY_EGGS;
            s.Tools = new List<string>(FREE_TOOLS);
            s.Parent.LimitTL = Content.StoreLimits.VarsayilanAylik;
            s.Parent.Ay = MonthKeyFn();
            s.Seed = FreshSeed();
            FillTodayEggs(s, DAILY_EGGS);
            return s;
        }

        // syncMonth — state.js satır 166-169: ay döndüyse harcama sayacı sıfırlanır
        public void SyncMonth()
        {
            var mk = MonthKeyFn();
            if (S.Parent.Ay != mk) { S.Parent.Ay = mk; S.Parent.SpentTL = 0; }
        }

        /* ---------- API ---------- */

        // reset — state.js satır 285-291
        public GameState Reset(uint? seed = null)
        {
            var s = Defaults();
            if (seed.HasValue) s.Seed = seed.Value != 0 ? seed.Value : 1u;  // JS: (seed>>>0)||1
            S = s;
            return s;
        }

        // newDay — state.js satır 293-348 (SIRA BİREBİR)
        public void NewDay()
        {
            var s = S;
            // Bekçi Takvimi: dün en az 1 yumurta açıldıysa 1 yıldız — CEZASIZ (satır 297-304)
            if (s.Gorevler != null && s.Gorevler.Ac > 0)
            {
                s.Streak.Yildiz += 1;
                if (s.Streak.Yildiz >= STREAK_GOAL)
                {
                    s.Streak.Yildiz = 0;
                    s.Streak.Rozet += 1;
                    s.Kabuk += STREAK_KABUK;
                }
            }
            s.Day += 1;
            // Haklar BİRİKİR: kalan (tavan 9) + en çok 3 yeni (satır 307-310)
            var kalan = new List<Egg>();
            if (s.TodayEggs != null)
                for (var i = 0; i < s.TodayEggs.Count && i < EGG_STACK_MAX; i++) kalan.Add(s.TodayEggs[i]);
            var eklenecek = Math.Min(DAILY_EGGS, Math.Max(0, EGG_STACK_MAX - kalan.Count));
            for (var ne = 0; ne < eklenecek; ne++) kalan.Add(MakeEgg(s.Day));
            s.TodayEggs = kalan;
            if (s.Parent.ClubActive)                 // Club: günlük bonus, tavanı AŞMAZ (satır 311-316)
            {
                var cAdet = Content.Club.GunlukYumurta;
                for (var ci = 0; ci < cAdet; ci++)
                {
                    if (s.TodayEggs.Count < EGG_STACK_MAX) s.TodayEggs.Add(MakeEgg(s.Day));
                }
            }
            // Kuluçka: İLK sıraya düşer, tavana SAYILMAZ (satır 319-324)
            if (s.Kulucka != null)
            {
                var kEgg = MakeEgg(s.Day, s.Kulucka.Seri);
                kEgg.Kulucka = true;
                s.TodayEggs.Insert(0, kEgg);
                s.Kulucka = null;
            }
            s.EggsAvailable = s.TodayEggs.Count;     // ZORUNLU senkron (satır 325)
            s.ExtraEggsBought = 0;
            s.RewardedPlaysToday = 0;
            s.FirstRitualDoneToday = false;
            s.ChocolateStarsToday = 0;
            s.KumbaraToday = 0;
            s.Kiler.BugunAcilan = 0;
            s.Gorevler = new GorevlerState();
            s.GorevBonusYeni = false;
            s.BugunAcilanlar = new List<string>();
            SyncMonth();                             // ay döndüyse harcama sıfırlanır (satır 335)
            // Şako: >=2 sahipli (gizli olmayan) orman parçası varsa birini saklar (satır 337-345)
            if (s.OrmanAcik && s.SakoHidden == null)
            {
                var ormanIds = new List<string>();
                foreach (var kv in s.Owned)
                {
                    if (kv.Value == 0) continue;
                    var op = Content.PufiById(kv.Key);
                    if (op != null && op.Biome == "orman" && op.Rarity != "gizli") ormanIds.Add(kv.Key);
                }
                if (ormanIds.Count >= 2)
                    s.SakoHidden = ormanIds[(int)Math.Floor(UnseededRandom() * ormanIds.Count)];
            }
            if ((s.Day - 1) % 7 == 0) s.WeekCrafts = 0;  // yeni hafta → Atölye tazelenir (satır 346)
        }

        // addStardust — state.js satır 350-354
        public void AddStardust(int n)
        {
            S.Stardust = Math.Max(0, S.Stardust + n);
        }

        // spendStardust — state.js satır 356-363
        public bool SpendStardust(int n)
        {
            if (n < 0 || S.Stardust < n) return false;
            S.Stardust -= n;
            return true;
        }

        // buyExtraEgg — state.js satır 365-375: 120⭐, günde en çok 2
        public bool BuyExtraEgg()
        {
            var s = S;
            if (s.ExtraEggsBought >= EXTRA_EGG_MAX) return false;
            if (s.Stardust < EXTRA_EGG_COST) return false;
            s.Stardust -= EXTRA_EGG_COST;
            s.ExtraEggsBought += 1;
            s.TodayEggs.Add(MakeEgg(s.Day));
            s.EggsAvailable += 1;                   // todayEggs ile birlikte artar (senkron)
            return true;
        }

        // grantEgg — state.js satır 379-386
        public Egg GrantEgg(string seri = null)
        {
            var s = S;
            var egg = MakeEgg(s.Day, seri);
            s.TodayEggs.Add(egg);
            s.EggsAvailable += 1;
            return egg;
        }

        // eatChocolate — state.js satır 390-398: +2⭐, günlük tavan 40; dönen = kazanılan ⭐
        public int EatChocolate()
        {
            var s = S; var r = Content.Ritual;
            var gain = Math.Max(0, Math.Min(r.IsirikYildiz, r.CikolataYildizTavan - s.ChocolateStarsToday));
            s.ChocolateStarsToday += gain;
            s.Stardust += gain;
            s.LastChocolateChoice = "ye";
            return gain;
        }

        // bankChocolate — state.js satır 401-407: dönen = yeni kumbara sayısı
        public int BankChocolate()
        {
            var s = S;
            s.Chocolates += 1;
            s.LastChocolateChoice = "biriktir";
            return s.Chocolates;
        }

        // redeemChocolates — state.js satır 410-418: eşik 15, günde 1 → bonus yumurta
        public bool RedeemChocolates()
        {
            var s = S; var r = Content.Ritual;
            if (s.Chocolates < r.KumbaraEsik) return false;
            if (s.KumbaraToday >= r.KumbaraGunluk) return false;
            s.Chocolates -= r.KumbaraEsik;
            s.KumbaraToday += 1;
            GrantEgg();
            return true;
        }

        // registerFoil — state.js satır 423-432: defter saf kozmetik, oran/pity'ye etkisiz
        public FoilRecord RegisterFoil(string seri, int variant, bool golden)
        {
            var s = S;
            if (s.FoilBook == null) s.FoilBook = new Dictionary<string, FoilRecord>();
            FoilRecord rec;
            if (!s.FoilBook.TryGetValue(seri, out rec) || rec == null)
            {
                rec = new FoilRecord();
                s.FoilBook[seri] = rec;
            }
            if (rec.Variants == null) rec.Variants = new Dictionary<int, int>();
            if (golden) rec.Golden += 1;
            else
            {
                int cur;
                rec.Variants.TryGetValue(variant, out cur);
                rec.Variants[variant] = cur + 1;
            }
            return rec;
        }

        // setTool — state.js satır 435-441: yalnız sahip olunan araç aktifleşir
        public bool SetTool(string id)
        {
            var s = S;
            if (s.Tools == null || s.Tools.IndexOf(id) == -1) return false;
            s.ActiveTool = id;
            return true;
        }

        // ownedCount — state.js satır 446-456: gizli HARİÇ; biome verilirse filtre.
        // Dikkat: içerikte bulunmayan id JS'te de sayılır (p null → filtreler atlanır).
        public int OwnedCount(string biome = null)
        {
            var s = S; var n = 0;
            foreach (var kv in s.Owned)
            {
                if (kv.Value == 0) continue;
                var p = Content.PufiById(kv.Key);
                if (p != null && p.Rarity == "gizli") continue;
                if (biome != null && p != null && (p.Biome ?? "cayir") != biome) continue;
                n += 1;
            }
            return n;
        }

        // checkMilestones — state.js satır 460-473: çayır sayacına bağlı, bir kez
        public List<string> CheckMilestones()
        {
            var s = S;
            var count = OwnedCount("cayir");
            var granted = new List<string>();
            for (var i = 0; i < MILESTONES.Length; i++)
            {
                var m = MILESTONES[i];
                if (count >= m.At && s.Milestones.IndexOf(m.Key) == -1)
                {
                    s.Milestones.Add(m.Key);
                    s.Kabuk += m.Kabuk;
                    granted.Add(m.Key);
                }
            }
            return granted;
        }

        // craft — state.js satır 476-492: gizli için kendi biyomunda 30/30 şartı
        public CraftResult Craft(string pufiId)
        {
            var s = S;
            var pufi = Content.PufiById(pufiId);
            if (pufi == null) return new CraftResult { Ok = false, Reason = "bilinmiyor" };
            int sahip;
            if (s.Owned.TryGetValue(pufiId, out sahip) && sahip != 0)
                return new CraftResult { Ok = false, Reason = "sahipli" };
            if (pufi.Rarity == "gizli" && OwnedCount(pufi.Biome ?? "cayir") != 30)
                return new CraftResult { Ok = false, Reason = "gizli-kilitli" };
            // JS `(RARITIES[pufi.rarity] || {}).uretim || 0` — rarity null/bilinmezse maliyet 0,
            // asla fırlatmaz (parite denetimi bulgusu: TryGetValue(null) fırlatırdı)
            RarityDef rd = null;
            var cost = (pufi.Rarity != null &&
                        Content.Rarities.TryGetValue(pufi.Rarity, out rd) && rd != null) ? rd.Uretim : 0;
            if (s.Kabuk < cost) return new CraftResult { Ok = false, Reason = "kabuk-yetersiz" };
            s.Kabuk -= cost;
            s.Owned[pufiId] = 1;
            s.WeekCrafts += 1;
            CheckMilestones();
            return new CraftResult { Ok = true };
        }

        // setBiome — state.js satır 552-559: orman yalnız kilidi açıksa seçilebilir
        public bool SetBiome(string b)
        {
            var s = S;
            if (b != "cayir" && !(b == "orman" && s.OrmanAcik)) return false;
            if (s.ActiveBiome == b) return true;
            s.ActiveBiome = b;
            return true;
        }

        // checkOrmanUnlock — state.js satır 563-567: çayır 10/30 → BİR KEZ true
        public bool CheckOrmanUnlock()
        {
            var s = S;
            if (s.OrmanAcik) return false;
            if (OwnedCount("cayir") >= 10) { s.OrmanAcik = true; return true; }
            return false;
        }

        // sakoRecover — state.js satır 572-578: saklanan parça geri döner
        public bool SakoRecover()
        {
            var s = S;
            if (s.SakoHidden == null) return false;
            s.SakoHidden = null;
            return true;
        }

        // gorevIlerle — state.js satır 501-519: üçlü tamamlanınca BİR KEZ bonus + true
        public bool GorevIlerle(string tip)
        {
            var s = S;
            var g = s.Gorevler;
            if (g == null) g = s.Gorevler = new GorevlerState();
            if (tip == "ac") g.Ac += 1;
            else if (tip == "oyun") g.Oyun += 1;
            else if (tip == "album") g.AlbumZiyaret = true;
            else return false;
            if (!g.BonusVerildi && g.Ac >= GOREV_AC_HEDEF &&
                g.Oyun >= GOREV_OYUN_HEDEF && g.AlbumZiyaret)
            {
                g.BonusVerildi = true;
                s.GorevBonusYeni = true;             // yuva bir kez kutlar
                GrantEgg();
                return true;
            }
            return false;
        }

        // gorevHedef — state.js satır 522-524
        public (int Ac, int Oyun) GorevHedef()
        {
            return (GOREV_AC_HEDEF, GOREV_OYUN_HEDEF);
        }

        // kuluckaBirak — state.js satır 528-535: seri verilmezse YARININ serisi
        public bool KuluckaBirak(string seri = null)
        {
            var s = S;
            if (s.Kulucka != null) return false;    // zaten bekleyen kuluçka var
            if (string.IsNullOrEmpty(seri) || SeriesKeysSafe().IndexOf(seri) == -1)
                seri = DaySeries(s.Day + 1);
            s.Kulucka = new KuluckaState { Seri = seri };
            return true;
        }

        // streakInfo — state.js satır 543-545
        public (int Hedef, int Kabuk) StreakInfo()
        {
            return (STREAK_GOAL, STREAK_KABUK);
        }

        // addWish — state.js satır 587-600: 7 gün budama (NowMs), kopyasız, tavan 5.
        // Budama eski Wish nesnelerini korur → Not/Durum alanları KAYBOLMAZ.
        public bool AddWish(string pufiId)
        {
            var s = S;
            const long hafta = 7L * 24 * 3600 * 1000;
            var now = NowMs();
            if (string.IsNullOrEmpty(pufiId)) return false;
            var taze = new List<Wish>();
            for (var i = 0; i < s.Wishes.Count; i++)
            {
                if (now - s.Wishes[i].Ts < hafta) taze.Add(s.Wishes[i]);
            }
            s.Wishes = taze;
            for (var i = 0; i < s.Wishes.Count; i++)
                if (s.Wishes[i].PufiId == pufiId) return false;
            if (s.Wishes.Count >= 5) return false;
            s.Wishes.Add(new Wish { PufiId = pufiId, Ts = now });
            return true;
        }

        // clearWish — state.js satır 602-609
        public bool ClearWish(string pufiId)
        {
            var s = S;
            var kaldi = new List<Wish>();
            for (var i = 0; i < s.Wishes.Count; i++)
                if (s.Wishes[i].PufiId != pufiId) kaldi.Add(s.Wishes[i]);
            var degisti = kaldi.Count != s.Wishes.Count;
            s.Wishes = kaldi;
            return degisti;
        }

        // buyPack — state.js satır 613-632: limit → Kiler'e ekle → kayıt; Club bonusu Ceiling
        public BuyResult BuyPack(string paketId)
        {
            var s = S;
            var p = Content.PackById(paketId);
            if (p == null) return new BuyResult { Ok = false, Reason = "bilinmiyor" };
            SyncMonth();
            var tutar = Round2(p.Tl);
            if (Round2(s.Parent.SpentTL + tutar) > s.Parent.LimitTL + 1e-9)
                return new BuyResult { Ok = false, Reason = "limit" };
            var adet = p.Adet;
            if (s.Parent.ClubActive)
            {
                var c = Content.Club;
                adet += (int)Math.Ceiling(adet * (c.BonusYuzde / 100.0));  // eksik teslim yok (10→11)
            }
            s.Parent.SpentTL = Round2(s.Parent.SpentTL + tutar);
            s.Kiler.Adet += adet;
            s.Purchases.Add(new Purchase { PaketId = p.Id, Ad = p.Ad, Tutar = tutar, Adet = adet, Ts = NowMs() });
            return new BuyResult { Ok = true, Adet = adet, Tutar = tutar };
        }

        // drawFromKiler — state.js satır 635-646: tavan = kilerGunluk (+kilerEk Club'da)
        public bool DrawFromKiler()
        {
            var s = S;
            if (s.Kiler.Adet <= 0) return false;
            var tavan = Content.StoreLimits.KilerGunluk + (s.Parent.ClubActive ? Content.Club.KilerEk : 0);
            if (s.Kiler.BugunAcilan >= tavan) return false;
            s.Kiler.Adet -= 1;
            s.Kiler.BugunAcilan += 1;
            s.TodayEggs.Add(MakeEgg(s.Day));
            s.EggsAvailable = s.TodayEggs.Count;
            return true;
        }

        // setLimit — state.js satır 648-657: soğuma yalnız ARTIRIMDA
        public SetLimitResult SetLimit(double tl)
        {
            var s = S;
            tl = Math.Max(0, Round2(tl));
            var eski = s.Parent.LimitTL;
            s.Parent.LimitTL = tl;
            var soguma = tl > eski;
            if (soguma) s.Parent.LimitRaiseTs = NowMs();
            return new SetLimitResult { Ok = true, Soguma = soguma, SogumaSaat = Content.StoreLimits.SogumaSaat };
        }

        // setPin — state.js satır 659-665: ^\d{4}$ (yalnız ASCII rakam — JS \d ile aynı)
        public bool SetPin(string p)
        {
            if (p == null || p.Length != 4) return false;
            for (var i = 0; i < 4; i++)
                if (p[i] < '0' || p[i] > '9') return false;
            S.Parent.Pin = p;
            return true;
        }

        // toggleClub — state.js satır 667-672
        public bool ToggleClub()
        {
            var s = S;
            s.Parent.ClubActive = !s.Parent.ClubActive;
            return s.Parent.ClubActive;
        }

        // spendReport — state.js satır 675-694 (sözleşme tipi paket dökümü listesi içermez;
        // toplamlar JS ile aynı hesaplanır)
        public SpendReport BuildSpendReport()
        {
            var s = S;
            SyncMonth();
            var toplamYumurta = 0;
            for (var i = 0; i < s.Purchases.Count; i++) toplamYumurta += s.Purchases[i].Adet;
            var pufiSayisi = 0;
            foreach (var kv in s.Owned) if (kv.Value != 0) pufiSayisi += 1;
            return new SpendReport
            {
                Ay = s.Parent.Ay,
                SpentTL = s.Parent.SpentTL,
                LimitTL = s.Parent.LimitTL,
                ClubActive = s.Parent.ClubActive,
                PaketAdet = s.Purchases.Count,
                Yumurta = toplamYumurta,
                KilerAdet = s.Kiler.Adet,
                Pufi = pufiSayisi
            };
        }
    }
}
