// Yuvo — Unity çekirdek duman testi (KURULUM DOĞRULAMASI)
//
// Kullanım: bu dosyayı Unity projesinde `Assets/Editor/` klasörüne kopyala,
// menüden **Yuvo ▸ Çekirdek Duman Testi** komutunu çalıştır ve Console'a bak.
// Beklenen: "TÜMÜ GEÇTİ" satırı. Ayrıntı: proje/07-unity-kurulum-talimati.md
//
// Ne kanıtlar? (a) com.yuvo.core paketi Unity'de DERLENDİ ve erişilebilir,
// (b) mulberry32 RNG Unity çalışma zamanında (Mono/IL2CPP) masaüstü .NET ve JS
//     prototipiyle BİT DÜZEYİNDE aynı sayıları üretiyor — altın vektör paritesinin
//     Unity ayağı, (c) kayıt katmanı (JSON codec + çift yuvalı SaveService)
//     cihaz kültüründen bağımsız çalışıyor.
// İçerik (content/*.json) yüklemesi bilinçli olarak KAPSAM DIŞI — o U1 işi
// (Addressables/StreamingAssets boru hattı); bu test içerik gerektirmez.

#if UNITY_EDITOR
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using UnityEditor;
using UnityEngine;
using Yuvo.Core;

public static class YuvoCoreSmokeTest
{
    // Masaüstü .NET 8 ve Node.js prototipinde ÖLÇÜLEN değerler (tohum 12345, ilk 3 çekiliş).
    // İkisi de birebir aynıydı; Unity de aynısını üretmek zorunda.
    private const string BeklenenR1 = "0.9797282677609473";
    private const string BeklenenR2 = "0.3067522644996643";
    private const string BeklenenR3 = "0.484205421525985";
    private const uint BeklenenSonTohum = 1199742488u;

    [MenuItem("Yuvo/Çekirdek Duman Testi")]
    public static void Calistir()
    {
        var rapor = new StringBuilder();
        var hata = 0;

        void Kontrol(bool kosul, string ad, string ayrinti = null)
        {
            if (kosul) rapor.AppendLine("  ✔ " + ad);
            else { hata++; rapor.AppendLine("  ✗ HATA: " + ad + (ayrinti != null ? " → " + ayrinti : "")); }
        }

        // 1) RNG paritesi — mulberry32 Unity çalışma zamanında da aynı akışı vermeli
        var s = new GameState { Seed = 12345 };
        var r1 = Rng.Next(s).ToString("R", CultureInfo.InvariantCulture);
        var r2 = Rng.Next(s).ToString("R", CultureInfo.InvariantCulture);
        var r3 = Rng.Next(s).ToString("R", CultureInfo.InvariantCulture);
        Kontrol(r1 == BeklenenR1, "RNG 1. çekiliş", r1);
        Kontrol(r2 == BeklenenR2, "RNG 2. çekiliş", r2);
        Kontrol(r3 == BeklenenR3, "RNG 3. çekiliş", r3);
        Kontrol(s.Seed == BeklenenSonTohum, "RNG tohum ilerlemesi", s.Seed.ToString());

        // 2) Varsayılan durum — GameState şeması beklendiği gibi
        var st = new GameState();
        Kontrol(st.Stardust == 40 && st.Day == 1 && st.ActiveBiome == "cayir" &&
                st.Tools.Count == 3 && st.Parent.Pin == "1234",
                "GameState varsayılanları");

        // 3) JSON codec — cihaz kültürü ne olursa olsun nokta ondalık + round-trip
        var obj = SaveValue.NewObj();
        obj.Set("tutar", SaveValue.Of(9.99));
        obj.Set("ad", SaveValue.Of("Şafak"));          // ASCII dışı karakter korunmalı
        var json = JsonCodec.Write(obj);
        var geri = JsonCodec.Parse(json);
        Kontrol(json.Contains("9.99") && !json.Contains("9,99"),
                "JSON sayı yazımı kültürden bağımsız", json);
        Kontrol(geri != null && geri.Get("ad").S == "Şafak" &&
                System.Math.Abs(geri.Get("tutar").N - 9.99) < 1e-12,
                "JSON round-trip");

        // 4) Kayıt katmanı — çift yuvalı SaveService bellek deposuyla
        var depo = new BellekDepo();
        var motor = new StateEngine(YalinIcerik());
        motor.Reset(4242);
        motor.S.Kabuk = 77;
        var svc = new SaveService(depo, motor);
        var yazdi = svc.Save();

        var motor2 = new StateEngine(YalinIcerik());
        var svc2 = new SaveService(depo, motor2);
        var okudu = svc2.Load();
        Kontrol(yazdi, "kayıt yazıldı");
        Kontrol(okudu && motor2.S.Kabuk == 77 && motor2.S.Version == 3,
                "kayıt geri yüklendi (Kabuk 77, migrasyon damgası 3)");

        // Sonuç
        var bas = hata == 0
            ? "<b>YUVO ÇEKİRDEK DUMAN TESTİ — TÜMÜ GEÇTİ</b>\n"
            : "<b>YUVO ÇEKİRDEK DUMAN TESTİ — " + hata + " HATA</b>\n";
        if (hata == 0) Debug.Log(bas + rapor);
        else Debug.LogError(bas + rapor +
             "\nRNG satırları hatalıysa: Unity çalışma zamanı (Mono/IL2CPP) uint aritmetiğinde " +
             "saparsa altın vektör paritesi bozulur — proje/07 'Sorun giderme' bölümüne bak.");
    }

    // Duman testi için içerik dosyası okumadan asgari GameContent (yalnız StateEngine'in
    // kurulumda ihtiyaç duyduğu alanlar: seri listesi + varsayılan limitler).
    private static GameContent YalinIcerik()
    {
        var c = new GameContent();
        c.SeriesKeys = new List<string> { "gunesbahcesi" };
        c.WrapperVariants = 8;
        return c;
    }

    private sealed class BellekDepo : ISaveStore
    {
        private readonly Dictionary<string, string> _d = new Dictionary<string, string>();
        public string ReadSlot(string slot) { string v; return _d.TryGetValue(slot ?? "", out v) ? v : null; }
        public bool WriteSlot(string slot, string content) { _d[slot ?? ""] = content; return true; }
    }
}
#endif
