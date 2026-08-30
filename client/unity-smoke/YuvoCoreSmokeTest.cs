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
    // Masaüstü .NET 8 ve Node.js prototipinde ÖLÇÜLEN değerler (tohum 12345, ilk 3 çekiliş);
    // ikisi de birebir aynıydı, Unity de aynısını üretmek zorunda.
    //
    // NEDEN BİT DESENİ, NEDEN METİN DEĞİL: double→metin biçimi ÇALIŞMA ZAMANINA GÖRE DEĞİŞİR.
    // .NET Core 3.0+ `ToString("R")` en kısa geri-dönüştürülebilir metni yazar
    // (0.9797282677609473), Unity'nin Mono'su ise 17 basamak yazar (0.97972826776094735) —
    // AYNI sayı, farklı yazım. Metin karşılaştırması bu yüzden sahte alarm üretir.
    // BitConverter.DoubleToInt64Bits, sayının 64 bitini olduğu gibi karşılaştırır:
    // "bit düzeyinde parite" iddiasının gerçek testi budur (PORT-CONTRACT.md kural 10).
    private const long BeklenenBit1 = 4606999827268501504L;   // 0.9797282677609473
    private const long BeklenenBit2 = 4599197577454288896L;   // 0.3067522644996643
    private const long BeklenenBit3 = 4602394289341726720L;   // 0.484205421525985
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

        // 1) RNG paritesi — mulberry32 Unity çalışma zamanında da aynı akışı vermeli.
        //    Karşılaştırma BİT DESENİ üzerinden (yukarıdaki nota bakın).
        var s = new GameState { Seed = 12345 };
        var d1 = Rng.Next(s); var d2 = Rng.Next(s); var d3 = Rng.Next(s);
        BitKontrol(d1, BeklenenBit1, "RNG 1. çekiliş");
        BitKontrol(d2, BeklenenBit2, "RNG 2. çekiliş");
        BitKontrol(d3, BeklenenBit3, "RNG 3. çekiliş");
        Kontrol(s.Seed == BeklenenSonTohum, "RNG tohum ilerlemesi",
                s.Seed.ToString(CultureInfo.InvariantCulture));

        void BitKontrol(double olculen, long beklenenBit, string ad)
        {
            var bit = System.BitConverter.DoubleToInt64Bits(olculen);
            Kontrol(bit == beklenenBit, ad,
                    bit == beklenenBit ? null
                    : "bit " + bit.ToString(CultureInfo.InvariantCulture) +
                      " (beklenen " + beklenenBit.ToString(CultureInfo.InvariantCulture) +
                      "), sayı " + olculen.ToString("R", CultureInfo.InvariantCulture));
        }

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
             "sapıyor demektir (bit deseni farkı) ve altın vektör paritesi bozulur — " +
             "proje/07 'Sorun giderme' bölümüne bak.");
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
