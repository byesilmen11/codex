using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Yuvo.Core;

namespace Yuvo.Core.Tests
{
    /* İçerik fikstür yükleyicisi — content/*.json dosyalarını GameContent'e elle eşler.
       Serializer KULLANILMAZ: JsonDocument ile alan alan okunur ki camelCase/SCREAMING
       adlar ve belge sırası (PORT-CONTRACT §"Test fikstürleri") sürpriz yaratmasın.
       - Pufis: pufis.json "pufis" dizi SIRASI aynen List'e (JS nesne tarama sırası kuralı §5)
       - SeriesKeys: wrappers.json "series" ANAHTAR SIRASI (EnumerateObject belge sırası korur)
       - ritual.json "engine"/"gacha" bölümleri ham Dictionary<string,double> olarak da
         erişilebilir (sabit çapraz-doğrulama testleri için). */
    public static class Fixtures
    {
        /// <summary>Depo kökü: çalışma dizininden (ve test bin klasöründen) yukarı yürüyerek
        /// "content" klasörü + "content/pufis.json" bulunana dek arar.</summary>
        public static string RepoRoot()
        {
            // Hem testin cwd'si hem derleme çıktısı denenir — hangisi köke ulaşırsa.
            foreach (var start in new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory })
            {
                var dir = new DirectoryInfo(start);
                while (dir != null)
                {
                    var contentDir = Path.Combine(dir.FullName, "content");
                    if (Directory.Exists(contentDir) && File.Exists(Path.Combine(contentDir, "pufis.json")))
                        return dir.FullName;
                    dir = dir.Parent;
                }
            }
            throw new DirectoryNotFoundException(
                "Depo kökü bulunamadı: yukarı yürüyüşte 'content/pufis.json' içeren klasör yok.");
        }

        /// <summary>content/ altındaki bir JSON dosyasının tam yolu.</summary>
        public static string ContentPath(string dosyaAdi)
        {
            return Path.Combine(RepoRoot(), "content", dosyaAdi);
        }

        private static JsonDocument ParseFile(string dosyaAdi)
        {
            return JsonDocument.Parse(File.ReadAllText(ContentPath(dosyaAdi)));
        }

        // Son LoadContent() çağrısında doldurulan ham sabit bölümleri (ritual.json "engine"/"gacha").
        // Sabit çapraz-doğrulama testleri bunları LoadContent sonrası okuyabilir;
        // istenirse LoadConstants(out, out) ile de bağımsız alınabilir.
        public static Dictionary<string, double> EngineConstants { get; private set; }
        public static Dictionary<string, double> GachaConstants { get; private set; }

        /// <summary>Tüm içerik JSON'larını GameContent'e yükler; ayrıca ritual.json
        /// "engine" ve "gacha" bölümlerini EngineConstants/GachaConstants'a doldurur.</summary>
        public static GameContent LoadContent()
        {
            var content = new GameContent();

            // --- pufis.json: "pufis" dizisi, SIRA korunarak (state.js havuz taramaları bu sıra) ---
            using (var doc = ParseFile("pufis.json"))
            {
                content.Pufis = new List<PufiDef>();
                foreach (var p in doc.RootElement.GetProperty("pufis").EnumerateArray())
                {
                    content.Pufis.Add(new PufiDef
                    {
                        Id = GetString(p, "id"),
                        Ad = GetString(p, "ad"),
                        Tur = GetString(p, "tur"),
                        Kind = GetString(p, "kind"),
                        Rarity = GetString(p, "rarity"),
                        Biome = GetString(p, "biome"),
                        Bio = GetString(p, "bio"),
                    });
                }
            }

            // --- rarities.json: "rarities" nesnesi → Dictionary (ad/oran/kabuk/uretim) ---
            using (var doc = ParseFile("rarities.json"))
            {
                content.Rarities = new Dictionary<string, RarityDef>();
                foreach (var prop in doc.RootElement.GetProperty("rarities").EnumerateObject())
                {
                    content.Rarities[prop.Name] = new RarityDef
                    {
                        Ad = GetString(prop.Value, "ad"),
                        Oran = prop.Value.GetProperty("oran").GetDouble(),
                        Kabuk = prop.Value.GetProperty("kabuk").GetInt32(),
                        Uretim = prop.Value.GetProperty("uretim").GetInt32(),
                    };
                }
            }

            // --- wrappers.json: "series" ANAHTAR SIRASI → SeriesKeys (gün→seri rotasyonu);
            //     "variants" → WrapperVariants ---
            using (var doc = ParseFile("wrappers.json"))
            {
                content.SeriesKeys = new List<string>();
                foreach (var prop in doc.RootElement.GetProperty("series").EnumerateObject())
                    content.SeriesKeys.Add(prop.Name); // EnumerateObject belge sırasını korur
                content.WrapperVariants = doc.RootElement.GetProperty("variants").GetInt32();
            }

            // --- packs.json: "packs" dizisi → PackDef listesi; "club" → ClubDef;
            //     "storeLimits" → StoreLimitsDef ---
            using (var doc = ParseFile("packs.json"))
            {
                content.Packs = new List<PackDef>();
                foreach (var p in doc.RootElement.GetProperty("packs").EnumerateArray())
                {
                    content.Packs.Add(new PackDef
                    {
                        Id = GetString(p, "id"),
                        Ad = GetString(p, "ad"),
                        Adet = p.GetProperty("adet").GetInt32(),
                        Tl = p.GetProperty("tl").GetDouble(),
                        // "tekSeferlik" alanı çoğu pakette YOK → false (sözleşme)
                        TekSeferlik = p.TryGetProperty("tekSeferlik", out var ts) && ts.GetBoolean(),
                    });
                }

                var club = doc.RootElement.GetProperty("club");
                content.Club = new ClubDef
                {
                    Fiyat = club.GetProperty("fiyat").GetDouble(),
                    BonusYuzde = club.GetProperty("bonusYuzde").GetInt32(),
                    GunlukYumurta = club.GetProperty("gunlukYumurta").GetInt32(),
                    KilerEk = club.GetProperty("kilerEk").GetInt32(),
                };

                var sl = doc.RootElement.GetProperty("storeLimits");
                var secenekler = new List<double>();
                foreach (var s in sl.GetProperty("secenekler").EnumerateArray())
                    secenekler.Add(s.GetDouble());
                content.StoreLimits = new StoreLimitsDef
                {
                    VarsayilanAylik = sl.GetProperty("varsayilanAylik").GetDouble(),
                    Secenekler = secenekler,
                    SogumaSaat = sl.GetProperty("sogumaSaat").GetInt32(),
                    KilerGunluk = sl.GetProperty("kilerGunluk").GetInt32(),
                };
            }

            // --- ritual.json: "ritual" → RitualDef (SCREAMING adlar elle eşlenir);
            //     "engine"/"gacha" → ham sabit sözlükleri ---
            using (var doc = ParseFile("ritual.json"))
            {
                var r = doc.RootElement.GetProperty("ritual");
                content.Ritual = new RitualDef
                {
                    GoldenOran = r.GetProperty("GOLDEN_ORAN").GetDouble(),
                    GoldenHard = r.GetProperty("GOLDEN_HARD").GetInt32(),
                    KumbaraEsik = r.GetProperty("KUMBARA_ESIK").GetInt32(),
                    KumbaraGunluk = r.GetProperty("KUMBARA_GUNLUK").GetInt32(),
                    IsirikYildiz = r.GetProperty("ISIRIK_YILDIZ").GetInt32(),
                    CikolataYildizTavan = r.GetProperty("CIKOLATA_YILDIZ_TAVAN").GetInt32(),
                };

                EngineConstants = NumericSection(doc.RootElement, "engine");
                GachaConstants = NumericSection(doc.RootElement, "gacha");
            }

            return content;
        }

        /// <summary>ritual.json "engine"/"gacha" bölümlerini LoadContent'ten bağımsız yükler.</summary>
        public static void LoadConstants(out Dictionary<string, double> engine,
                                         out Dictionary<string, double> gacha)
        {
            using (var doc = ParseFile("ritual.json"))
            {
                engine = NumericSection(doc.RootElement, "engine");
                gacha = NumericSection(doc.RootElement, "gacha");
            }
        }

        // Bölümdeki YALNIZ sayısal alanları toplar ("engine.milestones" gibi diziler atlanır —
        // sabit çapraz-doğrulama sadece skaler değerlerle yapılır).
        private static Dictionary<string, double> NumericSection(JsonElement root, string ad)
        {
            var dict = new Dictionary<string, double>();
            foreach (var prop in root.GetProperty(ad).EnumerateObject())
            {
                if (prop.Value.ValueKind == JsonValueKind.Number)
                    dict[prop.Name] = prop.Value.GetDouble();
            }
            return dict;
        }

        private static string GetString(JsonElement el, string ad)
        {
            return el.TryGetProperty(ad, out var v) && v.ValueKind == JsonValueKind.String
                ? v.GetString() : null;
        }
    }
}
