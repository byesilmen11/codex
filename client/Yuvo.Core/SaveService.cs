namespace Yuvo.Core
{
    /* SaveService — çift yuvalı ("a"/"b") kalıcılık zarfı.
       PORT-CONTRACT.md EK "ISaveStore + SaveService" bölümü BİREBİR.

       Prototipte kalıcılık tek localStorage anahtarıdır (state.js satır 279-283:
       `setItem(STORAGE_KEY, JSON.stringify(state))`). C# tarafında bunun üzerine
       yarıda kesilen yazıma dayanıklı çift yuva + sağlama zarfı eklenir:
         {"surum":1,"sira":N,"sum":"8-hane-hex","kayit":{...}}
       Kayıt içeriği (kayit) SaveCodec.ToSave çıktısıdır; okuma yolu state.js load()
       (satır ~168-280) portu olan SaveCodec.Load'dan geçer.
       Hata ASLA fırlatılmaz (sözleşme kural 9) — her arıza false ile raporlanır. */

    public interface ISaveStore
    {
        // Yuva içeriğini okur; yuva yoksa/okunamazsa null (FIRLATMAZ).
        string ReadSlot(string slot);

        // Yuvaya yazar; ATOMİK yazım (temp + değiştirme) UYGULAMANIN işidir.
        // Başarı durumunu döndürür (FIRLATMAZ).
        bool WriteSlot(string slot, string content);
    }

    public sealed class SaveService
    {
        private readonly ISaveStore _store;
        private readonly StateEngine _engine;

        public int LastSira;        // teşhis: son yazılan/yüklenen zarf sırası (başlangıç 0)
        public string LastSlot;     // teşhis: "a" | "b" | null

        public SaveService(ISaveStore store, StateEngine engine)
        {
            _store = store;
            _engine = engine;
            LastSira = 0;
            LastSlot = null;
        }

        /* ---------- sağlama ---------- */

        // FNV-1a 32 — pufiChirp'teki formülle aynı: h=2166136261; her UTF-16 kod birimi
        // için h^=ch; h*=16777619 (unchecked uint). Çıktı 8 hane KÜÇÜK harf hex.
        // Girdi: kayit'in kompakt JSON dizgisi (JsonCodec.Write çıktısı).
        private static string Sum(string s)
        {
            unchecked
            {
                uint h = 2166136261u;
                for (int i = 0; i < s.Length; i++)
                {
                    h ^= s[i];          // char → uint: UTF-16 kod birimi değeri
                    h *= 16777619u;
                }
                return h.ToString("x8");
            }
        }

        /* ---------- yuva incelemesi ---------- */

        private sealed class SlotInfo
        {
            public bool Valid;
            public int Sira;
            public SaveValue Kayit;
        }

        // Yuvayı okur ve zarfı doğrular: parse başarılı + surum==1 + sira sayı +
        // sum, kayit'in kanonik JSON'undan yeniden hesaplanan değerle eşit.
        // JsonCodec.Parse anahtar SIRASINI koruduğundan Write(Parse(x)) kendi yazdığımız
        // kompakt biçimle bire birdir; kayit içinde 1 karakter bile oynansa sum tutmaz.
        private SlotInfo Inspect(string slot)
        {
            var info = new SlotInfo();
            string raw = (_store != null) ? _store.ReadSlot(slot) : null;
            if (raw == null) return info;

            SaveValue env = JsonCodec.Parse(raw);       // hatada null, fırlatmaz
            if (env == null || !env.IsObj) return info;

            SaveValue surum = env.Get("surum");
            if (surum == null || !surum.IsNum || surum.N != 1) return info;

            SaveValue sira = env.Get("sira");
            if (sira == null || !sira.IsNum) return info;
            // Kendi yazdığımız zarfta sira daima küçük pozitif tamsayıdır; çöp zarfta
            // NaN/±Inf/aralık dışı değerler yuvayı geçersiz kılar (dönüşüm fırlatmasın diye).
            if (double.IsNaN(sira.N) || double.IsInfinity(sira.N) ||
                sira.N < int.MinValue || sira.N > int.MaxValue) return info;

            SaveValue sum = env.Get("sum");
            SaveValue kayit = env.Get("kayit");
            if (sum == null || !sum.IsStr || kayit == null) return info;
            if (Sum(JsonCodec.Write(kayit)) != sum.S) return info;

            info.Valid = true;
            info.Sira = (int)sira.N;
            info.Kayit = kayit;
            return info;
        }

        // İki yuvadan geçerli olup sira'sı büyük olanı seçer (eşitlikte "a").
        // Seçilen yuva adı `yuva`ya yazılır; hiçbiri geçerli değilse null döner.
        private SlotInfo PickLatest(SlotInfo a, SlotInfo b, out string yuva)
        {
            if (a.Valid && b.Valid)
            {
                if (b.Sira > a.Sira) { yuva = "b"; return b; }
                yuva = "a"; return a;
            }
            if (a.Valid) { yuva = "a"; return a; }
            if (b.Valid) { yuva = "b"; return b; }
            yuva = null;
            return null;
        }

        /* ---------- API ---------- */

        // Aktif state'i zarflayıp SON GEÇERLİ yuvanın TERSİNE yazar (hiç geçerli yuva
        // yoksa "a"); sira = son geçerli sira + 1. Böylece en taze sağlam kayıt, yeni
        // yazım yarıda kesilse bile öteki yuvada el değmeden durur.
        public bool Save()
        {
            if (_store == null || _engine == null || _engine.S == null) return false;

            SaveValue kayit = SaveCodec.ToSave(_engine.S);   // state.js save(): JSON.stringify(state) karşılığı
            if (kayit == null) return false;
            string kayitJson = JsonCodec.Write(kayit);

            // Son geçerli yuvayı depodan TAZE tara (bellekteki LastSlot'a güvenme:
            // başka süreç/yuva bozulması olabilir) — hedef onun tersi.
            string sonYuva;
            SlotInfo son = PickLatest(Inspect("a"), Inspect("b"), out sonYuva);
            string hedef = (sonYuva == "a") ? "b" : "a";     // sonYuva null (hiç yok) → "a"
            int sira = (son != null) ? son.Sira + 1 : 1;

            SaveValue env = SaveValue.NewObj();
            env.Set("surum", SaveValue.Of(1d));
            env.Set("sira", SaveValue.Of((double)sira));
            env.Set("sum", SaveValue.Of(Sum(kayitJson)));
            env.Set("kayit", kayit);

            if (!_store.WriteSlot(hedef, JsonCodec.Write(env))) return false;
            LastSira = sira;
            LastSlot = hedef;
            return true;
        }

        // İki yuvayı okur; parse+surum+sum'u geçen yuvalardan sira'sı büyük olanın
        // kayit'ini SaveCodec.Load (state.js load() portu) ile engine.S'e migre eder.
        // İkisi de geçersizse false döner ve S'e DOKUNULMAZ (temiz başlangıç kararı
        // çağıranın işidir — JS'te load() localStorage boşken varsayılana düşer, zarf
        // katmanında bu ayrım bilinçli olarak dışarıya bırakılmıştır).
        public bool Load()
        {
            if (_store == null || _engine == null) return false;

            string yuva;
            SlotInfo sec = PickLatest(Inspect("a"), Inspect("b"), out yuva);
            if (sec == null) return false;                   // S dokunulmadan çık

            SaveCodec.Load(_engine, sec.Kayit);              // migrasyon + tip onarımı (state.js ~168-280)
            LastSira = sec.Sira;
            LastSlot = yuva;
            return true;
        }
    }
}
