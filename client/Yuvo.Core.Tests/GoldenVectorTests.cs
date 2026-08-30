using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using NUnit.Framework;
using Yuvo.Core;

namespace Yuvo.Core.Tests
{
    /* Altın vektör testleri — tools/export-golden-vectors.mjs çıktılarının (content/golden/*.json)
       C# GachaEngine tarafından BİT DÜZEYİNDE yeniden üretildiğini doğrular (PORT-CONTRACT
       §"Test fikstürleri", docs/v2/07 §3). Vektör alanları:
         [rarity, pufiId, isNew(0|1), golden(0|1), pityN, pityD, pityE, copyStreak]
       pity/copyStreak = AÇILIŞTAN SONRAKİ sayaç durumu. */
    [TestFixture]
    public class GoldenVectorTests
    {
        // 5 altın senaryo dosyası — content/golden/ altından, ada göre sıralı taranır.
        public static IEnumerable<string> GoldenFiles()
        {
            var dir = Path.Combine(Fixtures.RepoRoot(), "content", "golden");
            var files = Directory.GetFiles(dir, "*.json");
            Array.Sort(files, StringComparer.Ordinal);
            foreach (var f in files) yield return Path.GetFileName(f);
        }

        [TestCaseSource(nameof(GoldenFiles))]
        public void AltinVektorler(string dosyaAdi)
        {
            var content = Fixtures.LoadContent();

            // Tohumsuz rastgele: golden yolunda zaten ÇAĞRILMAMALI (gacha çekilişleri yalnız
            // Rng.Next kullanır — sözleşme §6); deterministik sabit veriyoruz ki kaçak bir
            // Math.random kullanımı vektörleri bozup kendini belli etsin.
            var engine = new StateEngine(content, unseededRandom: () => 0.5);

            var yol = Path.Combine(Fixtures.RepoRoot(), "content", "golden", dosyaAdi);
            using var doc = JsonDocument.Parse(File.ReadAllText(yol));
            var root = doc.RootElement;

            var seed = root.GetProperty("seed").GetInt32();
            engine.Reset((uint)seed);

            // --- kurulum: owned (JSON belge SIRASIYLA — Dictionary ekleme sırası korunur),
            //     eggCounter / ormanAcik / activeBiome varsa uygulanır ---
            var kurulum = root.GetProperty("kurulum");
            if (kurulum.TryGetProperty("owned", out var owned))
            {
                foreach (var p in owned.EnumerateObject())
                    engine.S.Owned[p.Name] = p.Value.GetInt32();
            }
            if (kurulum.TryGetProperty("eggCounter", out var ec))
                engine.S.EggCounter = ec.GetInt32();
            if (kurulum.TryGetProperty("ormanAcik", out var oa))
                engine.S.OrmanAcik = oa.GetBoolean();
            if (kurulum.TryGetProperty("activeBiome", out var ab))
                engine.S.ActiveBiome = ab.GetString();

            // GachaEngine senaryo başına BİR kez kurulur (forceGoldenNext durumu taşınmasın).
            var gacha = new GachaEngine(engine);

            var vektorler = root.GetProperty("vektorler");
            int indeks = 0;
            foreach (var v in vektorler.EnumerateArray())
            {
                // Her açılış için tek sabit yumurta: Golden=null → altın çekilişi açılışta
                // yapılır (dürüstlük kuralı), Rng tüketim sırası vektörlerle aynı kalır.
                engine.S.TodayEggs = new List<Egg>
                {
                    new Egg { Seri = "gunesbahcesi", Variant = 0, Golden = null }
                };
                engine.S.EggsAvailable = 1;

                var r = gacha.OpenEgg();
                if (r == null || r.Error != null)
                {
                    Assert.Fail($"{dosyaAdi} vektör #{indeks}: OpenEgg hata döndü " +
                                $"(Error={(r == null ? "null sonuç" : r.Error)}).");
                }

                // Beklenen dizilim (golden dosya şeması, sabit 8 alan).
                string bRarity = v[0].GetString();
                string bPufiId = v[1].GetString();
                int bIsNew = v[2].GetInt32();
                int bGolden = v[3].GetInt32();
                int bPityN = v[4].GetInt32();
                int bPityD = v[5].GetInt32();
                int bPityE = v[6].GetInt32();
                int bCopy = v[7].GetInt32();

                // Ölçülen dizilim: sonuç + AÇILIŞTAN SONRAKİ sayaç durumu.
                string oRarity = r.Rarity;
                string oPufiId = r.Pufi != null ? r.Pufi.Id : null;
                int oIsNew = r.IsNew ? 1 : 0;
                int oGolden = (r.Wrapper != null && r.Wrapper.Golden) ? 1 : 0;
                int oPityN = engine.S.PityN;
                int oPityD = engine.S.PityD;
                int oPityE = engine.S.PityE;
                int oCopy = engine.S.CopyStreak;

                bool esit = bRarity == oRarity && bPufiId == oPufiId &&
                            bIsNew == oIsNew && bGolden == oGolden &&
                            bPityN == oPityN && bPityD == oPityD &&
                            bPityE == oPityE && bCopy == oCopy;

                if (!esit)
                {
                    // İLK uyuşmazlıkta dur: indeks + beklenen + ölçülen TAM dizilim.
                    Assert.Fail(
                        $"{dosyaAdi} vektör #{indeks} UYUŞMAZLIK\n" +
                        $"  beklenen: [{bRarity},{bPufiId},{bIsNew},{bGolden},{bPityN},{bPityD},{bPityE},{bCopy}]\n" +
                        $"  ölçülen : [{oRarity},{oPufiId},{oIsNew},{oGolden},{oPityN},{oPityD},{oPityE},{oCopy}]");
                }

                indeks++;
            }

            // Dosyadaki "adet" ile gerçekten koşulan vektör sayısı tutarlı mı?
            if (root.TryGetProperty("adet", out var adet))
            {
                Assert.That(indeks, Is.EqualTo(adet.GetInt32()),
                    $"{dosyaAdi}: 'adet' alanı ile vektör sayısı uyuşmuyor.");
            }

            TestContext.Out.WriteLine($"{dosyaAdi}: {indeks} vektörün tamamı birebir doğrulandı.");
        }
    }
}
