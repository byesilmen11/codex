using System;
using System.Collections.Generic;
using NUnit.Framework;
using Yuvo.Core;

namespace Yuvo.Core.Tests
{
    /* İçerik (statik veri) asertleri — tools/proto-engine-test.mjs "Veri kontrolleri",
       "Ambalaj / ritüel verisi" ve "v3: mağaza verisi" bölümlerinin çevirisi.
       İçerik Fixtures.LoadContent() ile yüklenir (Fixtures.cs ayrı iş paketi);
       ritual.json "engine"/"gacha" bölümleri sabit çapraz-doğrulama için
       Fixtures.EngineConstants / Fixtures.GachaConstants'tan okunur. */

    [TestFixture]
    public class ContentTests
    {
        private GameContent _c;

        [OneTimeSetUp]
        public void Setup()
        {
            _c = Fixtures.LoadContent(); // EngineConstants/GachaConstants da burada dolar
        }

        // js RANK tablosu (proto-engine-test.mjs satır 36) — burada yalnız anahtar doğrulaması için.
        private static readonly string[] RarityKeys =
            { "yaygin", "azbulunur", "nadir", "destansi", "efsanevi", "gizli" };

        // proto-engine-test.mjs satır 45-53: 62 Pufi, biyom başına 31 ve 12/9/6/2/1/1 dağılımı
        [Test]
        public void PufiSayisiVeBiyomDagilimi()
        {
            Assert.That(_c.Pufis.Count, Is.EqualTo(62),
                $"62 Pufi kaydı — Çayır 31 + Orman 31 (ölçülen {_c.Pufis.Count})");

            foreach (var biyom in new[] { "cayir", "orman" })
            {
                var dagilim = new Dictionary<string, int>();
                var toplam = 0;
                foreach (var p in _c.Pufis)
                {
                    // js: (p.biome || 'cayir') — boş biyom çayır sayılır
                    var b = string.IsNullOrEmpty(p.Biome) ? "cayir" : p.Biome;
                    if (b != biyom) continue;
                    toplam += 1;
                    dagilim.TryGetValue(p.Rarity, out var n);
                    dagilim[p.Rarity] = n + 1;
                }
                int D(string k) { dagilim.TryGetValue(k, out var v); return v; }
                Assert.That(toplam, Is.EqualTo(31), $"{biyom}: 31 kayıt bekleniyor (ölçülen {toplam})");
                Assert.That(D("yaygin"), Is.EqualTo(12), $"{biyom}: 12 yaygın bekleniyor");
                Assert.That(D("azbulunur"), Is.EqualTo(9), $"{biyom}: 9 az bulunur bekleniyor");
                Assert.That(D("nadir"), Is.EqualTo(6), $"{biyom}: 6 nadir bekleniyor");
                Assert.That(D("destansi"), Is.EqualTo(2), $"{biyom}: 2 destansı bekleniyor");
                Assert.That(D("efsanevi"), Is.EqualTo(1), $"{biyom}: 1 efsanevi bekleniyor");
                Assert.That(D("gizli"), Is.EqualTo(1), $"{biyom}: 1 gizli bekleniyor");
            }
        }

        // proto-engine-test.mjs satır 54-56: id/kind benzersiz, zorunlu alanlar dolu
        [Test]
        public void IdVeKindBenzersizAlanlarDolu()
        {
            var ids = new HashSet<string>();
            var kinds = new HashSet<string>();
            foreach (var p in _c.Pufis)
            {
                ids.Add(p.Id);
                kinds.Add(p.Kind);
                Assert.That(!string.IsNullOrEmpty(p.Id) && !string.IsNullOrEmpty(p.Ad) &&
                            !string.IsNullOrEmpty(p.Tur) && !string.IsNullOrEmpty(p.Kind) &&
                            !string.IsNullOrEmpty(p.Bio) && _c.Rarities.ContainsKey(p.Rarity),
                    Is.True, $"her kayıtta id/ad/tur/kind/bio/rarity dolu olmalı (bozuk kayıt: {p.Id})");
            }
            Assert.That(ids.Count, Is.EqualTo(62), $"id'ler benzersiz (62) — ölçülen {ids.Count}");
            Assert.That(kinds.Count, Is.EqualTo(62), $"kind'ler benzersiz (62) — ölçülen {kinds.Count}");
        }

        // proto-engine-test.mjs satır 40-42: rarite oranları toplamı 1 (1e-9 tolerans)
        [Test]
        public void OranToplamiBir()
        {
            double oranToplam = 0;
            foreach (var kv in _c.Rarities) oranToplam += kv.Value.Oran;
            Assert.That(Math.Abs(oranToplam - 1), Is.LessThan(1e-9),
                $"oran toplamı 1 olmalı (ölçülen {oranToplam})");
            foreach (var k in RarityKeys)
                Assert.That(_c.Rarities.ContainsKey(k), Is.True, $"rarite tanımı eksik: {k}");
        }

        // proto-engine-test.mjs satır 59-62: 6 ambalaj serisi, seri başına 8 varyant
        [Test]
        public void AmbalajSerileri()
        {
            Assert.That(_c.SeriesKeys.Count, Is.EqualTo(6),
                $"6 ambalaj serisi bekleniyor (ölçülen {_c.SeriesKeys.Count})");
            Assert.That(_c.WrapperVariants, Is.EqualTo(8), "seri başına 8 varyant bekleniyor");
            var benzersiz = new HashSet<string>(_c.SeriesKeys);
            Assert.That(benzersiz.Count, Is.EqualTo(6), "seri anahtarları benzersiz olmalı");
        }

        // proto-engine-test.mjs satır 340-352: merdiven 6 kademe, birim fiyat tekdüze iner,
        // Hoş Geldin Sepeti tekSeferlik + 5 adet (merdiven dışı).
        [Test]
        public void PaketMerdiveniVeHosgeldin()
        {
            var merdiven = new List<PackDef>();
            foreach (var p in _c.Packs) if (!p.TekSeferlik) merdiven.Add(p);
            Assert.That(merdiven.Count, Is.EqualTo(6),
                $"6 paket kademesi bekleniyor (ölçülen {merdiven.Count})");

            // js satır 343-347: birim fiyat bir öncekinden yüksekse (1e-9 tolerans) merdiven bozuk
            for (var i = 1; i < merdiven.Count; i++)
            {
                var birim = merdiven[i].Tl / merdiven[i].Adet;
                var onceki = merdiven[i - 1].Tl / merdiven[i - 1].Adet;
                Assert.That(birim, Is.LessThanOrEqualTo(onceki + 1e-9),
                    $"birim fiyat merdiveni tekdüze inmeli (₺9,99 → ₺2,00); bozulan kademe: {merdiven[i].Id}");
            }

            var hosg = _c.PackById("hosgeldin");
            Assert.That(hosg, Is.Not.Null, "Hoş Geldin Sepeti (hosgeldin) tanımlı olmalı");
            Assert.That(hosg.TekSeferlik, Is.True, "Hoş Geldin Sepeti tekSeferlik bayraklı olmalı (merdiven dışı)");
            Assert.That(hosg.Adet, Is.EqualTo(5), "Hoş Geldin Sepeti 5 adet olmalı");
            Assert.That(hosg.Tl, Is.GreaterThan(0), "Hoş Geldin Sepeti fiyatı sayısal ve pozitif olmalı");

            foreach (var p in _c.Packs)
                Assert.That(!string.IsNullOrEmpty(p.Id) && !string.IsNullOrEmpty(p.Ad) && p.Adet > 0 && p.Tl > 0,
                    Is.True, $"her pakette id/ad/adet/tl dolu olmalı (bozuk paket: {p.Id})");
        }

        // proto-engine-test.mjs satır 63-67: RITUAL sabitleri §5.2 ile birebir
        // (RitualDef alanları — Fixtures ritual.json "ritual" bölümünden doldurur).
        [Test]
        public void RitualSabitleri()
        {
            var rt = _c.Ritual;
            Assert.That(rt.GoldenOran, Is.EqualTo(0.02), "RITUAL.GOLDEN_ORAN 0.02 olmalı (§5.2)");
            Assert.That(rt.GoldenHard, Is.EqualTo(40), "RITUAL.GOLDEN_HARD 40 olmalı (§5.2)");
            Assert.That(rt.KumbaraEsik, Is.EqualTo(15), "RITUAL.KUMBARA_ESIK 15 olmalı (§5.2)");
            Assert.That(rt.KumbaraGunluk, Is.EqualTo(1), "RITUAL.KUMBARA_GUNLUK 1 olmalı (§5.2)");
            Assert.That(rt.IsirikYildiz, Is.EqualTo(2), "RITUAL.ISIRIK_YILDIZ 2 olmalı (§5.2)");
            Assert.That(rt.CikolataYildizTavan, Is.EqualTo(40), "RITUAL.CIKOLATA_YILDIZ_TAVAN 40 olmalı (§5.2)");
        }

        // Sözleşme: ritual.json "engine"/"gacha" bölümleri C# motor sabitleriyle çapraz-doğrulanır.
        // StateEngine/GachaEngine sabitleri public const OLMADIĞINDAN sözleşmedeki değerler
        // burada LİTERAL yazılmıştır (sözleşme "Sabitler" bölümü + gacha.js satır 7-15).
        [Test]
        public void RitualJsonEngineVeGachaSabitleri()
        {
            var engine = Fixtures.EngineConstants;
            var gacha = Fixtures.GachaConstants;
            Assert.That(engine, Is.Not.Null, "ritual.json engine bölümü yüklenmiş olmalı (Fixtures.EngineConstants)");
            Assert.That(gacha, Is.Not.Null, "ritual.json gacha bölümü yüklenmiş olmalı (Fixtures.GachaConstants)");

            // engine bölümü ↔ StateEngine sabitleri (state.js satır 7-14)
            Assert.That(engine["dailyEggs"], Is.EqualTo(3), "engine.dailyEggs = DAILY_EGGS = 3 olmalı");
            Assert.That(engine["eggStackMax"], Is.EqualTo(9), "engine.eggStackMax = EGG_STACK_MAX = 9 olmalı");
            Assert.That(engine["streakGoal"], Is.EqualTo(7), "engine.streakGoal = STREAK_GOAL = 7 olmalı");
            Assert.That(engine["streakKabuk"], Is.EqualTo(25), "engine.streakKabuk = STREAK_KABUK = 25 olmalı");
            Assert.That(engine["gorevAcHedef"], Is.EqualTo(3), "engine.gorevAcHedef = GOREV_AC_HEDEF = 3 olmalı");
            Assert.That(engine["gorevOyunHedef"], Is.EqualTo(1), "engine.gorevOyunHedef = GOREV_OYUN_HEDEF = 1 olmalı");
            Assert.That(engine["extraEggCost"], Is.EqualTo(120), "engine.extraEggCost = EXTRA_EGG_COST = 120 olmalı");
            Assert.That(engine["extraEggMax"], Is.EqualTo(2), "engine.extraEggMax = EXTRA_EGG_MAX = 2 olmalı");

            // gacha bölümü ↔ GachaEngine sabitleri (gacha.js satır 7-15)
            Assert.That(gacha["softPityE"], Is.EqualTo(35), "gacha.softPityE = SOFT_PITY_E = 35 olmalı");
            Assert.That(gacha["softArtis"], Is.EqualTo(0.06), "gacha.softArtis = SOFT_ARTIS = 0.06 olmalı");
            Assert.That(gacha["hardPityE"], Is.EqualTo(50), "gacha.hardPityE = HARD_PITY_E = 50 olmalı");
            Assert.That(gacha["pityDestansi"], Is.EqualTo(40), "gacha.pityDestansi = PITY_DESTANSI = 40 olmalı");
            Assert.That(gacha["pityNadir"], Is.EqualTo(15), "gacha.pityNadir = PITY_NADIR = 15 olmalı");
            Assert.That(gacha["onboarding"], Is.EqualTo(10), "gacha.onboarding = ONBOARDING = 10 olmalı");
            Assert.That(gacha["kopyaSeriEsigi"], Is.EqualTo(6), "gacha.kopyaSeriEsigi = KOPYA_SERI_ESIGI = 6 olmalı");
            Assert.That(gacha["wEksik"], Is.EqualTo(4), "gacha.wEksik = W_EKSIK = 4 olmalı");
            Assert.That(gacha["wEksikSon3"], Is.EqualTo(12), "gacha.wEksikSon3 = W_EKSIK_SON3 = 12 olmalı");
        }
    }
}
