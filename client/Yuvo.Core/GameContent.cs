using System.Collections.Generic;

namespace Yuvo.Core
{
    /* İçerik modeli — content/*.json'un motorun ihtiyacı kadarı. Core JSON OKUMAZ:
       yükleme dışarıda (testlerde Fixtures, Unity'de Yuvo.Data) yapılır ve bu nesne
       doldurulur. SIRA SÖZLEŞMELERİ:
         - Pufis: pufis.json dizi sırası AYNEN korunur (havuz/akıllı düşüş bu sırayla gezer)
         - SeriesKeys: wrappers.json "series" ANAHTAR sırası (gün→seri rotasyonu buna bağlı) */

    public sealed class PufiDef
    {
        public string Id;
        public string Ad;
        public string Tur;
        public string Kind;
        public string Rarity;         // yaygin|azbulunur|nadir|destansi|efsanevi|gizli
        public string Biome;          // cayir|orman
        public string Bio;
    }

    public sealed class RarityDef
    {
        public string Ad;
        public double Oran;
        public int Kabuk;             // kopya ödülü
        public int Uretim;            // Atölye maliyeti
    }

    public sealed class PackDef
    {
        public string Id;
        public string Ad;
        public int Adet;
        public double Tl;
        public bool TekSeferlik;      // Hoş Geldin Sepeti — merdiven dışı
    }

    public sealed class ClubDef
    {
        public double Fiyat = 79.99;
        public int BonusYuzde = 10;
        public int GunlukYumurta = 1;
        public int KilerEk = 1;
    }

    public sealed class StoreLimitsDef
    {
        public double VarsayilanAylik = 400;
        public List<double> Secenekler = new List<double> { 0, 100, 400, 750, 1500 };
        public int SogumaSaat = 24;
        public int KilerGunluk = 5;
    }

    public sealed class RitualDef
    {
        public double GoldenOran = 0.02;
        public int GoldenHard = 40;
        public int KumbaraEsik = 15;
        public int KumbaraGunluk = 1;
        public int IsirikYildiz = 2;
        public int CikolataYildizTavan = 40;
    }

    public sealed class GameContent
    {
        public List<PufiDef> Pufis = new List<PufiDef>();
        public Dictionary<string, RarityDef> Rarities = new Dictionary<string, RarityDef>();
        public List<string> SeriesKeys = new List<string>();
        public int WrapperVariants = 8;
        public RitualDef Ritual = new RitualDef();
        public List<PackDef> Packs = new List<PackDef>();
        public ClubDef Club = new ClubDef();
        public StoreLimitsDef StoreLimits = new StoreLimitsDef();

        private Dictionary<string, PufiDef> _byId;

        public PufiDef PufiById(string id)
        {
            if (_byId == null)
            {
                _byId = new Dictionary<string, PufiDef>();
                foreach (var p in Pufis) _byId[p.Id] = p;
            }
            return id != null && _byId.TryGetValue(id, out var v) ? v : null;
        }

        public PackDef PackById(string id)
        {
            foreach (var p in Packs) if (p.Id == id) return p;
            return null;
        }
    }
}
