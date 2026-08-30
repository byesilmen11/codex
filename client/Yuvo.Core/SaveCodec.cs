using System;
using System.Collections.Generic;
using System.Globalization;

namespace Yuvo.Core
{
    /* SaveCodec — kalıcılık köprüsü (PORT-CONTRACT.md EK bölümü, BAĞLAYICI).
       (a) ToSave/ToJson: GameState → SaveValue/JSON — state.js defaults() (satır 77-126)
           anahtar ADLARI ve SIRASI birebir (JS JSON.stringify bu sırayla yazar).
       (b) Load: state.js load() (satır 173-277) birebir portu (SaveMigrator).
           Rastgelelik tüketimi kutsal: Reset(null) = 1 freshSeed + 3 variant;
           seed onarımı (satır 192) gerekirse +1; v1 yolu fillTodayEggs → n × MakeEgg.
       Core kuralı: dosya G/Ç'si ve dış JSON bağımlılığı YOK — yalnız SaveValue/JsonCodec. */

    public static class SaveCodec
    {
        // state.js satır 15 — FREE_TOOLS (StateEngine'de private; sözleşme gereği yerelde tekrarlanır)
        private static readonly string[] FREE_TOOLS = { "burgu", "cekic", "firlat" };

        /* =====================================================================
           (a) GameState → SaveValue / JSON
           ===================================================================== */

        // state.js defaults() (satır 77-126) anahtar sırasıyla nesne üretir.
        public static SaveValue ToSave(GameState s)
        {
            var o = SaveValue.NewObj();
            o.Set("version", Num(s.Version));
            o.Set("stardust", Num(s.Stardust));
            o.Set("kabuk", Num(s.Kabuk));
            o.Set("day", Num(s.Day));
            o.Set("eggsAvailable", Num(s.EggsAvailable));
            o.Set("extraEggsBought", Num(s.ExtraEggsBought));
            o.Set("eggCounter", Num(s.EggCounter));
            o.Set("pityN", Num(s.PityN));
            o.Set("pityD", Num(s.PityD));
            o.Set("pityE", Num(s.PityE));
            o.Set("copyStreak", Num(s.CopyStreak));

            var owned = SaveValue.NewObj();               // pufiId -> adet (satır 83)
            if (s.Owned != null)
                foreach (var kv in s.Owned) owned.Set(kv.Key, Num(kv.Value));
            o.Set("owned", owned);

            var ms = SaveValue.NewArr();                  // satır 84
            if (s.Milestones != null)
                foreach (var m in s.Milestones) ms.Items.Add(Str(m));
            o.Set("milestones", ms);

            o.Set("weekCrafts", Num(s.WeekCrafts));
            o.Set("rewardedPlaysToday", Num(s.RewardedPlaysToday));

            var eggs = SaveValue.NewArr();                // satır 87 — [{seri,variant,golden}]
            if (s.TodayEggs != null)
                foreach (var e in s.TodayEggs) eggs.Items.Add(EggToSave(e));
            o.Set("todayEggs", eggs);

            o.Set("firstRitualDoneToday", SaveValue.Of(s.FirstRitualDoneToday));
            o.Set("chocolates", Num(s.Chocolates));
            o.Set("chocolateStarsToday", Num(s.ChocolateStarsToday));
            o.Set("kumbaraToday", Num(s.KumbaraToday));
            o.Set("lastChocolateChoice", Str(s.LastChocolateChoice));

            // satır 93: seriId -> { variants:{ "0":n, ... }, golden:n } — variant anahtarları STRING
            var fb = SaveValue.NewObj();
            if (s.FoilBook != null)
            {
                foreach (var kv in s.FoilBook)
                {
                    var rec = SaveValue.NewObj();
                    var vs = SaveValue.NewObj();
                    if (kv.Value != null && kv.Value.Variants != null)
                        foreach (var v in kv.Value.Variants)
                            vs.Set(v.Key.ToString(CultureInfo.InvariantCulture), Num(v.Value));
                    rec.Set("variants", vs);
                    rec.Set("golden", Num(kv.Value != null ? kv.Value.Golden : 0));
                    fb.Set(kv.Key, rec);
                }
            }
            o.Set("foilBook", fb);

            o.Set("goldenPity", Num(s.GoldenPity));

            var tools = SaveValue.NewArr();               // satır 95
            if (s.Tools != null)
                foreach (var t in s.Tools) tools.Items.Add(Str(t));
            o.Set("tools", tools);
            o.Set("activeTool", Str(s.ActiveTool));

            // satır 98-105: parent { pin, limitTL, spentTL, ay, clubActive, limitRaiseTs }
            var pSrc = s.Parent != null ? s.Parent : new ParentState();
            var parent = SaveValue.NewObj();
            parent.Set("pin", Str(pSrc.Pin));
            parent.Set("limitTL", Num(pSrc.LimitTL));
            parent.Set("spentTL", Num(pSrc.SpentTL));
            parent.Set("ay", Str(pSrc.Ay));
            parent.Set("clubActive", SaveValue.Of(pSrc.ClubActive));
            parent.Set("limitRaiseTs", Num(pSrc.LimitRaiseTs));
            o.Set("parent", parent);

            var kSrc = s.Kiler != null ? s.Kiler : new KilerState();
            var kiler = SaveValue.NewObj();               // satır 106
            kiler.Set("adet", Num(kSrc.Adet));
            kiler.Set("bugunAcilan", Num(kSrc.BugunAcilan));
            o.Set("kiler", kiler);

            // satır 107: [{pufiId, ts}] + not/durum yalnız DOLUYKEN (load satır 245-246 bunları korur)
            var wishes = SaveValue.NewArr();
            if (s.Wishes != null)
            {
                foreach (var w in s.Wishes)
                {
                    var wo = SaveValue.NewObj();
                    wo.Set("pufiId", Str(w != null ? w.PufiId : null));
                    wo.Set("ts", Num(w != null ? w.Ts : 0));
                    if (w != null && w.Not != null) wo.Set("not", Str(w.Not));
                    if (w != null && w.Durum != null) wo.Set("durum", Str(w.Durum));
                    wishes.Items.Add(wo);
                }
            }
            o.Set("wishes", wishes);

            // satır 108: [{paketId, ad, tutar, adet, ts}] — null string'ler JSON null olarak yazılır
            var purchases = SaveValue.NewArr();
            if (s.Purchases != null)
            {
                foreach (var pr in s.Purchases)
                {
                    var po = SaveValue.NewObj();
                    po.Set("paketId", Str(pr != null ? pr.PaketId : null));
                    po.Set("ad", Str(pr != null ? pr.Ad : null));
                    po.Set("tutar", Num(pr != null ? pr.Tutar : 0));
                    po.Set("adet", Num(pr != null ? pr.Adet : 0));
                    po.Set("ts", Num(pr != null ? pr.Ts : 0));
                    purchases.Items.Add(po);
                }
            }
            o.Set("purchases", purchases);

            o.Set("introDone", SaveValue.Of(s.IntroDone));
            o.Set("introGiftShown", SaveValue.Of(s.IntroGiftShown));
            o.Set("activeBiome", Str(s.ActiveBiome));
            o.Set("ormanAcik", SaveValue.Of(s.OrmanAcik));
            o.Set("sakoHidden", Str(s.SakoHidden));       // null → JSON null (satır 114)
            o.Set("hedefPufi", Str(s.HedefPufi));         // null → JSON null (satır 115)

            if (s.Kulucka != null)                        // satır 117: {seri} | null
            {
                var ku = SaveValue.NewObj();
                ku.Set("seri", Str(s.Kulucka.Seri));
                o.Set("kulucka", ku);
            }
            else o.Set("kulucka", SaveValue.Nil());

            var ba = SaveValue.NewArr();                  // satır 118
            if (s.BugunAcilanlar != null)
                foreach (var id in s.BugunAcilanlar) ba.Items.Add(Str(id));
            o.Set("bugunAcilanlar", ba);

            var gSrc = s.Gorevler != null ? s.Gorevler : new GorevlerState();
            var gorevler = SaveValue.NewObj();            // satır 119
            gorevler.Set("ac", Num(gSrc.Ac));
            gorevler.Set("oyun", Num(gSrc.Oyun));
            gorevler.Set("albumZiyaret", SaveValue.Of(gSrc.AlbumZiyaret));
            gorevler.Set("bonusVerildi", SaveValue.Of(gSrc.BonusVerildi));
            o.Set("gorevler", gorevler);

            o.Set("gorevBonusYeni", SaveValue.Of(s.GorevBonusYeni));

            var stSrc = s.Streak != null ? s.Streak : new StreakState();
            var streak = SaveValue.NewObj();              // satır 121
            streak.Set("yildiz", Num(stSrc.Yildiz));
            streak.Set("rozet", Num(stSrc.Rozet));
            o.Set("streak", streak);

            o.Set("seed", Num(s.Seed));                   // satır 122 — uint DEĞERİ sayı olarak
            return o;
        }

        public static string ToJson(GameState s)
        {
            return JsonCodec.Write(ToSave(s));
        }

        // Yumurta şekli (satır 87 + newDay satır 322): {seri, variant, golden} — kulucka
        // alanı YALNIZ true iken yazılır (load satır 208: kulucka!==true → alan silinir).
        private static SaveValue EggToSave(Egg e)
        {
            var o = SaveValue.NewObj();
            o.Set("seri", Str(e != null ? e.Seri : null));
            o.Set("variant", Num(e != null ? e.Variant : 0));
            o.Set("golden", (e != null && e.Golden.HasValue) ? SaveValue.Of(e.Golden.Value) : SaveValue.Nil());
            if (e != null && e.Kulucka) o.Set("kulucka", SaveValue.Of(true));
            return o;
        }

        /* =====================================================================
           (b) SaveValue → GameState — state.js load() (satır 173-277) birebir
           ===================================================================== */

        public static GameState Load(StateEngine eng, SaveValue saved)
        {
            // 1) base = defaults() — JS satır 174. Reset(null) aynı rastgelelik tüketimini
            //    yapar: 1 freshSeed + 3 variant (sözleşme EK madde 1). b == eng.S.
            var b = eng.Reset(null);
            var content = eng.Content;
            var seriesKeys = SeriesKeysSafe(content);
            var variantCount = VariantCountSafe(content);

            // 2) savedHadEggs — JS satır 181 (yalnız geçerli obj kayıtta bakılır)
            var validObj = saved != null && saved.IsObj;
            var src = validObj ? saved : null;            // geçersiz/bozuk kayıt → temiz başlangıç (satır 189)
            SaveValue teSv = null;
            var savedHadEggs = false;
            if (validObj)
            {
                teSv = saved.Get("todayEggs");
                savedHadEggs = teSv != null && teSv.IsArr;
            }

            // 3) bilinen-anahtar birleştirme (JS satır 182-186: hasOwnProperty && !== null/undefined
            //    → saved değeri KOMPLE alınır) + 4) tip onarımları (satır 190-273).
            //    C# alanları tipli olduğundan birleştirme ve onarım alan bazında kaynaştırıldı;
            //    gözlemlenen sonuç ve rastgelelik SIRASI (seed onarımı → fillTodayEggs) JS ile birebir.

            // Onarımsız skaler alanlar: JS ham değeri taşır; C#'ta Num → ToInt32, diğer türler
            // temsil edilemez → varsayılan kalır (fikstürler sayısal değer kullanır — karar notu).
            MergeInt(src, "stardust", ref b.Stardust);
            MergeInt(src, "kabuk", ref b.Kabuk);
            MergeInt(src, "day", ref b.Day);
            MergeInt(src, "extraEggsBought", ref b.ExtraEggsBought);
            MergeInt(src, "eggCounter", ref b.EggCounter);
            MergeInt(src, "pityN", ref b.PityN);
            MergeInt(src, "pityD", ref b.PityD);
            MergeInt(src, "pityE", ref b.PityE);
            MergeInt(src, "copyStreak", ref b.CopyStreak);
            MergeInt(src, "weekCrafts", ref b.WeekCrafts);
            MergeInt(src, "rewardedPlaysToday", ref b.RewardedPlaysToday);
            MergeBool(src, "introDone", ref b.IntroDone);           // onarımsız bool'lar (satır 110-113)
            MergeBool(src, "introGiftShown", ref b.IntroGiftShown);
            MergeBool(src, "ormanAcik", ref b.OrmanAcik);
            MergeStr(src, "activeBiome", ref b.ActiveBiome);
            MergeStr(src, "sakoHidden", ref b.SakoHidden);          // JSON null merge'de atlanır → null kalır
            MergeStr(src, "hedefPufi", ref b.HedefPufi);

            // owned — JS satır 190: obj değilse {} (değerler: Num → |0 benzeri; JS ham tutar,
            // ownedCount truthiness okur → truthy diğer türler 1 sayılır — karar notu)
            var ownedSv = Pick(src, "owned");
            if (ownedSv != null)
            {
                b.Owned = new Dictionary<string, int>();
                if (ownedSv.IsObj && ownedSv.Props != null)
                    foreach (var kv in ownedSv.Props)
                        b.Owned[kv.Key] = OwnedVal(kv.Value);
            }

            // milestones — JS satır 191: Arr değilse [] (string olmayan öğe atlanır — karar notu)
            var msSv = Pick(src, "milestones");
            if (msSv != null)
            {
                b.Milestones = new List<string>();
                if (msSv.IsArr && msSv.Items != null)
                    foreach (var it in msSv.Items)
                        if (it != null && it.IsStr) b.Milestones.Add(it.S);
            }

            // seed — JS satır 192: `if (!base.seed) base.seed = freshSeed()` → 1 RANDOM DAHA.
            // Truthiness HAM saved değeri üzerinden (0/NaN/false → falsy). Num → uint (JS ToUint32);
            // truthy ama sayı olmayan değer C# uint'te temsil edilemez → Reset tohumunu korur,
            // EK random tüketilmez (JS de tüketmez — karar notu; fikstürler hep sayısal seed verir).
            var seedSv = Pick(src, "seed");
            var seedTruthy = seedSv == null || seedSv.Truthy();   // yoksa defaults freshSeed ≥ 1 → truthy
            if (seedSv != null)
            {
                if (seedSv.IsNum) b.Seed = ToUint32JS(seedSv.N);
                else if (seedSv.IsBool) b.Seed = seedSv.B ? 1u : 0u;
            }
            if (!seedTruthy) b.Seed = FreshSeedLocal(eng);

            // todayEggs — JS satır 196-212. eggsAvailable birleşik değeri fill sayısı için okunur.
            var eaSv = Pick(src, "eggsAvailable");
            var mergedEggsAvailable = eaSv != null ? ToInt32JS(eaSv) : b.EggsAvailable; // Reset sonrası 3
            if (!savedHadEggs)
            {
                // v1 yolu — satır 199: fillTodayEggs(base, max(0, eggsAvailable|0)):
                // vitrin SIFIRLANIR, n × makeEgg(base.day) → HER BİRİ 1 UnseededRandom (variant)
                var n = Math.Max(0, mergedEggsAvailable);
                b.TodayEggs = new List<Egg>();
                for (var i = 0; i < n; i++) b.TodayEggs.Add(eng.MakeEgg(b.Day));
                b.EggsAvailable = b.TodayEggs.Count;      // fillTodayEggs senkronu (satır 74)
            }
            else
            {
                // v2 yolu — satır 201-211: yumurta temizliği (random TÜKETMEZ)
                var temiz = new List<Egg>();
                if (teSv.Items != null)
                {
                    foreach (var it in teSv.Items)
                    {
                        // satır 204: `!e || typeof e !== 'object'` → atla (JS'te DİZİ de object sayılır)
                        if (it == null || (!it.IsObj && !it.IsArr)) continue;
                        var seriSv = it.IsObj ? it.Get("seri") : null;
                        var seri = (seriSv != null && seriSv.IsStr && seriesKeys.IndexOf(seriSv.S) != -1)
                            ? seriSv.S
                            : eng.DaySeries(b.Day);       // satır 205: geçersiz seri → günün serisi
                        var varSv = it.IsObj ? it.Get("variant") : null;
                        var gSv = it.IsObj ? it.Get("golden") : null;
                        var kSv = it.IsObj ? it.Get("kulucka") : null;
                        temiz.Add(new Egg
                        {
                            Seri = seri,
                            Variant = Math.Max(0, Math.Min(variantCount - 1, ToInt32JS(varSv))), // satır 206
                            Golden = IsTrue(gSv) ? (bool?)true : null,                           // satır 207
                            Kulucka = IsTrue(kSv)                                                // satır 208
                        });
                    }
                }
                b.TodayEggs = temiz;
            }

            // foilBook — JS satır 213: obj değilse (dizi dahil) {}. JS içeriği ONARMAZ; C# tipli
            // FoilRecord'a okur: variants sayısal-string anahtarlar, sayaçlar Num→ToInt32 (karar notu).
            var fbSv = Pick(src, "foilBook");
            b.FoilBook = new Dictionary<string, FoilRecord>();
            if (fbSv != null && fbSv.IsObj && fbSv.Props != null)
                foreach (var kv in fbSv.Props)
                    b.FoilBook[kv.Key] = FoilFromSave(kv.Value);

            // tools — JS satır 214-217: Arr değil ya da boşsa FREE_TOOLS; eksik ücretsiz araçlar eklenir
            var toolsSv = Pick(src, "tools");
            List<string> tools;
            if (toolsSv == null || !toolsSv.IsArr || toolsSv.Items == null || toolsSv.Items.Count == 0)
                tools = new List<string>(FREE_TOOLS);
            else
            {
                tools = new List<string>();
                foreach (var it in toolsSv.Items)
                    if (it != null && it.IsStr) tools.Add(it.S);   // string olmayan öğe atlanır (karar notu)
            }
            for (var fi = 0; fi < FREE_TOOLS.Length; fi++)
                if (tools.IndexOf(FREE_TOOLS[fi]) == -1) tools.Add(FREE_TOOLS[fi]);
            b.Tools = tools;

            // activeTool — JS satır 218: listede yoksa tools[0] (FREE_TOOLS eklendiği için liste boş olamaz)
            var atSv = Pick(src, "activeTool");
            if (atSv != null) b.ActiveTool = atSv.IsStr ? atSv.S : null;  // sayı vb. listede bulunamaz → tools[0]
            if (b.Tools.IndexOf(b.ActiveTool) == -1) b.ActiveTool = b.Tools[0];

            // lastChocolateChoice — JS satır 219: 'biriktir' değilse 'ye'
            var lcSv = Pick(src, "lastChocolateChoice");
            if (lcSv != null) b.LastChocolateChoice = lcSv.IsStr ? lcSv.S : null;
            if (b.LastChocolateChoice != "biriktir") b.LastChocolateChoice = "ye";

            // sayaçlar — JS satır 220-223: max(0, x|0)
            b.Chocolates = RepairNonNegInt(src, "chocolates", b.Chocolates);
            b.ChocolateStarsToday = RepairNonNegInt(src, "chocolateStarsToday", b.ChocolateStarsToday);
            b.KumbaraToday = RepairNonNegInt(src, "kumbaraToday", b.KumbaraToday);
            b.GoldenPity = RepairNonNegInt(src, "goldenPity", b.GoldenPity);

            // firstRitualDoneToday — JS satır 224: === true
            var frSv = Pick(src, "firstRitualDoneToday");
            if (frSv != null) b.FirstRitualDoneToday = IsTrue(frSv);   // yoksa varsayılan false === true → false

            // --- v3 bloğu: parent — JS satır 227-234 (obj değilse {} → tüm alanlar varsayılana onarılır)
            var parSv = Pick(src, "parent");
            var po = (parSv != null && parSv.IsObj) ? parSv : null;
            var p = new ParentState();
            var pinSv = GetProp(po, "pin");                            // satır 229: ^\d{4}$ değilse '1234'
            p.Pin = (pinSv != null && pinSv.IsStr && IsPin(pinSv.S)) ? pinSv.S : "1234";
            var ltSv = GetProp(po, "limitTL");                         // satır 230: sayı && >= 0 değilse varsayılan
            p.LimitTL = (ltSv != null && ltSv.IsNum && ltSv.N >= 0) ? ltSv.N : DefaultLimitTL(content);
            var stSv = GetProp(po, "spentTL");                         // satır 231: max(0, round2(·))
            p.SpentTL = Math.Max(0, Round2((stSv != null && stSv.IsNum) ? stSv.N : 0));
            var aySv = GetProp(po, "ay");                              // satır 232: string değilse monthKey()
            p.Ay = (aySv != null && aySv.IsStr) ? aySv.S : eng.MonthKeyFn();
            p.ClubActive = IsTrue(GetProp(po, "clubActive"));          // satır 233: === true
            p.LimitRaiseTs = Math.Max(0, ToInt32JS(GetProp(po, "limitRaiseTs"))); // satır 234: |0 (ms damgası int32'ye sarılır — JS birebir)
            b.Parent = p;

            eng.SyncMonth();                                           // satır 235: ay döndüyse spentTL=0 (eng.S == b)

            // kiler — JS satır 236-238
            var kilSv = Pick(src, "kiler");
            var ko = (kilSv != null && kilSv.IsObj) ? kilSv : null;
            var kiler = new KilerState();
            kiler.Adet = Math.Max(0, ToInt32JS(GetProp(ko, "adet")));
            kiler.BugunAcilan = Math.Max(0, ToInt32JS(GetProp(ko, "bugunAcilan")));
            b.Kiler = kiler;

            // wishes — JS satır 239-250: {pufiId string} şart; ts max(0,·|0);
            // not==='dogumgunu' ve durum==='sonra' beyaz-listeyle KORUNUR
            var wSv = Pick(src, "wishes");
            var wishes = new List<Wish>();
            if (wSv != null && wSv.IsArr && wSv.Items != null)
            {
                foreach (var it in wSv.Items)
                {
                    if (it == null || !it.IsObj) continue;
                    var pid = it.Get("pufiId");
                    if (pid == null || !pid.IsStr) continue;
                    var w = new Wish { PufiId = pid.S, Ts = Math.Max(0, ToInt32JS(it.Get("ts"))) };
                    var notSv = it.Get("not");
                    if (notSv != null && notSv.IsStr && notSv.S == "dogumgunu") w.Not = "dogumgunu";
                    var duSv = it.Get("durum");
                    if (duSv != null && duSv.IsStr && duSv.S == "sonra") w.Durum = "sonra";
                    wishes.Add(w);
                }
            }
            b.Wishes = wishes;

            // purchases — JS satır 251: Arr değilse []; İÇERİK DOĞRULANMAZ (JS de doğrulamaz) —
            // öğeler ham SaveValue'dan Purchase'a alan adıyla okunur; eksik/yanlış tip → 0/null
            var prSv = Pick(src, "purchases");
            var purchases = new List<Purchase>();
            if (prSv != null && prSv.IsArr && prSv.Items != null)
            {
                foreach (var it in prSv.Items)
                {
                    var pu = new Purchase();
                    if (it != null && it.IsObj)
                    {
                        var v = it.Get("paketId"); pu.PaketId = (v != null && v.IsStr) ? v.S : null;
                        v = it.Get("ad"); pu.Ad = (v != null && v.IsStr) ? v.S : null;
                        v = it.Get("tutar"); pu.Tutar = (v != null && v.IsNum) ? v.N : 0;
                        pu.Adet = ToInt32JS(it.Get("adet"));   // spendReport `pr.adet|0` ile aynı sarma
                        pu.Ts = ToInt64Trunc(it.Get("ts"));
                    }
                    purchases.Add(pu);                    // obj olmayan öğe JS'te de dizide kalır → varsayılan kayıt
                }
            }
            b.Purchases = purchases;

            // kulucka — JS satır 254-256: obj && seri string değilse null
            var kuSv = Pick(src, "kulucka");
            b.Kulucka = null;
            if (kuSv != null && kuSv.IsObj)
            {
                var ks = kuSv.Get("seri");
                if (ks != null && ks.IsStr) b.Kulucka = new KuluckaState { Seri = ks.S };
            }

            // bugunAcilanlar — JS satır 257: Arr değilse []; string olmayan öğe ATLANIR (sözleşme EK, fikstürle kilitli)
            var baSv = Pick(src, "bugunAcilanlar");
            var bugun = new List<string>();
            if (baSv != null && baSv.IsArr && baSv.Items != null)
                foreach (var it in baSv.Items)
                    if (it != null && it.IsStr) bugun.Add(it.S);
            b.BugunAcilanlar = bugun;

            // gorevler — JS satır 258-264
            var gorSv = Pick(src, "gorevler");
            var go = (gorSv != null && gorSv.IsObj) ? gorSv : null;
            var gorevler = new GorevlerState();
            gorevler.Ac = Math.Max(0, ToInt32JS(GetProp(go, "ac")));
            gorevler.Oyun = Math.Max(0, ToInt32JS(GetProp(go, "oyun")));
            gorevler.AlbumZiyaret = IsTrue(GetProp(go, "albumZiyaret"));
            gorevler.BonusVerildi = IsTrue(GetProp(go, "bonusVerildi"));
            b.Gorevler = gorevler;

            // gorevBonusYeni — JS satır 265: === true
            b.GorevBonusYeni = IsTrue(Pick(src, "gorevBonusYeni"));

            // streak — JS satır 266-270
            var strSv = Pick(src, "streak");
            var so = (strSv != null && strSv.IsObj) ? strSv : null;
            var streak = new StreakState();
            streak.Yildiz = Math.Max(0, ToInt32JS(GetProp(so, "yildiz")));
            streak.Rozet = Math.Max(0, ToInt32JS(GetProp(so, "rozet")));
            b.Streak = streak;

            b.Version = 3;                                // JS satır 272
            b.EggsAvailable = b.TodayEggs.Count;          // JS satır 273: ZORUNLU senkron

            eng.S = b;                                    // JS satır 275 (Reset zaten atadı; açıkça yinelenir)
            return b;
        }

        /* ---------- yardımcılar ---------- */

        private static SaveValue Num(double n) { return SaveValue.Of(n); }
        private static SaveValue Str(string s) { return s != null ? SaveValue.Of(s) : SaveValue.Nil(); }

        // JS birleştirme kapısı (satır 183): anahtar var VE değer null/undefined değil.
        // SaveValue'da JSON null = Kind.Null → atlanır; eksik anahtar Get'te null döner.
        private static SaveValue Pick(SaveValue obj, string key)
        {
            if (obj == null || !obj.IsObj) return null;
            var v = obj.Get(key);
            return (v == null || v.K == SaveValue.Kind.Null) ? null : v;
        }

        // Alt-alan okuma: onarımlar HAM değere bakar (null-kind de tip denetiminden düşer).
        private static SaveValue GetProp(SaveValue obj, string key)
        {
            return (obj != null && obj.IsObj) ? obj.Get(key) : null;
        }

        private static bool IsTrue(SaveValue v) { return v != null && v.IsBool && v.B; }

        private static void MergeInt(SaveValue src, string key, ref int field)
        {
            var v = Pick(src, key);
            if (v != null && v.IsNum) field = ToInt32JS(v.N);
        }

        private static void MergeBool(SaveValue src, string key, ref bool field)
        {
            var v = Pick(src, key);
            if (v != null && v.IsBool) field = v.B;
        }

        private static void MergeStr(SaveValue src, string key, ref string field)
        {
            var v = Pick(src, key);
            if (v != null && v.IsStr) field = v.S;
        }

        // JS `Math.max(0, x | 0)` deseni: alan yoksa mevcut (varsayılan) değer kullanılır.
        private static int RepairNonNegInt(SaveValue src, string key, int cur)
        {
            var v = Pick(src, key);
            return Math.Max(0, v != null ? ToInt32JS(v) : cur);
        }

        // owned değerleri: Num → ToInt32; diğer türler truthiness ile 1/0 (JS ownedCount
        // `if (!owned[id])` truthiness okur — karar notu; fikstürler sayısal adet kullanır).
        private static int OwnedVal(SaveValue v)
        {
            if (v == null) return 0;
            if (v.IsNum) return ToInt32JS(v.N);
            return v.Truthy() ? 1 : 0;
        }

        // foilBook kaydı: JS load içeriğini onarmaz; C# tipli okuma (variants: sayısal-string
        // anahtar → int, sayılamayan anahtar atlanır; sayaçlar Num değilse 0 — karar notu).
        private static FoilRecord FoilFromSave(SaveValue v)
        {
            var rec = new FoilRecord();
            if (v != null && v.IsObj)
            {
                var vs = v.Get("variants");
                if (vs != null && vs.IsObj && vs.Props != null)
                {
                    foreach (var kv in vs.Props)
                    {
                        int idx;
                        if (int.TryParse(kv.Key, NumberStyles.Integer, CultureInfo.InvariantCulture, out idx))
                            rec.Variants[idx] = (kv.Value != null && kv.Value.IsNum) ? ToInt32JS(kv.Value.N) : 0;
                    }
                }
                var g = v.Get("golden");
                rec.Golden = (g != null && g.IsNum) ? ToInt32JS(g.N) : 0;
            }
            return rec;
        }

        // JS `x | 0` (ToInt32): Num → trunc + int32 aralığına sarma; diğer türler → 0
        // (sözleşme EK: JS ToInt32(NaN) = 0; bool/string coercion'ları kapsam dışı).
        private static int ToInt32JS(SaveValue v)
        {
            return (v != null && v.IsNum) ? ToInt32JS(v.N) : 0;
        }

        private static int ToInt32JS(double d)
        {
            if (double.IsNaN(d) || double.IsInfinity(d)) return 0;
            d = Math.Truncate(d);
            var m = d % 4294967296.0;                 // 2^32 modülü, sonra işaretli yorum (JS ToInt32)
            if (m < 0) m += 4294967296.0;
            unchecked { return (int)(uint)m; }
        }

        // JS `x >>> 0` (ToUint32) — seed alanı için
        private static uint ToUint32JS(double d)
        {
            if (double.IsNaN(d) || double.IsInfinity(d)) return 0;
            d = Math.Truncate(d);
            var m = d % 4294967296.0;
            if (m < 0) m += 4294967296.0;
            return (uint)m;
        }

        // ts benzeri geniş sayılar: Num → trunc(long); değilse/aralık dışı → 0
        private static long ToInt64Trunc(SaveValue v)
        {
            if (v == null || !v.IsNum) return 0;
            var d = v.N;
            if (double.IsNaN(d) || double.IsInfinity(d)) return 0;
            d = Math.Truncate(d);
            if (d < -9.2233720368547758E18 || d > 9.2233720368547758E18) return 0;
            return (long)d;
        }

        // round2 — state.js satır 164; JS Math.round = floor(x+0.5) (sözleşme kural 3,
        // StateEngine.Round2 ile aynı: NaN/Inf → 0)
        private static double Round2(double n)
        {
            if (double.IsNaN(n) || double.IsInfinity(n)) return 0;
            return Math.Floor(n * 100 + 0.5) / 100;
        }

        // freshSeed — state.js satır 25-27 (StateEngine'de private → yerelde tekrar; bit
        // hassasiyeti istenmez, tohumsuz yol — sözleşme "yaklaşık eşleme")
        private static uint FreshSeedLocal(StateEngine eng)
        {
            unchecked
            {
                var v = (uint)((int)eng.NowMs() ^ (int)(long)(eng.UnseededRandom() * 4294967295.0));
                return v != 0 ? v : 1u;
            }
        }

        // seriesKeys — state.js satır 40-44 (StateEngine'de private → yerelde tekrar)
        private static List<string> SeriesKeysSafe(GameContent c)
        {
            var keys = c != null ? c.SeriesKeys : null;
            if (keys == null || keys.Count == 0) return new List<string> { "gunesbahcesi" };
            return keys;
        }

        // variantCount — state.js satır 46-49 (StateEngine'de private → yerelde tekrar)
        private static int VariantCountSafe(GameContent c)
        {
            var n = c != null ? c.WrapperVariants : 0;
            return n > 0 ? n : 8;
        }

        // storeLimits().varsayilanAylik — state.js satır 132-140
        private static double DefaultLimitTL(GameContent c)
        {
            return (c != null && c.StoreLimits != null) ? c.StoreLimits.VarsayilanAylik : 400;
        }

        // ^\d{4}$ — yalnız ASCII rakam (JS \d ile aynı; StateEngine.SetPin deseni)
        private static bool IsPin(string p)
        {
            if (p == null || p.Length != 4) return false;
            for (var i = 0; i < 4; i++)
                if (p[i] < '0' || p[i] > '9') return false;
            return true;
        }
    }
}
