using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using NUnit.Framework;
using Yuvo.Core;

namespace Yuvo.Core.Tests
{
    /* SaveTests — SaveService katmanı testleri (PORT-CONTRACT.md EK "SaveTests.cs kapsamı").
       - MigrationGolden: content/golden/migration/*.json fikstürleri (tools/export-migration-
         fixtures.mjs çıktısı, state.js load() satır ~168-280'in gerçek çıktıları) C#
         SaveCodec.Load tarafından bire bir yeniden üretilmeli.
       - RoundTrip: ToSave → Write → Parse → Load → ToSave sabit noktası.
       - SaveService: çift yuvalı zarf senaryoları (1-6).
       - Fuzz: 200 çöp girdi; Parse+Load asla fırlatmaz, sonuç state değişmezleri korunur.
       InMemorySaveStore/FileSaveStore BURADA tanımlıdır — Core'a dosya kodu GİRMEZ (EK kuralı). */

    /* Bellek deposu: yuva → içerik sözlüğü. Yuvalar alanı testlerin zarfı elle bozabilmesi
       için açık bırakılmıştır (senaryo 3-5). */
    internal sealed class InMemorySaveStore : ISaveStore
    {
        public readonly Dictionary<string, string> Yuvalar = new Dictionary<string, string>();

        public string ReadSlot(string slot)
        {
            return Yuvalar.TryGetValue(slot, out var v) ? v : null;
        }

        public bool WriteSlot(string slot, string content)
        {
            Yuvalar[slot] = content;
            return true;
        }
    }

    /* Dosya deposu: sözleşme EK gereği ATOMİK yazım uygulamanın işidir — önce temp dosyaya
       yazılır, sonra File.Move(temp, hedef, overwrite:true) ile tek adımda değiştirilir.
       Hata fırlatılmaz (ISaveStore sözleşmesi): okunamayan yuva null, yazılamayan yuva false. */
    internal sealed class FileSaveStore : ISaveStore
    {
        private readonly string _dir;

        public FileSaveStore(string dir)
        {
            _dir = dir;
        }

        public string SlotPath(string slot)
        {
            return Path.Combine(_dir, "yuva-" + slot + ".json");
        }

        public string ReadSlot(string slot)
        {
            try
            {
                var yol = SlotPath(slot);
                return File.Exists(yol) ? File.ReadAllText(yol) : null;
            }
            catch
            {
                return null;
            }
        }

        public bool WriteSlot(string slot, string content)
        {
            try
            {
                Directory.CreateDirectory(_dir);
                var hedef = SlotPath(slot);
                var temp = hedef + ".tmp";
                File.WriteAllText(temp, content);
                File.Move(temp, hedef, true); // atomik değiştirme: yarıda kesilse hedef eski hâliyle kalır
                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    [TestFixture]
    public class SaveTests
    {
        // Fikstür sandbox sabitleri (export-migration-fixtures.mjs _meta.stub ile aynı):
        // Date sabit 2026-01-15 → Date.now=1768435200000, monthKey="2026-01".
        private const long SabitNowMs = 1768435200000L;
        private const string SabitAy = "2026-01";

        /* Deterministik motor: UnseededRandom = Rng.Next(akış) — akış nesnesi motor
           kurulumundan ÖNCE yaratılır, çünkü StateEngine ctor'u Reset(null) çağırır ve
           4 random TÜKETİR (state.js modül yüklenirken Yuvo.engine.state=defaults() bir kez
           koşar: 1 freshSeed + 3 variant; C# ctor'daki Reset buna denk gelir). */
        private static StateEngine MotorKur(uint rngTohum = 42, long nowMs = SabitNowMs)
        {
            var akis = new GameState { Seed = rngTohum };
            return new StateEngine(Fixtures.LoadContent(),
                unseededRandom: () => Rng.Next(akis),
                nowMs: () => nowMs,
                monthKeyFn: () => SabitAy);
        }

        /* ---------- özyineli ilk-fark bulucu ---------- */

        private static string Goster(SaveValue v)
        {
            return v == null ? "(alan yok)" : JsonCodec.Write(v);
        }

        // beklenen ↔ ölçülen ağaçlarındaki İLK farkın yol adını ve iki değeri döndürür;
        // eşitse null. Obj karşılaştırması DeepEquals gibi SIRA BAĞIMSIZDIR.
        private static string IlkFark(SaveValue beklenen, SaveValue olculen, string yol)
        {
            if (SaveValue.DeepEquals(beklenen, olculen)) return null;
            var kok = yol.Length == 0 ? "(kök)" : yol;
            if (beklenen == null || olculen == null || beklenen.K != olculen.K)
                return $"{kok}: tür/değer farkı — beklenen {Goster(beklenen)}, ölçülen {Goster(olculen)}";

            switch (beklenen.K)
            {
                case SaveValue.Kind.Arr:
                    {
                        var bn = beklenen.Items?.Count ?? 0;
                        var on = olculen.Items?.Count ?? 0;
                        if (bn != on)
                            return $"{kok}: dizi uzunluğu farklı — beklenen {bn}, ölçülen {on}";
                        for (var i = 0; i < bn; i++)
                        {
                            var f = IlkFark(beklenen.Items[i], olculen.Items[i], $"{yol}[{i}]");
                            if (f != null) return f;
                        }
                        return $"{kok}: dizi farkı (beklenmeyen durum)";
                    }
                case SaveValue.Kind.Obj:
                    {
                        if (beklenen.Props != null)
                        {
                            foreach (var kv in beklenen.Props)
                            {
                                var alanYolu = yol.Length == 0 ? kv.Key : yol + "." + kv.Key;
                                var ov = olculen.Get(kv.Key);
                                if (ov == null)
                                    return $"{alanYolu}: ölçülende alan YOK — beklenen {Goster(kv.Value)}";
                                var f = IlkFark(kv.Value, ov, alanYolu);
                                if (f != null) return f;
                            }
                        }
                        if (olculen.Props != null)
                        {
                            foreach (var kv in olculen.Props)
                            {
                                if (beklenen.Get(kv.Key) == null)
                                {
                                    var alanYolu = yol.Length == 0 ? kv.Key : yol + "." + kv.Key;
                                    return $"{alanYolu}: beklenende olmayan FAZLA alan — ölçülen {Goster(kv.Value)}";
                                }
                            }
                        }
                        return $"{kok}: nesne farkı (beklenmeyen durum)";
                    }
                default:
                    return $"{kok}: değer farkı — beklenen {Goster(beklenen)}, ölçülen {Goster(olculen)}";
            }
        }

        private static void DeepEsitOlmali(SaveValue beklenen, SaveValue olculen, string baglam)
        {
            if (!SaveValue.DeepEquals(beklenen, olculen))
                Assert.Fail($"{baglam}: durum ağaçları eşit değil.\n  İLK fark → {IlkFark(beklenen, olculen, "")}");
        }

        /* =====================================================================
           MigrationGolden — state.js load() altın fikstürleri
           ===================================================================== */

        public static IEnumerable<string> MigrasyonDosyalari()
        {
            var dir = Path.Combine(Fixtures.RepoRoot(), "content", "golden", "migration");
            var dosyalar = Directory.GetFiles(dir, "*.json");
            Array.Sort(dosyalar, StringComparer.Ordinal);
            foreach (var d in dosyalar) yield return Path.GetFileName(d);
        }

        [TestCaseSource(nameof(MigrasyonDosyalari))]
        public void MigrationGolden(string dosyaAdi)
        {
            var yol = Path.Combine(Fixtures.RepoRoot(), "content", "golden", "migration", dosyaAdi);
            // Fikstür de kendi kodeğimizle okunur: beklenen ağaç doğrudan SaveValue olur,
            // karşılaştırma köprüsüz DeepEquals ile yapılır.
            var fx = JsonCodec.Parse(File.ReadAllText(yol));
            Assert.That(fx != null && fx.IsObj, Is.True,
                $"{dosyaAdi}: fikstür dosyası JSON nesnesi olarak okunamadı.");

            var tohumSv = fx.Get("rngTohum");
            Assert.That(tohumSv != null && tohumSv.IsNum, Is.True,
                $"{dosyaAdi}: 'rngTohum' alanı eksik ya da sayı değil.");
            var aySv = fx.Get("sabitAy");
            Assert.That(aySv != null && aySv.IsStr, Is.True,
                $"{dosyaAdi}: 'sabitAy' alanı eksik ya da string değil.");
            var beklenen = fx.Get("beklenen");
            Assert.That(beklenen != null && beklenen.IsObj, Is.True,
                $"{dosyaAdi}: 'beklenen' state nesnesi eksik.");

            // girdi: string (localStorage içeriği) ya da null (boş depo vakası).
            var girdiSv = fx.Get("girdi");
            var girdi = (girdiSv != null && girdiSv.IsStr) ? girdiSv.S : null;

            // RNG akışı motordan ÖNCE: ctor'daki Reset(null) JS sandbox'ın modül-yükleme
            // defaults() tüketimine (4 random) denk düşer; Load içindeki Reset(null) ise
            // JS load() satır 174'teki defaults()'a. Ay ve Date.now fikstür stub'ıyla aynı
            // sabitlenir (nowMs, boş-depo vakasında freshSeed'in bit eşleşmesi için gerekli).
            var akis = new GameState { Seed = (uint)tohumSv.N };
            var ay = aySv.S;
            var motor = new StateEngine(Fixtures.LoadContent(),
                unseededRandom: () => Rng.Next(akis),
                nowMs: () => SabitNowMs,
                monthKeyFn: () => ay);

            // JSON.parse başarısızlığı (cop-json) ve boş depo (bos-depo) aynı kapıya çıkar:
            // Parse null döner, Load temiz kurulum yolunu izler (state.js satır ~170 catch).
            var saved = JsonCodec.Parse(girdi);
            var s = SaveCodec.Load(motor, saved);
            Assert.That(ReferenceEquals(s, motor.S), Is.True,
                $"{dosyaAdi}: Load dönen state ile motor.S aynı nesne olmalı.");

            DeepEsitOlmali(beklenen, SaveCodec.ToSave(motor.S), dosyaAdi);
        }

        /* =====================================================================
           RoundTrip — ToSave → Write → Parse → Load → ToSave sabit noktası
           ===================================================================== */

        [Test]
        public void RoundTrip_KayitYazOkuYenidenKaydetBirebir()
        {
            // Küçük NowMs bilinçli: load() wish onarımı ts'i JS `|0` ile int32'ye sarar
            // (state.js satır ~243) — gerçek ms damgası sarımda 0'a kırpılıp turu bozardı.
            var motor = MotorKur(nowMs: 123456L);
            motor.Reset(9001);

            // Birkaç mutasyon: openEgg×2, addWish, kuluckaBirak, buyPack (sözleşme EK).
            var gacha = new GachaEngine(motor);
            var a1 = gacha.OpenEgg();
            Assert.That(a1 != null && a1.Error == null, Is.True, "RoundTrip: 1. openEgg hata döndürdü.");
            var a2 = gacha.OpenEgg();
            Assert.That(a2 != null && a2.Error == null, Is.True, "RoundTrip: 2. openEgg hata döndürdü.");
            Assert.That(motor.AddWish(motor.Content.Pufis[0].Id), Is.True,
                "RoundTrip: addWish beklenmedik biçimde reddedildi.");
            Assert.That(motor.KuluckaBirak(), Is.True,
                "RoundTrip: kuluckaBirak beklenmedik biçimde reddedildi.");
            var alim = motor.BuyPack(motor.Content.Packs[0].Id);
            Assert.That(alim.Ok, Is.True, $"RoundTrip: buyPack reddedildi (Reason={alim.Reason}).");

            // Karar: Load migrasyonu version'ı 3 damgalar (state.js satır 272); karşılaştırma
            // sürüm farkına takılmasın diye kayıt öncesi 3'e çekilir — JS'te de kalıcı
            // kayıtlar hep load()'dan geçmiş (v3) hâlde durur.
            motor.S.Version = 3;

            var kayit1 = SaveCodec.ToSave(motor.S);
            var json = JsonCodec.Write(kayit1);
            var geri = JsonCodec.Parse(json);
            Assert.That(geri, Is.Not.Null, "RoundTrip: kendi yazdığımız kayıt JSON'u geri parse edilemedi.");

            // Load öncesi motor TAZE kurulur — orijinal motorun rastgelelik akışına dokunulmaz.
            var motor2 = MotorKur(nowMs: 123456L);
            SaveCodec.Load(motor2, geri);

            DeepEsitOlmali(kayit1, SaveCodec.ToSave(motor2.S), "RoundTrip");
        }

        /* =====================================================================
           SaveService yuva senaryoları (1-6)
           ===================================================================== */

        // (1) InMemory Save→Load round-trip: yazılan state ikinci motora bire bir taşınmalı.
        [Test]
        public void SaveService_1_InMemoryRoundTrip()
        {
            var store = new InMemorySaveStore();
            var motor = MotorKur(nowMs: 123456L);
            motor.Reset(4321);
            motor.AddStardust(25);                 // 40 → 65
            motor.BankChocolate();                 // chocolates 1, lastChocolateChoice "biriktir"
            Assert.That(motor.KuluckaBirak(), Is.True, "Senaryo 1: kuluckaBirak reddedildi.");
            motor.S.Version = 3;                   // bkz. RoundTrip karar notu

            var svc = new SaveService(store, motor);
            Assert.That(svc.Save(), Is.True, "Senaryo 1: Save başarısız oldu.");
            Assert.That(svc.LastSlot, Is.EqualTo("a"), "Senaryo 1: ilk kayıt 'a' yuvasına gitmeliydi.");
            Assert.That(svc.LastSira, Is.EqualTo(1), "Senaryo 1: ilk kaydın sırası 1 olmalıydı.");

            var motor2 = MotorKur(nowMs: 123456L);
            var svc2 = new SaveService(store, motor2);
            Assert.That(svc2.Load(), Is.True, "Senaryo 1: Load geçerli yuvayı bulamadı.");
            Assert.That(svc2.LastSlot, Is.EqualTo("a"), "Senaryo 1: Load 'a' yuvasını seçmeliydi.");

            DeepEsitOlmali(SaveCodec.ToSave(motor.S), SaveCodec.ToSave(motor2.S), "Senaryo 1 (InMemory round-trip)");
        }

        // (2) Dönüşümlü yuva: iki Save → önce "a" (sira 1), sonra "b" (sira 2); ikisi de dolu.
        [Test]
        public void SaveService_2_DonusumluYuvaSira()
        {
            var store = new InMemorySaveStore();
            var motor = MotorKur(nowMs: 123456L);
            motor.Reset(4321);
            var svc = new SaveService(store, motor);

            Assert.That(svc.Save(), Is.True, "Senaryo 2: 1. Save başarısız.");
            Assert.That(svc.LastSlot, Is.EqualTo("a"), "Senaryo 2: 1. kayıt 'a' yuvasına gitmeliydi.");
            Assert.That(svc.LastSira, Is.EqualTo(1), "Senaryo 2: 1. kaydın sırası 1 olmalıydı.");

            motor.AddStardust(10);
            Assert.That(svc.Save(), Is.True, "Senaryo 2: 2. Save başarısız.");
            Assert.That(svc.LastSlot, Is.EqualTo("b"), "Senaryo 2: 2. kayıt son geçerli yuvanın TERSİNE ('b') gitmeliydi.");
            Assert.That(svc.LastSira, Is.EqualTo(2), "Senaryo 2: 2. kaydın sırası 2 olmalıydı.");

            Assert.That(store.Yuvalar.ContainsKey("a") && store.Yuvalar.ContainsKey("b"), Is.True,
                "Senaryo 2: iki Save sonrası hem 'a' hem 'b' yuvası dolu olmalı.");

            // Zarf biçimi denetimi: surum=1, sira 1/2, sum 8 haneli hex.
            foreach (var (yuva, sira) in new[] { ("a", 1d), ("b", 2d) })
            {
                var zarf = JsonCodec.Parse(store.Yuvalar[yuva]);
                Assert.That(zarf != null && zarf.IsObj, Is.True, $"Senaryo 2: '{yuva}' zarfı parse edilemedi.");
                Assert.That(zarf.Get("surum")?.N, Is.EqualTo(1d), $"Senaryo 2: '{yuva}' zarf sürümü 1 olmalı.");
                Assert.That(zarf.Get("sira")?.N, Is.EqualTo(sira), $"Senaryo 2: '{yuva}' zarf sırası {sira} olmalı.");
                var sum = zarf.Get("sum");
                Assert.That(sum != null && sum.IsStr && sum.S.Length == 8, Is.True,
                    $"Senaryo 2: '{yuva}' zarfının sum alanı 8 haneli hex olmalı.");
                Assert.That(zarf.Get("kayit")?.IsObj, Is.EqualTo(true),
                    $"Senaryo 2: '{yuva}' zarfında kayit nesnesi olmalı.");
            }
        }

        // (3) Bozuk son yuva → önceki sağlam yuvaya düşülür (b elle bozulur, Load a'yı seçer).
        [Test]
        public void SaveService_3_BozukSonYuvaOncekineDuser()
        {
            var store = new InMemorySaveStore();
            var motor = MotorKur(nowMs: 123456L);
            motor.Reset(4321);
            motor.S.Version = 3;
            var svc = new SaveService(store, motor);

            Assert.That(svc.Save(), Is.True, "Senaryo 3: 1. Save başarısız.");   // a, sira 1, stardust 40
            motor.AddStardust(10);                                                // 50
            Assert.That(svc.Save(), Is.True, "Senaryo 3: 2. Save başarısız.");   // b, sira 2

            store.Yuvalar["b"] = "{{tamamen çöp — parse edilemez";               // son yuva bozuldu

            var motor2 = MotorKur(nowMs: 123456L);
            var svc2 = new SaveService(store, motor2);
            Assert.That(svc2.Load(), Is.True, "Senaryo 3: sağlam 'a' yuvası dururken Load başarısız olmamalı.");
            Assert.That(svc2.LastSlot, Is.EqualTo("a"), "Senaryo 3: bozuk 'b' yerine 'a' seçilmeliydi.");
            Assert.That(svc2.LastSira, Is.EqualTo(1), "Senaryo 3: 'a' yuvasının sırası (1) raporlanmalıydı.");
            Assert.That(motor2.S.Stardust, Is.EqualTo(40),
                "Senaryo 3: önceki sağlam kayıttaki stardust (40) yüklenmeliydi — bozuk 'b' (50) değil.");
        }

        // (4) Sum ihlali: kayit içinde 1 karakter oynatılır → o yuva reddedilir, öbürü yüklenir.
        [Test]
        public void SaveService_4_SumIhlaliYuvayiReddeder()
        {
            var store = new InMemorySaveStore();
            var motor = MotorKur(nowMs: 123456L);
            motor.Reset(4321);
            motor.S.Version = 3;
            var svc = new SaveService(store, motor);

            Assert.That(svc.Save(), Is.True, "Senaryo 4: 1. Save başarısız.");   // a: stardust 40
            motor.AddStardust(10);                                                // 50
            Assert.That(svc.Save(), Is.True, "Senaryo 4: 2. Save başarısız.");   // b: stardust 50

            // Zarf sağlam JSON kalır ama kayit içeriği 1 karakter oynar → sum artık tutmaz.
            var ham = store.Yuvalar["b"];
            var kurcalanmis = ham.Replace("\"stardust\":50", "\"stardust\":51");
            Assert.That(kurcalanmis, Is.Not.EqualTo(ham),
                "Senaryo 4 test kurgusu: 'b' zarfında \"stardust\":50 bulunamadı — kurcalama uygulanamadı.");
            store.Yuvalar["b"] = kurcalanmis;

            var motor2 = MotorKur(nowMs: 123456L);
            var svc2 = new SaveService(store, motor2);
            Assert.That(svc2.Load(), Is.True, "Senaryo 4: sum'u tutan 'a' yuvası dururken Load başarısız olmamalı.");
            Assert.That(svc2.LastSlot, Is.EqualTo("a"), "Senaryo 4: sum ihlalli 'b' reddedilip 'a' seçilmeliydi.");
            Assert.That(motor2.S.Stardust, Is.EqualTo(40),
                "Senaryo 4: kurcalanmış kayıt (51) DEĞİL, sağlam 'a' kaydındaki stardust (40) yüklenmeliydi.");
        }

        // (5) İki yuva da çöp → Load false döner ve S'e HİÇ dokunulmaz.
        [Test]
        public void SaveService_5_IkiYuvaCopLoadFalseVeSDegismez()
        {
            var store = new InMemorySaveStore();
            store.Yuvalar["a"] = "bu bir JSON değil";
            store.Yuvalar["b"] = "{\"surum\":1,\"sira\":\"iki\"}";   // parse olur ama zarf geçersiz

            var motor = MotorKur(nowMs: 123456L);
            motor.Reset(4321);
            var oncekiS = motor.S;                                   // nesne kimliği korunmalı
            var oncekiKayit = SaveCodec.ToSave(motor.S);             // içerik anlık görüntüsü

            var svc = new SaveService(store, motor);
            Assert.That(svc.Load(), Is.False, "Senaryo 5: iki yuva da çöpken Load false dönmeliydi.");
            Assert.That(ReferenceEquals(motor.S, oncekiS), Is.True,
                "Senaryo 5: başarısız Load motor.S nesnesini DEĞİŞTİRMEMELİ.");
            DeepEsitOlmali(oncekiKayit, SaveCodec.ToSave(motor.S), "Senaryo 5 (S içeriği değişmemeli)");
            Assert.That(svc.LastSlot, Is.Null, "Senaryo 5: başarısız Load LastSlot'u doldurmamalı.");
            Assert.That(svc.LastSira, Is.EqualTo(0), "Senaryo 5: başarısız Load LastSira'yı (0) değiştirmemeli.");
        }

        // (6) FileSaveStore: temp dizinde gerçek dosya round-trip (temp+File.Move atomik
        //     değiştirme; üçüncü Save 'a' dosyasının üzerine Move-overwrite yolunu da dener).
        [Test]
        public void SaveService_6_FileStoreGercekDosyaRoundTrip()
        {
            var dizin = Path.Combine(Path.GetTempPath(), "yuvo-save-test-" + Guid.NewGuid().ToString("N"));
            try
            {
                var store = new FileSaveStore(dizin);
                var motor = MotorKur(nowMs: 123456L);
                motor.Reset(777);
                motor.AddStardust(60);                                // 100
                motor.S.Version = 3;
                var svc = new SaveService(store, motor);

                Assert.That(svc.Save(), Is.True, "Senaryo 6: 1. Save (dosya) başarısız.");    // a, sira 1
                motor.AddStardust(11);                                                         // 111
                Assert.That(svc.Save(), Is.True, "Senaryo 6: 2. Save (dosya) başarısız.");    // b, sira 2
                motor.AddStardust(11);                                                         // 122
                Assert.That(svc.Save(), Is.True, "Senaryo 6: 3. Save (dosya) başarısız.");    // a, sira 3 (overwrite)
                Assert.That(svc.LastSlot, Is.EqualTo("a"), "Senaryo 6: 3. kayıt yeniden 'a' yuvasına dönmeliydi.");
                Assert.That(svc.LastSira, Is.EqualTo(3), "Senaryo 6: 3. kaydın sırası 3 olmalıydı.");

                Assert.That(File.Exists(store.SlotPath("a")) && File.Exists(store.SlotPath("b")), Is.True,
                    "Senaryo 6: her iki yuva dosyası da diskte olmalı.");
                Assert.That(Directory.GetFiles(dizin, "*.tmp").Length, Is.EqualTo(0),
                    "Senaryo 6: atomik değiştirme sonrası geride .tmp dosyası kalmamalı.");

                var motor2 = MotorKur(nowMs: 123456L);
                var svc2 = new SaveService(store, motor2);
                Assert.That(svc2.Load(), Is.True, "Senaryo 6: dosyadan Load başarısız.");
                Assert.That(svc2.LastSira, Is.EqualTo(3), "Senaryo 6: en yüksek sıralı (3) kayıt seçilmeliydi.");
                Assert.That(motor2.S.Stardust, Is.EqualTo(122), "Senaryo 6: en taze kayıttaki stardust yüklenmeliydi.");
                DeepEsitOlmali(SaveCodec.ToSave(motor.S), SaveCodec.ToSave(motor2.S), "Senaryo 6 (dosya round-trip)");
            }
            finally
            {
                // Test sonunda temp dizini silinir (sözleşme EK); silinemezse test gürültüsüz geçer.
                try { if (Directory.Exists(dizin)) Directory.Delete(dizin, true); } catch { /* yoksay */ }
            }
        }

        /* =====================================================================
           Fuzz — 200 çöp girdi: Parse+Load asla fırlatmaz, state değişmezleri korunur
           ===================================================================== */

        [Test]
        public void Fuzz_ParseVeLoadAslaFirlatmazDegismezlerKorunur()
        {
            var rnd = new Random(4242);                       // sözleşme EK: sabit tohum 4242
            var motor = MotorKur(nowMs: 123456L);
            var tamJson = SaveCodec.ToJson(motor.S);          // kesik-JSON vakalarının kaynağı

            for (var i = 0; i < 200; i++)
            {
                var girdi = CopGirdiUret(rnd, i, tamJson);
                try
                {
                    // state.js load() zinciri: JSON.parse (catch'li) + onarım — hiçbir çöpte fırlamaz.
                    var parsed = JsonCodec.Parse(girdi);
                    SaveCodec.Load(motor, parsed);
                }
                catch (Exception ex)
                {
                    Assert.Fail($"Fuzz #{i}: Parse/Load fırlattı — {ex.GetType().Name}: {ex.Message}\n" +
                                $"  girdi (kısaltılmış): {Kisalt(girdi)}");
                }
                FuzzDegismezleriDenetle(motor.S, i, girdi);
            }
        }

        // Sonuç state her zaman oynanabilir olmalı (sözleşme EK "sonuç state değişmezleri").
        private static void FuzzDegismezleriDenetle(GameState s, int i, string girdi)
        {
            var tanim = $"Fuzz #{i} (girdi: {Kisalt(girdi)})";

            Assert.That(s.TodayEggs, Is.Not.Null, $"{tanim}: todayEggs null kalmamalı.");
            Assert.That(s.EggsAvailable, Is.EqualTo(s.TodayEggs.Count),
                $"{tanim}: eggsAvailable ile todayEggs.Count senkron değil (state.js satır 273 kuralı).");

            // Onarımlı sayaçlar asla negatif olamaz (JS max(0, x|0) desenleri).
            Assert.That(s.Chocolates, Is.GreaterThanOrEqualTo(0), $"{tanim}: chocolates negatif.");
            Assert.That(s.ChocolateStarsToday, Is.GreaterThanOrEqualTo(0), $"{tanim}: chocolateStarsToday negatif.");
            Assert.That(s.KumbaraToday, Is.GreaterThanOrEqualTo(0), $"{tanim}: kumbaraToday negatif.");
            Assert.That(s.GoldenPity, Is.GreaterThanOrEqualTo(0), $"{tanim}: goldenPity negatif.");
            Assert.That(s.Kiler, Is.Not.Null, $"{tanim}: kiler null kalmamalı.");
            Assert.That(s.Kiler.Adet, Is.GreaterThanOrEqualTo(0), $"{tanim}: kiler.adet negatif.");
            Assert.That(s.Kiler.BugunAcilan, Is.GreaterThanOrEqualTo(0), $"{tanim}: kiler.bugunAcilan negatif.");
            Assert.That(s.Gorevler, Is.Not.Null, $"{tanim}: gorevler null kalmamalı.");
            Assert.That(s.Gorevler.Ac, Is.GreaterThanOrEqualTo(0), $"{tanim}: gorevler.ac negatif.");
            Assert.That(s.Gorevler.Oyun, Is.GreaterThanOrEqualTo(0), $"{tanim}: gorevler.oyun negatif.");
            Assert.That(s.Streak, Is.Not.Null, $"{tanim}: streak null kalmamalı.");
            Assert.That(s.Streak.Yildiz, Is.GreaterThanOrEqualTo(0), $"{tanim}: streak.yildiz negatif.");
            Assert.That(s.Streak.Rozet, Is.GreaterThanOrEqualTo(0), $"{tanim}: streak.rozet negatif.");
            Assert.That(s.Parent, Is.Not.Null, $"{tanim}: parent null kalmamalı.");
            Assert.That(s.Parent.SpentTL, Is.GreaterThanOrEqualTo(0), $"{tanim}: parent.spentTL negatif.");
            Assert.That(s.Parent.LimitRaiseTs, Is.GreaterThanOrEqualTo(0), $"{tanim}: parent.limitRaiseTs negatif.");
            if (s.Wishes != null)
                foreach (var w in s.Wishes)
                    Assert.That(w.Ts, Is.GreaterThanOrEqualTo(0), $"{tanim}: wish.ts negatif.");

            // Araçlar hiç boşalamaz (FREE_TOOLS tamamlama, state.js satır 214-217).
            Assert.That(s.Tools != null && s.Tools.Count > 0, Is.True, $"{tanim}: tools boş kaldı.");
            Assert.That(s.Tools.Contains(s.ActiveTool), Is.True,
                $"{tanim}: activeTool ('{s.ActiveTool}') sahip olunan araçlardan biri değil.");

            // Ebeveyn PIN'i her zaman 4 haneli kalmalı (state.js satır 229 onarımı).
            var pin = s.Parent.Pin;
            var pinGecerli = pin != null && pin.Length == 4;
            if (pinGecerli)
                for (var k = 0; k < 4; k++)
                    if (pin[k] < '0' || pin[k] > '9') { pinGecerli = false; break; }
            Assert.That(pinGecerli, Is.True, $"{tanim}: parent.pin 4 haneli rakam değil ('{pin}').");
        }

        /* ---------- çöp girdi üreticileri ---------- */

        private static string Kisalt(string s, int n = 120)
        {
            if (s == null) return "(null)";
            s = s.Replace('\n', ' ').Replace('\r', ' ').Replace('\t', ' ');
            return s.Length <= n ? s : s.Substring(0, n) + "…";
        }

        // 6 kategori dönüşümlü: kesik JSON, rastgele baytlar, yanlış tipli alanlar,
        // derin iç içe dizi, boş/ilkel kök, dev sayılar.
        private static string CopGirdiUret(Random rnd, int i, string tamJson)
        {
            switch (i % 6)
            {
                case 0: // kesik JSON: geçerli bir kaydın rastgele bir öneki
                    return tamJson.Substring(0, rnd.Next(tamJson.Length));
                case 1: // rastgele baytlar/karakterler (kontrol karakteri + unicode dahil)
                    {
                        var n = rnd.Next(0, 80);
                        var sb = new StringBuilder(n);
                        const string havuz = "{}[]\":,truefalsnul0123456789.-+eE \n\tğüşiöç\\€";
                        for (var k = 0; k < n; k++) sb.Append(havuz[rnd.Next(havuz.Length)]);
                        return sb.ToString();
                    }
                case 2: // yanlış tipli alanlar
                    return YanlisTipliObje(rnd);
                case 3: // iç içe dizi: 600 seviye (kodek derinlik sınırı 512'nin ÜSTÜ → Parse null)
                        // ya da 300 seviye (sınırın ALTI → Parse başarılı, Load yutmalı)
                    {
                        var derinlik = rnd.Next(2) == 0 ? 600 : 300;
                        return new string('[', derinlik) + new string(']', derinlik);
                    }
                case 4: // boş obje ve öteki ilkel kökler
                    {
                        string[] kokler = { "{}", "[]", "null", "true", "false", "0", "\"\"", "\"yuvo\"" };
                        return kokler[rnd.Next(kokler.Length)];
                    }
                default: // dev sayılar
                    return DevSayiliObje(rnd);
            }
        }

        // Bilinen anahtarlara bilerek yanlış tipte değerler koyar.
        private static string YanlisTipliObje(Random rnd)
        {
            var o = SaveValue.NewObj();
            string[] anahtarlar =
            {
                "version", "stardust", "kabuk", "day", "owned", "milestones", "todayEggs",
                "foilBook", "tools", "activeTool", "parent", "kiler", "wishes", "purchases",
                "kulucka", "gorevler", "streak", "seed", "lastChocolateChoice",
                "bugunAcilanlar", "gorevBonusYeni", "firstRitualDoneToday", "sakoHidden", "hedefPufi"
            };
            foreach (var a in anahtarlar)
                if (rnd.Next(2) == 0) o.Set(a, CopDeger(rnd, 0));

            // eggsAvailable KASITLI olarak küçük havuzdan: todayEggs yokken v1 yolu bu sayıda
            // yumurta ÜRETİR (state.js satır 199) — dev pozitif değer testi milyarlarca
            // MakeEgg'e sürüklerdi; tip çeşitliliği yine tam.
            if (rnd.Next(2) == 0)
            {
                SaveValue[] kucukHavuz =
                {
                    SaveValue.Of("çok"), SaveValue.Of(true), SaveValue.Nil(),
                    SaveValue.Of(-4d), SaveValue.Of(5d), SaveValue.NewArr()
                };
                o.Set("eggsAvailable", kucukHavuz[rnd.Next(kucukHavuz.Length)]);
            }
            return JsonCodec.Write(o);
        }

        // Rastgele yanlış tipli değer (sığ iç içe obje/dizi dahil).
        private static SaveValue CopDeger(Random rnd, int derinlik)
        {
            switch (rnd.Next(derinlik < 2 ? 7 : 5))
            {
                case 0: return SaveValue.Of("çöp-metin");
                case 1: return SaveValue.Of(true);
                case 2: return SaveValue.Nil();
                case 3: return SaveValue.Of(rnd.Next(-1000, 1000) + 0.5);
                case 4: return SaveValue.Of((double)rnd.Next(-100, 100));
                case 5:
                    {
                        var arr = SaveValue.NewArr();
                        var n = rnd.Next(0, 4);
                        for (var k = 0; k < n; k++) arr.Items.Add(CopDeger(rnd, derinlik + 1));
                        return arr;
                    }
                default:
                    {
                        var obj = SaveValue.NewObj();
                        var n = rnd.Next(0, 4);
                        for (var k = 0; k < n; k++) obj.Set("k" + k, CopDeger(rnd, derinlik + 1));
                        return obj;
                    }
            }
        }

        // Dev/uç sayılar: todayEggs boş dizi verilir ki savedHadEggs=true olsun ve dev
        // eggsAvailable v1 doldurma yolunu tetiklemesin (o yol yalnız todayEggs YOKKEN koşar).
        private static string DevSayiliObje(Random rnd)
        {
            var o = SaveValue.NewObj();
            o.Set("todayEggs", SaveValue.NewArr());
            double[] devler =
            {
                1e308, -1e308, double.MaxValue, -double.MaxValue,
                4294967296.0, 1e18, -1e18, 987654321987654321.0, 2147483648.0, -2147483649.0
            };
            string[] sayisalAnahtarlar =
            {
                "stardust", "kabuk", "day", "pityN", "pityD", "pityE", "copyStreak",
                "eggCounter", "chocolates", "chocolateStarsToday", "kumbaraToday",
                "goldenPity", "seed", "weekCrafts", "rewardedPlaysToday", "eggsAvailable"
            };
            foreach (var a in sayisalAnahtarlar)
                if (rnd.Next(3) != 0) o.Set(a, SaveValue.Of(devler[rnd.Next(devler.Length)]));

            var parent = SaveValue.NewObj();
            parent.Set("limitTL", SaveValue.Of(1e308));
            parent.Set("spentTL", SaveValue.Of(-1e308));
            parent.Set("limitRaiseTs", SaveValue.Of(1e300));
            o.Set("parent", parent);

            var kiler = SaveValue.NewObj();
            kiler.Set("adet", SaveValue.Of(-1e18));
            kiler.Set("bugunAcilan", SaveValue.Of(1e308));
            o.Set("kiler", kiler);
            return JsonCodec.Write(o);
        }
    }
}
