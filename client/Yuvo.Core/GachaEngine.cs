using System;
using System.Collections.Generic;

namespace Yuvo.Core
{
    /* GachaEngine — prototype/js/engine/gacha.js birebir portu (PORT-CONTRACT.md).
       rand() ÇAĞRI SAYISI VE SIRASI KUTSAL: pickTier weightedPick →
       [zorlaEksik yükseltmede adaylar.Count > 1 ise weightedPick] →
       pickPufi (üç yoldan tam biri) → altın folyo kontrolü.
       rand = Rng.Next(engine.S). save()/refresh() bu katmanda YOK (sözleşme kural 8). */

    public sealed class OpenEggResult
    {
        public string Error;             // "no-egg" | null
        public PufiDef Pufi;
        public string Rarity;
        public bool IsNew;
        public int KabukGained;
        public int CelebrationTier;
        public WrapperInfo Wrapper;
        public int Chocolate;
        public bool OrmanUnlocked;
        public bool GorevBonus;
    }

    public sealed class WrapperInfo
    {
        public string Seri;
        public int Variant;
        public bool Golden;
    }

    public sealed class GachaEngine
    {
        // ---------- SABİTLER (gacha.js satır 7-15) ----------
        private const int SOFT_PITY_E = 35;
        private const double SOFT_ARTIS = 0.06;
        private const int HARD_PITY_E = 50;
        private const int PITY_DESTANSI = 40;   // js:10 — 40 yumurtadır Destansı+ görmediyse
        private const int PITY_NADIR = 15;      // js:11 — 15 yumurtadır Nadir+ görmediyse
        private const int ONBOARDING = 10;      // js:12 — ilk 10 yumurta hep eksik; 3.'sü Nadir+
        private const int KOPYA_SERI_ESIGI = 6; // js:13 — 6 ardışık kopya → kesin eksik
        private const int W_EKSIK = 4;          // js:14
        private const int W_EKSIK_SON3 = 12;    // js:15 — ownedCount >= 27 iken

        // TIERS sırası (js:17) — weightedPick bu sırayla toplar, SIRA DEĞİŞMEZ.
        private static readonly string[] TIERS =
            new string[] { "yaygin", "azbulunur", "nadir", "destansi", "efsanevi", "gizli" };

        private readonly StateEngine _engine;
        private bool _forceGoldenNext; // js:28 — test kancası: sıradaki açılış kesin altın

        public GachaEngine(StateEngine engine)
        {
            _engine = engine;
        }

        // Test kancası (js:233 Yuvo.test.forceGoldenNext)
        public void ForceGoldenNext()
        {
            _forceGoldenNext = true;
        }

        // RANK tablosu (js:18) — sözlük yerine sabit eşleme.
        private static int RankOf(string tier)
        {
            switch (tier)
            {
                case "yaygin": return 0;
                case "azbulunur": return 1;
                case "nadir": return 2;
                case "destansi": return 3;
                case "efsanevi": return 4;
                case "gizli": return 5;
                default: return 0;
            }
        }

        // js:40-51 weightedPick — toplama sırası, x -= w[i] ve kayan-nokta artığı
        // için geriden w>0 taraması BİREBİR (sözleşme kural 4).
        private static T WeightedPick<T>(IList<T> keys, IList<double> weights, double r)
        {
            double total = 0;
            int i;
            for (i = 0; i < keys.Count; i++) total += weights[i];
            double x = r * total;
            for (i = 0; i < keys.Count; i++)
            {
                x -= weights[i];
                if (x < 0) return keys[i];
            }
            // Kayan-nokta artığı: ağırlığı 0 olan anahtar asla dönmesin — geriye tara (js:49)
            for (i = keys.Count - 1; i >= 0; i--) { if (weights[i] > 0) return keys[i]; }
            return keys[keys.Count - 1];
        }

        // js:55-58 activeBiome — alan boşsa 'cayir' (geriye uyumlu falsy karşılığı).
        private string ActiveBiome()
        {
            var s = _engine.S;
            return (s != null && !string.IsNullOrEmpty(s.ActiveBiome)) ? s.ActiveBiome : "cayir";
        }

        // js:60-68 poolOf — Content.Pufis dizi SIRASIYLA, aktif biyom filtresi;
        // biome alanı boşsa 'cayir' sayılır (js:64).
        private List<PufiDef> PoolOf(string tier)
        {
            var outList = new List<PufiDef>();
            var list = _engine.Content.Pufis;
            var b = ActiveBiome();
            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].Rarity != tier) continue;
                var biome = string.IsNullOrEmpty(list[i].Biome) ? "cayir" : list[i].Biome;
                if (biome != b) continue;
                outList.Add(list[i]);
            }
            return outList;
        }

        // JS truthiness: !s.owned[id] → anahtar yok VEYA değer 0.
        private static bool OwnedTruthy(GameState s, string id)
        {
            int v;
            return s.Owned.TryGetValue(id, out v) && v != 0;
        }

        // js:70-74 tierEksikVar
        private bool TierEksikVar(GameState s, string tier)
        {
            var havuz = PoolOf(tier);
            for (int i = 0; i < havuz.Count; i++)
            {
                if (!OwnedTruthy(s, havuz[i].Id)) return true;
            }
            return false;
        }

        // Rarite oranı: JS (RARITIES[t]||{}).oran||0 karşılığı — anahtar yoksa 0.
        private double OranOf(string tier)
        {
            RarityDef rd;
            return (_engine.Content.Rarities.TryGetValue(tier, out rd) && rd != null) ? rd.Oran : 0;
        }

        // Kopya kabuğu: JS (RARITIES[r]||{}).kabuk||0 karşılığı.
        private int KabukOf(string tier)
        {
            RarityDef rd;
            return (_engine.Content.Rarities.TryGetValue(tier, out rd) && rd != null) ? rd.Kabuk : 0;
        }

        // js:21-27 ritualConst — Content.Ritual doluysa onu, yoksa varsayılanları kullan.
        private RitualDef RitualConst()
        {
            return _engine.Content.Ritual ?? new RitualDef();
        }

        // ---------- KADEME SEÇİMİ (js:77-107 pickTier) ----------
        private string PickTier(GameState s, bool gizliHavuzda)
        {
            if (s.PityE >= HARD_PITY_E - 1) return "efsanevi"; // js:78 mutlak tavan — rand YOK

            // js:81-84 — ağırlıklar taban oranlardan kopyalanır
            double wYaygin = OranOf("yaygin");
            double wAzbulunur = OranOf("azbulunur");
            double wNadir = OranOf("nadir");
            double wDestansi = OranOf("destansi");
            double wEfsanevi = OranOf("efsanevi");
            double wGizli = OranOf("gizli");

            if (!gizliHavuzda) { wYaygin += wGizli; wGizli = 0; } // js:85 gizli yalnız 30/30'da

            if (s.PityE >= SOFT_PITY_E - 1)
            {
                // js:87-97 soft pity: normalize aritmetiği JS ile AYNI SIRADA
                wEfsanevi = Math.Min(0.95, OranOf("efsanevi") + SOFT_ARTIS * (s.PityE - SOFT_PITY_E + 2));
                double rest = 1 - wEfsanevi - wGizli;
                double restSum = wYaygin + wAzbulunur + wNadir + wDestansi;
                if (restSum > 0 && rest > 0)
                {
                    double f = rest / restSum;
                    wYaygin *= f; wAzbulunur *= f; wNadir *= f; wDestansi *= f;
                }
                else
                {
                    wYaygin = Math.Max(0, rest); wAzbulunur = 0; wNadir = 0; wDestansi = 0;
                }
            }

            // js:99 — rand tüketim noktası #1
            var tier = WeightedPick(TIERS,
                new double[] { wYaygin, wAzbulunur, wNadir, wDestansi, wEfsanevi, wGizli },
                Rng.Next(s));

            // js:102-103 taban-yükseltme pity'leri
            if (s.PityD >= PITY_DESTANSI - 1 && RankOf(tier) < RankOf("destansi")) tier = "destansi";
            else if (s.PityN >= PITY_NADIR - 1 && RankOf(tier) < RankOf("nadir")) tier = "nadir";
            // js:105 onboarding garantisi: 3. yumurta Nadir+
            if (s.EggCounter == 3 && RankOf(tier) < RankOf("nadir")) tier = "nadir";
            return tier;
        }

        // ---------- PARÇA SEÇİMİ (js:110-125 pickPufi) ----------
        // Üç yoldan TAM BİRİ rand tüketir (sözleşme).
        private PufiDef PickPufi(GameState s, string tier, bool zorlaEksik)
        {
            var havuz = PoolOf(tier);
            var eksik = new List<PufiDef>();
            int i;
            for (i = 0; i < havuz.Count; i++)
            {
                if (!OwnedTruthy(s, havuz[i].Id)) eksik.Add(havuz[i]);
            }

            if ((tier == "efsanevi" || tier == "gizli") && eksik.Count > 0)
            {
                // js:116 E/G hep eksik-öncelikli
                return eksik[(int)Math.Floor(Rng.Next(s) * eksik.Count)];
            }
            if (zorlaEksik && eksik.Count > 0)
            {
                // js:119
                return eksik[(int)Math.Floor(Rng.Next(s) * eksik.Count)];
            }
            // js:121-124 akıllı düşüş
            int wEksik = (_engine.OwnedCount(ActiveBiome()) >= 27) ? W_EKSIK_SON3 : W_EKSIK;
            var weights = new List<double>();
            for (i = 0; i < havuz.Count; i++) weights.Add(OwnedTruthy(s, havuz[i].Id) ? 1 : wEksik);
            return WeightedPick(havuz, weights, Rng.Next(s));
        }

        // ---------- YUMURTA AÇ (js:131-228 openEgg) ----------
        // eggIdx yalnız ambalaj görselini seçer; havuzu/oranı DEĞİŞTİRMEZ.
        public OpenEggResult OpenEgg(int? eggIdx = null)
        {
            var s = _engine.S;
            if (s == null || s.EggsAvailable <= 0) return new OpenEggResult { Error = "no-egg" }; // js:133

            // js:134 savunmacı dizi garantisi
            if (s.TodayEggs == null) s.TodayEggs = new List<Egg>();
            var vitrin = s.TodayEggs;

            int idx = eggIdx.HasValue ? eggIdx.Value : 0; // js:135 undefined/null → 0
            if (idx < 0) return new OpenEggResult { Error = "no-egg" }; // js:136
            if (idx >= vitrin.Count)
            {
                // js:138-143 vitrinde o yumurta yok — hayalet sayaç kendini onarır
                s.EggsAvailable = vitrin.Count;
                return new OpenEggResult { Error = "no-egg" };
            }
            var egg = vitrin[idx]; // js:137 splice(idx, 1)
            vitrin.RemoveAt(idx);

            s.EggsAvailable = vitrin.Count; // js:146 ZORUNLU senkron
            s.EggCounter += 1;              // js:147

            bool zorlaEksik = (s.EggCounter <= ONBOARDING) || (s.CopyStreak >= KOPYA_SERI_ESIGI); // js:149
            bool gizliHavuzda = _engine.OwnedCount(ActiveBiome()) == 30; // js:150 kendi biyomu 30/30

            var tier = PickTier(s, gizliHavuzda); // js:152 — rand #1 (hard pity'de rand yok)

            // js:158-169 kesin-eksik garantisi kademeler ARASI: aynı-veya-üstü ranktan
            // eksikli kademeye yükselt; Gizli hariç, asla düşürme.
            if (zorlaEksik && !TierEksikVar(s, tier))
            {
                var adaylar = new List<string>();
                var aw = new List<double>();
                for (int ti = 0; ti < TIERS.Length; ti++)
                {
                    var t2 = TIERS[ti];
                    if (t2 == "gizli" || RankOf(t2) < RankOf(tier)) continue;
                    if (!TierEksikVar(s, t2)) continue;
                    adaylar.Add(t2); aw.Add(OranOf(t2)); // js:164 (RARITIES[t2]||{}).oran||0
                }
                if (adaylar.Count == 1) tier = adaylar[0];
                else if (adaylar.Count > 1) tier = WeightedPick(adaylar, aw, Rng.Next(s)); // rand (koşullu)
                // adaylar boşsa kopya kaçınılmaz — olduğu gibi bırak (js:168)
            }

            var pufi = PickPufi(s, tier, zorlaEksik); // js:171 — üç yoldan biri rand tüketir
            var rarity = pufi.Rarity;                 // js:172 (= tier)

            bool isNew;
            int kabukGained = 0;
            bool ormanUnlocked = false;
            if (OwnedTruthy(s, pufi.Id))
            {
                // js:175-180 kopya
                isNew = false;
                s.Owned[pufi.Id] += 1;
                kabukGained = KabukOf(rarity);
                s.Kabuk += kabukGained;
                s.CopyStreak += 1;
            }
            else
            {
                // js:181-187 yeni parça
                isNew = true;
                s.Owned[pufi.Id] = 1;
                s.CopyStreak = 0;
                _engine.CheckMilestones();                  // js:185
                ormanUnlocked = _engine.CheckOrmanUnlock(); // js:186
            }

            // js:190-193 sayaçlar — yalnız düşüşle sıfırlanır
            int r = RankOf(rarity);
            s.PityN = (r >= RankOf("nadir")) ? 0 : s.PityN + 1;
            s.PityD = (r >= RankOf("destansi")) ? 0 : s.PityD + 1;
            s.PityE = (r >= RankOf("efsanevi")) ? 0 : s.PityE + 1;

            // ---- Altın Folyo (js:196-204) — çekiliş matematiğinden bağımsız tören katmanı ----
            // KISA DEVRE SIRASI JS İLE AYNI: force || rand()<oran || goldenPity>=hard.
            // _forceGoldenNext FALSE iken her açılışta TAM BİR rand tüketilir.
            var G = RitualConst();
            s.GoldenPity += 1;
            bool golden = false;
            if (_forceGoldenNext || Rng.Next(s) < G.GoldenOran || s.GoldenPity >= G.GoldenHard)
            {
                golden = true;
                s.GoldenPity = 0;
                _forceGoldenNext = false;
            }
            egg.Golden = golden; // js:204

            // js:207-209 folyo Ambalaj Defteri'ne işlenir
            var seri = string.IsNullOrEmpty(egg.Seri) ? "gunesbahcesi" : egg.Seri; // js:207 falsy karşılığı
            int variant = egg.Variant; // js:208 |0 — alan zaten int
            _engine.RegisterFoil(seri, variant, golden);

            // js:212-215 oturum döngüsü: folyo kaydından SONRA, sırayla
            if (s.BugunAcilanlar == null) s.BugunAcilanlar = new List<string>();
            s.BugunAcilanlar.Add(pufi.Id);
            bool gorevBonus = _engine.GorevIlerle("ac"); // js:215

            // js:217-218 save()/refresh() → C# karşılığı YOK (sözleşme kural 8)

            // js:220 kutlama kademesi
            int celebrationTier = (r >= RankOf("efsanevi")) ? 3
                : (rarity == "destansi") ? 2
                : (rarity == "nadir") ? 1 : 0;

            return new OpenEggResult
            {
                Error = null,
                Pufi = pufi,
                Rarity = rarity,
                IsNew = isNew,
                KabukGained = kabukGained,
                CelebrationTier = celebrationTier,
                Wrapper = new WrapperInfo { Seri = seri, Variant = variant, Golden = golden }, // js:223
                Chocolate = 1,               // js:224 her ambalajlı yumurtadan 1 çikolata
                OrmanUnlocked = ormanUnlocked,
                GorevBonus = gorevBonus
            };
        }
    }
}
