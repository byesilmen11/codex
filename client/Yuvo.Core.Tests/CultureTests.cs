using System;
using System.Globalization;
using System.Threading;
using NUnit.Framework;
using Yuvo.Core;

namespace Yuvo.Core.Tests
{
    /* Kültür bağımsızlığı regresyonu.
       Neden: hedef pazar Türkçe (ondalık ayıracı VİRGÜL) ve yol haritası 18 dil
       (bazı yerellerde Arapça-Hint rakamları). Kayıt dosyası ve ay anahtarı cihaz
       diline göre değişirse: (a) "9,99" yazan bir kayıt kendi ayrıştırıcımızca
       okunamaz, (b) SyncMonth her açılışta ayı "değişmiş" sanıp ebeveynin aylık
       harcama sayacını sıfırlar. İkisi de sessiz veri kaybıdır. */
    [TestFixture]
    [NonParallelizable]   // CurrentCulture thread durumudur — paralel koşumda sızmasın
    public class CultureTests
    {
        private static void KulturAltinda(string kultur, Action gövde)
        {
            var eskiKultur = Thread.CurrentThread.CurrentCulture;
            var eskiUI = Thread.CurrentThread.CurrentUICulture;
            try
            {
                var c = new CultureInfo(kultur);
                Thread.CurrentThread.CurrentCulture = c;
                Thread.CurrentThread.CurrentUICulture = c;
                gövde();
            }
            finally
            {
                Thread.CurrentThread.CurrentCulture = eskiKultur;
                Thread.CurrentThread.CurrentUICulture = eskiUI;
            }
        }

        [TestCase("tr-TR")]
        [TestCase("de-DE")]   // virgül ondalık ayıracı kullanan ikinci yerel
        public void SayiYazimiKulturdenBagimsiz(string kultur)
        {
            KulturAltinda(kultur, () =>
            {
                var obj = SaveValue.NewObj();
                obj.Set("tutar", SaveValue.Of(9.99));
                obj.Set("tam", SaveValue.Of(40));
                var json = JsonCodec.Write(obj);
                Assert.That(json, Does.Contain("9.99"),
                    $"{kultur}: ondalık ayıracı NOKTA olmalı (yazılan: {json})");
                Assert.That(json, Does.Not.Contain("9,99"),
                    $"{kultur}: kayıt dosyasına virgüllü sayı sızmamalı (yazılan: {json})");
                Assert.That(json, Does.Contain("\"tam\":40"),
                    $"{kultur}: tam sayı noktasız yazılmalı (yazılan: {json})");

                var geri = JsonCodec.Parse(json);
                Assert.That(geri, Is.Not.Null, $"{kultur}: kendi yazdığımız JSON okunabilmeli");
                Assert.That(geri.Get("tutar").N, Is.EqualTo(9.99).Within(1e-12),
                    $"{kultur}: sayı değeri round-trip'te korunmalı");
            });
        }

        [TestCase("tr-TR")]
        [TestCase("ar-SA")]   // Arapça-Hint rakamlı biçimlendirme yereli
        public void AyAnahtariAsciiRakamlarlaUretilir(string kultur)
        {
            KulturAltinda(kultur, () =>
            {
                var content = Fixtures.LoadContent();
                var eng = new StateEngine(content);          // varsayılan MonthKeyFn devrede
                var ay = eng.S.Parent.Ay;
                Assert.That(ay, Does.Match(@"^\d{4}-\d{2}$"),
                    $"{kultur}: ay anahtarı 'YYYY-MM' ve ASCII rakamlarla olmalı (ölçülen: {ay})");
                // Aynı kültürde ikinci çağrı da aynı anahtarı vermeli → SyncMonth harcamayı silmez
                eng.S.Parent.SpentTL = 123.45;
                eng.SyncMonth();
                Assert.That(eng.S.Parent.SpentTL, Is.EqualTo(123.45).Within(1e-9),
                    $"{kultur}: ay değişmediği hâlde harcama sayacı sıfırlanmamalı");
            });
        }

        [Test]
        public void TurkceKulturdeKayitRoundTripBozulmaz()
        {
            KulturAltinda("tr-TR", () =>
            {
                var content = Fixtures.LoadContent();
                var eng = new StateEngine(content, () => 0.5, () => 1768435200000L, () => "2026-01");
                eng.Reset(9001);
                eng.BuyPack("tekli");                 // ₺9,99 → ondalıklı alanlar dolsun
                eng.AddWish(content.Pufis[0].Id);
                eng.KuluckaBirak("yildiztozu");

                var json = SaveCodec.ToJson(eng.S);
                Assert.That(json, Does.Not.Contain("9,99"),
                    "Türkçe kültürde kayıt dosyasına virgüllü sayı sızmamalı");

                var store = new SozlukDepo();
                var svc = new SaveService(store, eng);
                Assert.That(svc.Save(), Is.True, "Türkçe kültürde kayıt yazılabilmeli");

                var eng2 = new StateEngine(content, () => 0.5, () => 1768435200000L, () => "2026-01");
                var svc2 = new SaveService(store, eng2);
                Assert.That(svc2.Load(), Is.True, "Türkçe kültürde kayıt geri okunabilmeli");
                Assert.That(eng2.S.Parent.SpentTL, Is.EqualTo(9.99).Within(1e-9),
                    "harcama tutarı Türkçe kültürde de bire bir dönmeli");
                Assert.That(eng2.S.Version, Is.EqualTo(3), "yükleme migrasyon damgasını vurmalı (version 3)");
                Assert.That(eng2.S.Kulucka, Is.Not.Null, "kuluçka kaydı Türkçe kültürde de korunmalı");
                Assert.That(eng2.S.Wishes.Count, Is.EqualTo(1), "dilek kaydı korunmalı");

                // Çevrim KARARLILIĞI: yüklenmiş durum bir kez daha kaydedilip yüklendiğinde
                // sabit noktadır (ilk tur migrasyon damgası vurduğu için karşılaştırma
                // buradan başlar — Version 2→3 farkı beklenen davranıştır).
                svc2.Save();
                var eng3 = new StateEngine(content, () => 0.5, () => 1768435200000L, () => "2026-01");
                var svc3 = new SaveService(store, eng3);
                Assert.That(svc3.Load(), Is.True, "ikinci çevrim de okunabilmeli");
                Assert.That(SaveValue.DeepEquals(SaveCodec.ToSave(eng2.S), SaveCodec.ToSave(eng3.S)), Is.True,
                    "Türkçe kültürde kaydet→yükle çevrimi kararlı olmalı (sabit nokta)");
            });
        }

        // Testlere özel minimal depo (SaveTests'teki uygulamalardan bağımsız, bu dosyaya ait)
        private sealed class SozlukDepo : ISaveStore
        {
            private readonly System.Collections.Generic.Dictionary<string, string> _d =
                new System.Collections.Generic.Dictionary<string, string>();
            public string ReadSlot(string slot) { string v; return _d.TryGetValue(slot ?? "", out v) ? v : null; }
            public bool WriteSlot(string slot, string content) { _d[slot ?? ""] = content; return true; }
        }
    }
}
