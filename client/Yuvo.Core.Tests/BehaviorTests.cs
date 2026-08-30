using System;
using System.Collections.Generic;
using NUnit.Framework;
using Yuvo.Core;

namespace Yuvo.Core.Tests
{
    /* Davranış asertleri — tools/proto-engine-test.mjs motor bölümlerinin çevirisi
       (assert mesajları Türkçe kaynak metinden korunmuştur). Her test KENDİ taze
       StateEngine'ini kurar: UnseededRandom = sabit tohumlu System.Random(42),
       NowMs/MonthKeyFn testten enjekte edilir → testler bağımsız ve deterministik. */

    [TestFixture]
    public class BehaviorTests
    {
        private static GameContent _content;

        [OneTimeSetUp]
        public void Setup()
        {
            _content = Fixtures.LoadContent(); // içerik salt-okunur; motorlar paylaşabilir
        }

        // Enjekte edilen saat: NowMs/MonthKeyFn testin elinde (sözleşme kural 7).
        private sealed class Saat
        {
            public long Now = 1_600_000_000_000L; // sabit başlangıç anı (ms)
            public string Ay = "2026-01";
        }

        // Taze motor: Math.random karşılığı sabit tohumlu Random(42) (sözleşme kural 6).
        private static StateEngine YeniMotor(Saat saat)
        {
            var rnd = new Random(42);
            return new StateEngine(_content, rnd.NextDouble, () => saat.Now, () => saat.Ay);
        }

        private static StateEngine YeniMotor()
        {
            return YeniMotor(new Saat());
        }

        // js RANK tablosu (proto-engine-test.mjs satır 36)
        private static int Rank(string rarity)
        {
            switch (rarity)
            {
                case "yaygin": return 0;
                case "azbulunur": return 1;
                case "nadir": return 2;
                case "destansi": return 3;
                case "efsanevi": return 4;
                case "gizli": return 5;
                default: return -1;
            }
        }

        // Altın senaryo koşucusuyla aynı kurulum (sözleşme "Test fikstürleri"):
        // her açılış öncesi vitrin TEK yumurtayla kurulur — UnseededRandom akışına dokunmaz.
        private static void TekYumurtaKur(StateEngine e)
        {
            e.S.TodayEggs = new List<Egg> { new Egg { Seri = "gunesbahcesi", Variant = 0, Golden = null } };
            e.S.EggsAvailable = 1;
        }

        // proto-engine-test.mjs satır 82-90: varsayılan state, no-egg, ek yumurta limiti
        [Test]
        public void TemelApi()
        {
            var eng = YeniMotor();
            var gacha = new GachaEngine(eng);
            eng.Reset(12345);
            Assert.That(eng.S.Stardust == 40 && eng.S.EggsAvailable == 3, Is.True,
                "varsayılan state (40⭐, 3 yumurta) bekleniyor");
            eng.S.EggsAvailable = 0;
            Assert.That(gacha.OpenEgg().Error, Is.EqualTo("no-egg"), "yumurta yokken {error:\"no-egg\"} bekleniyor");
            eng.AddStardust(300); // 340⭐
            Assert.That(eng.BuyExtraEgg() && eng.BuyExtraEgg(), Is.True, "ek yumurta 2 kez alınabilmeli");
            Assert.That(eng.BuyExtraEgg(), Is.False, "3. ek yumurta reddedilmeli (günde max 2)");
            Assert.That(eng.S.Stardust == 340 - 240 && eng.S.EggsAvailable == 2, Is.True,
                "ek yumurta 120⭐ düşmeli, yumurta eklenmeli");
        }

        // Sim A onboarding parçası (js satır 105-106, 126-127): Reset(101) → ilk 10 hep yeni, 3. Nadir+
        [Test]
        public void OnboardingIlkOnYeniVeUcuncuNadir()
        {
            var eng = YeniMotor();
            var gacha = new GachaEngine(eng);
            eng.Reset(101);
            for (var i = 1; i <= 10; i++)
            {
                TekYumurtaKur(eng);
                var res = gacha.OpenEgg();
                Assert.That(res.Error, Is.Null, $"onboarding {i}. açılışta beklenmedik hata");
                Assert.That(res.IsNew, Is.True, $"onboarding: ilk 10 yumurta hep yeni parça olmalı ({i}. açılış kopya düştü)");
                if (i == 3)
                    Assert.That(Rank(res.Rarity), Is.GreaterThanOrEqualTo(Rank("nadir")),
                        $"onboarding: 3. yumurta Nadir+ olmalı (ölçülen {res.Rarity})");
            }
        }

        // Sim A pity parçası (js satır 96-153): Reset(202) → 5.000 açılışta pity ihlali yok.
        // Parite denetimi güçlendirmesi: boşluklar JS gibi ÇIKTIDAN (res.Rarity dizisinden)
        // ölçülür — portun kendi sayaçlarıyla döngüsel doğrulama yapılmaz; sayaç sınırları
        // ek kontrol olarak kalır. Ayrıca JS Sim A'nın gizli kapısı, altın folyo pity/oran,
        // wrapper kaydı bütünlüğü ve Ambalaj Defteri muhasebesi asertleri de burada.
        [Test]
        public void PityIhlaliYok5000Acilis()
        {
            var eng = YeniMotor();
            var gacha = new GachaEngine(eng);
            eng.Reset(202);
            int maxN = 0, maxD = 0, maxE = 0;
            int gapN = 0, gapD = 0, gapE = 0, maxGapN = 0, maxGapD = 0, maxGapE = 0;
            int sinceGolden = 0, maxGoldenGap = 0, goldenSayisi = 0;
            int gizliErken = 0, wrapperBozuk = 0;
            for (var i = 1; i <= 5000; i++)
            {
                var pre = eng.OwnedCount("cayir");
                TekYumurtaKur(eng);
                var res = gacha.OpenEgg();
                Assert.That(res.Error, Is.Null, $"pity simülasyonu {i}. açılışta beklenmedik hata: {res.Error}");
                // Boşluk ölçümü ÇIKTIDAN (js 107-119 birebir): rank eşiği geçen sonuç boşluğu kapatır
                var r = Rank(res.Rarity);
                if (r >= Rank("nadir")) { maxGapN = Math.Max(maxGapN, gapN); gapN = 0; } else gapN += 1;
                if (r >= Rank("destansi")) { maxGapD = Math.Max(maxGapD, gapD); gapD = 0; } else gapD += 1;
                if (r >= Rank("efsanevi")) { maxGapE = Math.Max(maxGapE, gapE); gapE = 0; } else gapE += 1;
                if (res.Wrapper != null && res.Wrapper.Golden) { maxGoldenGap = Math.Max(maxGoldenGap, sinceGolden); sinceGolden = 0; goldenSayisi += 1; }
                else sinceGolden += 1;
                if (res.Rarity == "gizli" && pre < 30) gizliErken += 1;
                if (res.Wrapper == null || string.IsNullOrEmpty(res.Wrapper.Seri) ||
                    res.Wrapper.Variant < 0 || res.Wrapper.Variant >= _content.WrapperVariants ||
                    res.Chocolate != 1) wrapperBozuk += 1;
                maxN = Math.Max(maxN, eng.S.PityN);
                maxD = Math.Max(maxD, eng.S.PityD);
                maxE = Math.Max(maxE, eng.S.PityE);
            }
            // JS 122-124: çıktı-tabanlı boşluk tavanları (taban-yükseltme pity'lerinin kanıtı)
            Assert.That(maxGapN, Is.LessThanOrEqualTo(14), $"Nadir+ boşluğu ≤14 olmalı (ölçülen {maxGapN})");
            Assert.That(maxGapD, Is.LessThanOrEqualTo(39), $"Destansı+ boşluğu ≤39 olmalı (ölçülen {maxGapD})");
            Assert.That(maxGapE, Is.LessThanOrEqualTo(49), $"Efsanevi+ boşluğu ≤49 olmalı (ölçülen {maxGapE})");
            // Sayaç sınırları (ek iç-tutarlılık kontrolü)
            Assert.That(maxN <= 15 && maxD <= 40 && maxE <= 50, Is.True,
                $"pity sayaçları tavanları aşmamalı (N{maxN}/D{maxD}/E{maxE})");
            // JS 125: gizli kapısı — 30/30'dan önce gizli asla düşmez
            Assert.That(gizliErken, Is.EqualTo(0), $"gizli 30/30'dan önce düşmemeli ({gizliErken} erken düşüş)");
            // JS 133-136: altın folyo pity + oran taban sanity
            Assert.That(maxGoldenGap <= 40 && sinceGolden < 40, Is.True,
                $"altın folyo pity: aralık ihlali olmamalı (maxGap {maxGoldenGap}, kuyruk {sinceGolden})");
            Assert.That(goldenSayisi, Is.GreaterThanOrEqualTo(100),
                $"altın oranı taban sanity: 5.000 açılışta ≥100 altın beklenir (ölçülen {goldenSayisi})");
            // JS 138: her açılış tam wrapper kaydı + 1 çikolata döndürür
            Assert.That(wrapperBozuk, Is.EqualTo(0), $"her açılış tam wrapper kaydı döndürmeli ({wrapperBozuk} bozuk)");
            // JS 140-153: Ambalaj Defteri muhasebesi — toplam pul = açılış sayısı, altın eşleşir
            int foilToplam = 0, foilAltin = 0;
            foreach (var kv in eng.S.FoilBook)
            {
                Assert.That(_content.SeriesKeys.Contains(kv.Key), Is.True,
                    $"defterdeki seri anahtarı tanımlı olmalı ({kv.Key})");
                foilAltin += kv.Value.Golden;
                foilToplam += kv.Value.Golden;
                foreach (var v in kv.Value.Variants) foilToplam += v.Value;
            }
            Assert.That(foilToplam, Is.EqualTo(5000), $"Ambalaj Defteri toplamı 5.000 olmalı (ölçülen {foilToplam})");
            Assert.That(foilAltin, Is.EqualTo(goldenSayisi), $"defterdeki altın sayısı gözlenenle eşleşmeli ({foilAltin} vs {goldenSayisi})");
        }

        // js satır 266-278: forceGoldenNext test kancası + setTool (saf kozmetik araç seçimi)
        [Test]
        public void ForceGoldenNextVeSetTool()
        {
            var eng = YeniMotor();
            var gacha = new GachaEngine(eng);
            eng.Reset(777);
            gacha.ForceGoldenNext();
            TekYumurtaKur(eng);
            var rg = gacha.OpenEgg();
            Assert.That(rg.Error == null && rg.Wrapper.Golden && eng.S.GoldenPity == 0, Is.True,
                "forceGoldenNext → sıradaki açılış altın olmalı, goldenPity sıfırlanmalı");
            Assert.That(eng.S.FoilBook.ContainsKey("gunesbahcesi") && eng.S.FoilBook["gunesbahcesi"].Golden == 1, Is.True,
                "altın folyo Ambalaj Defteri'ne Altın Şeref Yuvası olarak işlenmeli");
            Assert.That(eng.SetTool("cekic") && eng.S.ActiveTool == "cekic", Is.True,
                "sahipli araç seçilebilmeli (cekic)");
            Assert.That(!eng.SetTool("sedefburgu") && eng.S.ActiveTool == "cekic", Is.True,
                "sahipsiz araç reddedilmeli, seçim değişmemeli");
        }

        // js satır 234-247: çikolata ⭐ tavanı + kumbaraya atma + newDay sayaç sıfırlama
        [Test]
        public void CikolataYildizTavani()
        {
            var eng = YeniMotor();
            eng.Reset(778);
            var s = eng.S;
            var star0 = s.Stardust;
            var kazanc = 0;
            for (var i = 0; i < 25; i++) kazanc += eng.EatChocolate(); // 25 × 2⭐ = 50 → tavan 40
            Assert.That(s.ChocolateStarsToday == 40 && s.Stardust == star0 + 40 && kazanc == 40, Is.True,
                "çikolata ⭐ tavanı korunmalı: 25 ısırık → +40⭐ (2⭐/ısırık, tavan 40)");
            Assert.That(s.LastChocolateChoice, Is.EqualTo("ye"), "lastChocolateChoice ısırıkla \"ye\" olmalı");
            Assert.That(eng.BankChocolate() == 1 && s.LastChocolateChoice == "biriktir", Is.True,
                "bankChocolate: kumbara +1, tercih \"biriktir\" olmalı");
            eng.NewDay();
            Assert.That(eng.S.ChocolateStarsToday, Is.EqualTo(0), "newDay → çikolata ⭐ sayacı sıfırlanmalı");
        }

        // js satır 210-233: kumbara → şölen dönüşümü (eşik 15, günde 1, newDay tazeler,
        // kumbara birikimi korunur) + "vitrin 3 + şölen 1 = 4 → newDay → 7" birikimi
        [Test]
        public void KumbaraSolenDonusumu()
        {
            var eng = YeniMotor();
            eng.Reset(777);
            var s = eng.S;
            Assert.That(eng.RedeemChocolates(), Is.False, "çikolatasız şölen dönüşümü reddedilmeli");
            s.Chocolates = 15; // js Yuvo.test.grantChocolates(15) karşılığı
            var onceki = s.TodayEggs.Count;
            Assert.That(eng.RedeemChocolates(), Is.True, "15 çikolata → şölen dönüşümü kabul edilmeli");
            Assert.That(s.Chocolates == 0 && s.KumbaraToday == 1 &&
                        s.TodayEggs.Count == onceki + 1 && s.EggsAvailable == s.TodayEggs.Count, Is.True,
                "dönüşüm: -15 çikolata, +1 vitrin yumurtası, sayaç senkron olmalı");
            s.Chocolates += 30;
            Assert.That(eng.RedeemChocolates(), Is.False, "aynı gün 2. dönüşüm reddedilmeli (KUMBARA_GUNLUK=1)");
            eng.NewDay();
            Assert.That(eng.S.KumbaraToday == 0 && eng.S.Chocolates == 30 &&
                        eng.S.TodayEggs.Count == 7 && eng.S.EggsAvailable == 7 &&
                        eng.S.FirstRitualDoneToday == false, Is.True,
                "newDay: haklar birikmeli (4 kalan + 3 yeni = 7), kumbara hakkı ve ritüel bayrağı sıfırlanmalı");
            Assert.That(eng.RedeemChocolates() && eng.S.Chocolates == 15, Is.True,
                "yeni gün → şölen hakkı tazelenmeli (kumbara birikimi korunur)");
        }

        // js satır 422-443: hak birikimi (6/9/9 + Club tavanı aşmaz) + kuluçka döngüsü
        [Test]
        public void NewDayBirikimiTavanVeKulucka()
        {
            var eng = YeniMotor();
            eng.Reset(5151);
            var s = eng.S;
            eng.NewDay();
            Assert.That(s.TodayEggs.Count == 6 && s.EggsAvailable == 6, Is.True, "birikim: 3 kalan + 3 yeni = 6 olmalı");
            eng.NewDay();
            Assert.That(s.TodayEggs.Count, Is.EqualTo(9), "birikim: 6 + 3 = 9 olmalı");
            eng.NewDay();
            Assert.That(s.TodayEggs.Count, Is.EqualTo(9), "tavan 9: daha fazla birikmemeli");
            Assert.That(s.Streak.Yildiz == 0 && s.Streak.Rozet == 0, Is.True,
                "oynanmayan günler yıldız üretmemeli ama zinciri de KIRMAMALI (cezasız)");
            // Club açıkken bile tavan 9 aşılmaz (state.js satır 311-316)
            Assert.That(eng.ToggleClub(), Is.True, "Club açılmalı");
            eng.NewDay();
            Assert.That(s.TodayEggs.Count, Is.EqualTo(9), "Club açıkken tavandaki vitrine EK yumurta düşmemeli (9 kalmalı)");
            // Kuluçka döngüsü: akşam bırakılır → sabah İLK sırada "hazır", tavana sayılmaz
            Assert.That(eng.KuluckaBirak("yildiztozu"), Is.True, "kuluçka bırakılabilmeli");
            Assert.That(eng.KuluckaBirak(), Is.False, "ikinci kuluçka reddedilmeli (tek sürpriz)");
            eng.NewDay();
            Assert.That(s.TodayEggs[0] != null && s.TodayEggs[0].Kulucka && s.TodayEggs[0].Seri == "yildiztozu", Is.True,
                "kuluçka yumurtası sabah İLK sırada, bırakılan seriyle hazır olmalı");
            Assert.That(s.Kulucka, Is.Null, "kuluçka alanı temizlenmeli (tek seferlik)");
            Assert.That(s.TodayEggs.Count == 10 && s.EggsAvailable == 10, Is.True,
                "kuluçka tavana SAYILMAMALI — bekletilen sürpriz asla yanmaz (9 + 1 hazır)");
            Assert.That(eng.YarinSeri() == eng.YarinSeri() && !string.IsNullOrEmpty(eng.YarinSeri()), Is.True,
                "yarinSeri deterministik bir seri anahtarı döndürmeli");
        }

        // js satır 445-465, 469-471: görev zinciri — 3 aç + 1 oyun + albüm → BİR KEZ bonus
        [Test]
        public void GorevZinciri()
        {
            var eng = YeniMotor();
            var gacha = new GachaEngine(eng);
            eng.Reset(5252);
            var s = eng.S;
            Assert.That(eng.GorevHedef(), Is.EqualTo((3, 1)), "görev hedefi (3 aç, 1 oyun) olmalı");
            Assert.That(eng.GorevIlerle("oyun"), Is.False, "oyun tek başına bonus vermemeli");
            Assert.That(eng.GorevIlerle("album"), Is.False, "albüm tek başına bonus vermemeli");
            Assert.That(eng.GorevIlerle("bilinmeyen"), Is.False, "bilinmeyen görev tipi reddedilmeli");
            var r1 = gacha.OpenEgg();
            var r2 = gacha.OpenEgg();
            Assert.That(r1.Error == null && !r1.GorevBonus && r2.Error == null && !r2.GorevBonus, Is.True,
                "ilk 2 açılış: zincir henüz tamam değil, bonus olmamalı");
            var r3 = gacha.OpenEgg();
            Assert.That(r3.Error == null && r3.GorevBonus, Is.True, "3. açılış zinciri tamamlamalı → bonus yumurta!");
            Assert.That(s.Gorevler.BonusVerildi && s.GorevBonusYeni, Is.True,
                "bonus bayrakları kurulmalı (yuva bir kez kutlayacak)");
            Assert.That(s.TodayEggs.Count == 1 && s.EggsAvailable == 1, Is.True,
                "bonus yumurta vitrine düşmeli (3 açıldı → 0, +1 bonus)");
            var r4 = gacha.OpenEgg();
            Assert.That(r4.Error == null && !r4.GorevBonus, Is.True, "bonus BİR KEZ — 4. açılışta tekrarlanmamalı");
            Assert.That(s.BugunAcilanlar != null && s.BugunAcilanlar.Count == 4 &&
                        s.BugunAcilanlar.TrueForAll(id => !string.IsNullOrEmpty(id)), Is.True,
                "bugunAcilanlar: 4 açılış kapanış özeti için kaydedilmeli");
            eng.NewDay();
            Assert.That(s.Gorevler.Ac == 0 && s.Gorevler.Oyun == 0 && !s.Gorevler.AlbumZiyaret &&
                        !s.Gorevler.BonusVerildi && s.BugunAcilanlar.Count == 0 && !s.GorevBonusYeni, Is.True,
                "newDay → görev zinciri ve kapanış özeti sıfırlanmalı");
        }

        // js satır 466-478: Bekçi Takvimi — oynanan gün 1 yıldız, kaçan gün DÜŞÜRMEZ,
        // 7. yıldızda +25 Kabuk + rozet + şerit sıfırdan
        [Test]
        public void BekciTakvimiStreak()
        {
            var eng = YeniMotor();
            eng.Reset(303);
            var s = eng.S;
            Assert.That(eng.StreakInfo(), Is.EqualTo((7, 25)), "streak bilgisi (hedef 7, kabuk 25) olmalı");
            s.Gorevler.Ac = 1;                      // dün en az 1 yumurta açıldı işareti
            eng.NewDay();
            Assert.That(s.Streak.Yildiz, Is.EqualTo(1), "oynanan günün sabahında 1 yıldız olmalı");
            for (var d = 0; d < 6; d++) eng.NewDay(); // hiç oynanmadı
            Assert.That(s.Streak.Yildiz, Is.EqualTo(1),
                "kaçan 6 gün yıldızı DÜŞÜRMEMELİ (Duolingo-freeze değil, yapısal cezasızlık)");
            var kab0 = s.Kabuk;
            for (var d = 0; d < 6; d++) { s.Gorevler.Ac = 1; eng.NewDay(); } // 6 oynanan gün
            Assert.That(s.Streak.Yildiz == 0 && s.Streak.Rozet == 1 && s.Kabuk == kab0 + 25, Is.True,
                "7. yıldızda +25 Kabuk + rozet, şerit sıfırdan devam etmeli");
        }

        // js satır 362-391: buyPack — aylık limit, Club yuvarlama, ay devri; vitrine DOKUNMAZ
        [Test]
        public void MagazaBuyPackLimitClubVeAyDevri()
        {
            var saat = new Saat();
            var eng = YeniMotor(saat);
            eng.Reset(4242);
            var s = eng.S;
            Assert.That(s.Parent.Pin == "1234" && s.Parent.LimitTL == 400 && s.Parent.SpentTL == 0 &&
                        s.Kiler.Adet == 0 && s.Wishes != null && s.Purchases != null, Is.True,
                "v3 varsayılan state (PIN 1234, limit ₺400, boş kiler/dilek/kayıt) olmalı");
            var rx = eng.BuyPack("yok-boyle-paket");
            Assert.That(!rx.Ok && rx.Reason == "bilinmiyor", Is.True, "bilinmeyen paket reddedilmeli");
            var eggs0 = s.TodayEggs.Count;
            var r1 = eng.BuyPack("tekli");
            Assert.That(r1.Ok && r1.Adet == 1 && r1.Tutar == 9.99, Is.True, "tekli paket alınmalı (₺9,99 → 1 yumurta)");
            Assert.That(s.Kiler.Adet == 1 && s.TodayEggs.Count == eggs0 && s.EggsAvailable == eggs0, Is.True,
                "satın alma YALNIZ Kiler'e düşmeli — vitrin/eggsAvailable dokunulmamalı");
            Assert.That(s.Parent.SpentTL == 9.99 && s.Purchases.Count == 1, Is.True, "harcama ve makbuz kaydedilmeli");
            var r2 = eng.BuyPack("kumbara");
            Assert.That(r2.Ok && s.Parent.SpentTL == 209.98, Is.True, "ikinci paket: toplam ₺209,98 olmalı");
            var r3 = eng.BuyPack("kumbara");
            Assert.That(!r3.Ok && r3.Reason == "limit" && s.Parent.SpentTL == 209.98 && s.Kiler.Adet == 101, Is.True,
                "aylık limit ₺400 aşımı ENGELLENMELİ; harcama/kiler değişmemeli");
            Assert.That(eng.ToggleClub(), Is.True, "Club açılmalı");
            var r4 = eng.BuyPack("haftalik");
            Assert.That(r4.Ok && r4.Adet == 11, Is.True, $"Club bonusu yukarı yuvarlanmalı (10 → {r4.Adet}, beklenen 11)");
            // Ay devri: MonthKeyFn yeni ay döndürünce SyncMonth harcamayı sıfırlar, makbuzlar korunur
            saat.Ay = "2026-02";
            eng.SyncMonth();
            Assert.That(s.Parent.SpentTL == 0 && s.Parent.Ay == "2026-02" &&
                        s.Purchases.Count == 3 && s.Kiler.Adet == 112, Is.True,
                "ay devri: harcama sayacı sıfırlanmalı, makbuz geçmişi ve kiler korunmalı");
            // JS 386-388: aynı senaryo spendReport() ÇIKTISI üzerinden de doğrulanır
            // (parite denetimi: BuildSpendReport portunun bağımsız kapsamı)
            var rep = eng.BuildSpendReport();
            Assert.That(rep.SpentTL == 0 && rep.Ay == "2026-02" && rep.PaketAdet == 3 &&
                        rep.KilerAdet == 112 && rep.Yumurta == 112 && rep.Pufi == 0 && rep.ClubActive,
                Is.True,
                $"spendReport: ay devri raporu (spent {rep.SpentTL}, paket {rep.PaketAdet}, kiler {rep.KilerAdet}, yumurta {rep.Yumurta})");
            Assert.That(eng.BuyPack("kumbara").Ok && s.Parent.SpentTL == 199.99, Is.True,
                "yeni ayda limit tazelenmeli");
        }

        // js satır 394-417: drawFromKiler — günlük tavan 5 (+1 Club), newDay tazeler
        [Test]
        public void KilerGunlukTavani()
        {
            var eng = YeniMotor();
            eng.Reset(4343);
            var s = eng.S;
            Assert.That(eng.DrawFromKiler(), Is.False, "boş kilerden çekim reddedilmeli");
            s.Kiler.Adet = 20;
            var eggs0 = s.TodayEggs.Count;
            var cekim = 0;
            for (var i = 0; i < 7; i++) { if (eng.DrawFromKiler()) cekim += 1; }
            Assert.That(cekim == 5 && s.Kiler.BugunAcilan == 5 && s.Kiler.Adet == 15, Is.True,
                $"günlük tavan 5: 7 denemede {cekim} çekim olmalı (beklenen 5)");
            Assert.That(s.TodayEggs.Count == eggs0 + 5 && s.EggsAvailable == s.TodayEggs.Count &&
                        s.TodayEggs.TrueForAll(e => !string.IsNullOrEmpty(e.Seri) && e.Golden == null), Is.True,
                "çekilen yumurtalar AMBALAJLI vitrine düşmeli, sayaç senkron olmalı");
            Assert.That(eng.ToggleClub() && eng.DrawFromKiler() && !eng.DrawFromKiler(), Is.True,
                "Club: tavan +1 olmalı (6. çekim kabul, 7. ret)");
            eng.NewDay();
            s = eng.S;
            Assert.That(s.Kiler.BugunAcilan == 0 && s.Kiler.Adet == 14, Is.True,
                "newDay → kiler hakkı tazelenmeli, stok korunmalı");
            Assert.That(s.TodayEggs.Count == 9 && s.EggsAvailable == 9, Is.True,
                "newDay + Club: dünden kalan 9 KORUNMALI, tavan 9 aşılmamalı (yeni/Club eklenmemeli)");
            Assert.That(eng.DrawFromKiler(), Is.True, "yeni gün → kilerden çekim yeniden açık olmalı");
        }

        // js satır 481-496: Dilek Kavanozu — kopyasız, tavan 5, 7 gün budama (NowMs ilerletilerek)
        [Test]
        public void DilekKavanozu()
        {
            var saat = new Saat();
            var eng = YeniMotor(saat);
            eng.Reset(4444);
            var s = eng.S;
            var ids = new List<string>();
            for (var i = 0; i < 6; i++) ids.Add(_content.Pufis[i].Id);
            Assert.That(eng.AddWish(ids[0]), Is.True, "ilk dilek eklenebilmeli");
            Assert.That(eng.AddWish(ids[0]), Is.False, "aynı dilek ikinci kez reddedilmeli");
            for (var i = 1; i < 5; i++) eng.AddWish(ids[i]);
            Assert.That(s.Wishes.Count == 5 && eng.AddWish(ids[5]) == false, Is.True, "5 dilek tavanı korunmalı");
            Assert.That(eng.ClearWish(ids[0]) && s.Wishes.Count == 4, Is.True, "dilek kaldırılabilmeli");
            Assert.That(eng.ClearWish(ids[0]), Is.False, "olmayan dilek kaldırılamamalı (false)");
            // 8 gün ilerlet → kalan 4 dilek 7 gün eşiğini aşar, budanır (js'te ts geri alınmıştı;
            // sözleşme gereği burada NowMs enjeksiyonu ileri sarılır)
            saat.Now += 8L * 24 * 3600 * 1000;
            Assert.That(eng.AddWish(ids[5]) && s.Wishes.Count == 1 && s.Wishes[0].PufiId == ids[5], Is.True,
                "7 günden eski dilekler kendiliğinden düşmeli, yenisi eklenmeli");
            // Parite denetimi güçlendirmesi: budama SEÇİCİ olmalı — yalnız süresi dolan düşer,
            // taze dilekler KALIR (js 492-495'in tek-dilek-eskitme özelliği farklı yaşlarla)
            saat.Now += 4L * 24 * 3600 * 1000;            // ids[5] şimdi 4 günlük
            Assert.That(eng.AddWish(ids[0]), Is.True, "4 gün sonra ikinci taze dilek eklenebilmeli");
            saat.Now += 4L * 24 * 3600 * 1000;            // ids[5] 8 günlük (düşer), ids[0] 4 günlük (kalır)
            Assert.That(eng.AddWish(ids[1]), Is.True, "eski dilek budanırken yeni dilek eklenebilmeli");
            Assert.That(s.Wishes.Count == 2 &&
                        s.Wishes.Exists(w => w.PufiId == ids[0]) &&
                        s.Wishes.Exists(w => w.PufiId == ids[1]) &&
                        !s.Wishes.Exists(w => w.PufiId == ids[5]), Is.True,
                "budama seçici olmalı: yalnız 7 günü aşan düşer, taze dilekler korunur");
        }

        // js satır 499-512: setLimit soğuması yalnız ARTIRIMDA + setPin format kontrolü
        [Test]
        public void SetLimitSogumaVeSetPin()
        {
            var eng = YeniMotor();
            eng.Reset(4545);
            var s = eng.S;
            var art = eng.SetLimit(750);
            Assert.That(art.Ok && art.Soguma && art.SogumaSaat == 24 && s.Parent.LimitTL == 750, Is.True,
                "limit ARTIRIMI: 24 saat soğuma bilgisiyle kabul edilmeli");
            var ind = eng.SetLimit(100);
            Assert.That(ind.Ok && !ind.Soguma && s.Parent.LimitTL == 100, Is.True,
                "limit İNDİRİMİ: soğumasız, anında olmalı");
            Assert.That(!eng.SetPin("12ab") && !eng.SetPin("123") && s.Parent.Pin == "1234", Is.True,
                "geçersiz PIN reddedilmeli (4 hane şartı)");
            Assert.That(eng.SetPin("9876") && s.Parent.Pin == "9876", Is.True, "geçerli PIN değişmeli");
        }

        // js satır 515-567: biyom kilidi, havuz filtresi, gizli kapısı, kilometre taşları, Şako
        [Test]
        public void BiyomOrmanKilidiHavuzVeSako()
        {
            var eng = YeniMotor();
            var gacha = new GachaEngine(eng);
            eng.Reset(6161);
            var s = eng.S;
            Assert.That(s.ActiveBiome == "cayir" && !s.OrmanAcik && s.SakoHidden == null, Is.True,
                "varsayılan: çayır aktif, orman kilitli, Şako boş olmalı");
            Assert.That(!eng.SetBiome("orman") && s.ActiveBiome == "cayir", Is.True,
                "kilitliyken ormana geçilememeli");
            // Çayırdan 10 parça → kilit açılır (checkOrmanUnlock BİR KEZ true döner) — js satır 524-528
            var cayirlar = new List<PufiDef>();
            foreach (var p in _content.Pufis)
            {
                var b = string.IsNullOrEmpty(p.Biome) ? "cayir" : p.Biome;
                if (b == "cayir" && p.Rarity != "gizli") cayirlar.Add(p);
            }
            for (var i = 0; i < 10; i++) s.Owned[cayirlar[i].Id] = 1;
            Assert.That(eng.CheckOrmanUnlock() && s.OrmanAcik, Is.True, "Çayır 10/30 → Fısıltı Ormanı açılmalı");
            Assert.That(eng.CheckOrmanUnlock(), Is.False, "kilit açılışı bir kez bildirilmeli");
            Assert.That(eng.SetBiome("orman") && s.ActiveBiome == "orman", Is.True, "ormana geçilebilmeli");

            // Havuz filtresi: orman aktifken TÜM düşüşler orman ailesinden — js satır 532-543
            var yanlisBiyom = 0;
            var ormanGizliErken = 0;
            for (var i = 0; i < 600; i++)
            {
                var pre = eng.OwnedCount("orman");
                TekYumurtaKur(eng);
                var res = gacha.OpenEgg();
                Assert.That(res.Error, Is.Null, $"orman açılışında hata olmamalı ({i + 1}. açılış: {res.Error})");
                var biome = string.IsNullOrEmpty(res.Pufi.Biome) ? "cayir" : res.Pufi.Biome;
                if (biome != "orman") yanlisBiyom += 1;
                if (res.Rarity == "gizli" && pre < 30) ormanGizliErken += 1;
            }
            Assert.That(yanlisBiyom, Is.EqualTo(0), $"orman havuzu sızdırmamalı: 600 açılışta {yanlisBiyom} yabancı düşüş");
            Assert.That(ormanGizliErken, Is.EqualTo(0), "orman gizlisi (Kütük) 30/30'dan önce düşmemeli");
            Assert.That(eng.OwnedCount("orman"), Is.EqualTo(30),
                $"orman 600 yumurtada tamamlanmalı ({eng.OwnedCount("orman")}/30)");
            // Kilometre taşları Çayır rozetidir: orman parçaları m20/m27/m30 tetiklemez — js satır 545-546
            Assert.That(s.Milestones.IndexOf("m20"), Is.EqualTo(-1),
                "kilometre taşları çayıra bağlı — orman 30/30 iken bile m20 olmamalı (çayır 10)");

            // Şako: newDay orman parçalarından birini saklar; Saklambaç kazanınca geri döner — js satır 549-556
            eng.NewDay();
            var pSaklanan = _content.PufiById(s.SakoHidden);
            Assert.That(!string.IsNullOrEmpty(s.SakoHidden) && pSaklanan != null && pSaklanan.Biome == "orman", Is.True,
                $"Şako bir orman parçası saklamalı (saklanan: {s.SakoHidden ?? "yok"})");
            var saklanan = s.SakoHidden;
            Assert.That(s.Owned.ContainsKey(saklanan) && s.Owned[saklanan] > 0, Is.True,
                "saklanan parça YOK OLMAMALI — sahiplik durur (iz bırakır)");
            Assert.That(eng.SakoRecover() && s.SakoHidden == null, Is.True,
                "Saklambaç kazanımı: parça geri dönmeli");
            Assert.That(eng.SakoRecover(), Is.False, "saklı parça yokken sakoRecover false olmalı");

            // Çayıra dönüş + çayır havuzu hâlâ temiz — js satır 559-566
            Assert.That(eng.SetBiome("cayir") && s.ActiveBiome == "cayir", Is.True, "çayıra dönülebilmeli");
            var ormanKacak = 0;
            for (var i = 0; i < 50; i++)
            {
                TekYumurtaKur(eng);
                var r2 = gacha.OpenEgg();
                var biome = (r2.Error == null && r2.Pufi != null && !string.IsNullOrEmpty(r2.Pufi.Biome))
                    ? r2.Pufi.Biome : "cayir";
                if (r2.Error == null && biome != "cayir") ormanKacak += 1;
            }
            Assert.That(ormanKacak, Is.EqualTo(0), "çayır havuzu da sızdırmamalı (50 açılış)");
        }
    }
}
