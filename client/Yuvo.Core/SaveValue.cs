using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Yuvo.Core
{
    /* Bağımlılıksız mini JSON modeli — PORT-CONTRACT.md EK "SaveValue / JsonCodec" bölümü.
       Amaç: state.js load()'un üzerinde çalıştığı JS nesne ağacının C# karşılığı
       (JSON.parse çıktısı gibi). Yuvo.Core'da dış JSON kütüphanesi YASAK olduğundan
       model + kodek elle yazılmıştır. Hata asla fırlatılmaz (sözleşme kural 9). */
    public sealed class SaveValue
    {
        public enum Kind { Null, Bool, Num, Str, Arr, Obj }

        public Kind K;
        public bool B;
        public double N;
        public string S;
        public List<SaveValue> Items;                       // yalnız Arr
        public List<KeyValuePair<string, SaveValue>> Props; // yalnız Obj — EKLEME SIRASI KORUNUR

        // ---- kurucular ----

        public static SaveValue Nil()
        {
            return new SaveValue { K = Kind.Null };
        }

        public static SaveValue Of(bool b)
        {
            return new SaveValue { K = Kind.Bool, B = b };
        }

        public static SaveValue Of(double n)
        {
            return new SaveValue { K = Kind.Num, N = n };
        }

        // Karar: null string → JSON null (JS'te null bir string değildir; ağaçta S=null taşımayalım).
        public static SaveValue Of(string s)
        {
            if (s == null) return Nil();
            return new SaveValue { K = Kind.Str, S = s };
        }

        public static SaveValue NewArr()
        {
            return new SaveValue { K = Kind.Arr, Items = new List<SaveValue>() };
        }

        public static SaveValue NewObj()
        {
            return new SaveValue { K = Kind.Obj, Props = new List<KeyValuePair<string, SaveValue>>() };
        }

        // ---- erişim ----

        // JS `obj.alan` karşılığı: Obj değilse ya da anahtar yoksa null (≈ undefined).
        public SaveValue Get(string name)
        {
            if (K != Kind.Obj || Props == null || name == null) return null;
            for (int i = 0; i < Props.Count; i++)
                if (Props[i].Key == name) return Props[i].Value;
            return null;
        }

        // JS `obj.alan = v` karşılığı: var olan anahtar YERİNDE güncellenir (JS'te yeniden
        // atama anahtarın ekleme sırasını değiştirmez), yoksa sona eklenir.
        // Karar: Obj olmayan değerde sessiz no-op; v null gelirse JSON null yazılır.
        public void Set(string name, SaveValue v)
        {
            if (K != Kind.Obj || name == null) return;
            if (Props == null) Props = new List<KeyValuePair<string, SaveValue>>();
            if (v == null) v = Nil();
            for (int i = 0; i < Props.Count; i++)
            {
                if (Props[i].Key == name)
                {
                    Props[i] = new KeyValuePair<string, SaveValue>(name, v);
                    return;
                }
            }
            Props.Add(new KeyValuePair<string, SaveValue>(name, v));
        }

        public bool IsObj { get { return K == Kind.Obj; } }
        public bool IsArr { get { return K == Kind.Arr; } }
        public bool IsStr { get { return K == Kind.Str; } }
        public bool IsNum { get { return K == Kind.Num; } }
        public bool IsBool { get { return K == Kind.Bool; } }

        /* JS truthiness — load() içindeki `if (x)` / `x || y` denetimleri için
           (ör. state.js "s.seed = s.seed || freshSeed()" satırı).
           false olanlar: null/undefined, false, 0, -0, NaN, "". Obj/Arr HER ZAMAN true
           (JS'te boş {} ve [] de truthy'dir). */
        public bool Truthy()
        {
            switch (K)
            {
                case Kind.Null: return false;
                case Kind.Bool: return B;
                case Kind.Num: return N != 0 && !double.IsNaN(N); // NaN != NaN → 0 ve NaN elenir; -0 == 0
                case Kind.Str: return !string.IsNullOrEmpty(S);
                default: return true; // Arr, Obj
            }
        }

        /* Yapısal eşitlik — altın fikstür karşılaştırması için.
           Obj: SIRA BAĞIMSIZ (anahtar kümeleri + değerler eşleşmeli; Set/Parse anahtarları
           tekilleştirdiği için sayım karşılaştırması güvenlidir).
           Arr: sıra bağımlı. Num: double == (C#'ta -0.0 == 0.0 zaten true; NaN eşit ÇIKMAZ). */
        public static bool DeepEquals(SaveValue a, SaveValue b)
        {
            if (ReferenceEquals(a, b)) return true;
            if (a == null || b == null) return false;
            if (a.K != b.K) return false;
            switch (a.K)
            {
                case Kind.Null:
                    return true;
                case Kind.Bool:
                    return a.B == b.B;
                case Kind.Num:
                    return a.N == b.N;
                case Kind.Str:
                    return a.S == b.S;
                case Kind.Arr:
                    {
                        int an = a.Items == null ? 0 : a.Items.Count;
                        int bn = b.Items == null ? 0 : b.Items.Count;
                        if (an != bn) return false;
                        for (int i = 0; i < an; i++)
                            if (!DeepEquals(a.Items[i], b.Items[i])) return false;
                        return true;
                    }
                case Kind.Obj:
                    {
                        int an = a.Props == null ? 0 : a.Props.Count;
                        int bn = b.Props == null ? 0 : b.Props.Count;
                        if (an != bn) return false;
                        for (int i = 0; i < an; i++)
                        {
                            SaveValue bv = b.Get(a.Props[i].Key);
                            if (bv == null || !DeepEquals(a.Props[i].Value, bv)) return false;
                        }
                        return true;
                    }
                default:
                    return false;
            }
        }
    }

    /* Elle yazılmış tam JSON kodeği.
       Parse: HER hatada null döndürür, asla fırlatmaz — state.js load()'daki
       `try { JSON.parse(raw) } catch { … varsayılanlara dön }` deseninin (satır ~170)
       C# karşılığı budur. Derinlik sınırı 512: fuzz'daki derin iç içe girdilerde
       StackOverflow yerine null.
       Write: kompakt (boşluksuz) JSON.stringify uyumu — SaveService zarf sum'ı bu
       dizgi üzerinden hesaplandığı için biçim kararlıdır. */
    public static class JsonCodec
    {
        private const int MaxDepth = 512;

        // ---- Parse ----

        public static SaveValue Parse(string json)
        {
            if (json == null) return null;
            int pos = 0;
            SaveValue v = ParseValue(json, ref pos, 0);
            if (v == null) return null;
            SkipWs(json, ref pos);
            if (pos != json.Length) return null; // değerin ardında artık var → geçersiz
            return v;
        }

        private static void SkipWs(string s, ref int p)
        {
            // JSON grameri: yalnız boşluk, tab, LF, CR
            while (p < s.Length)
            {
                char c = s[p];
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') p++;
                else break;
            }
        }

        private static SaveValue ParseValue(string s, ref int p, int depth)
        {
            SkipWs(s, ref p);
            if (p >= s.Length) return null;
            char c = s[p];
            switch (c)
            {
                case '{': return ParseObj(s, ref p, depth);
                case '[': return ParseArr(s, ref p, depth);
                case '"':
                    {
                        string str = ParseStr(s, ref p);
                        return str == null ? null : SaveValue.Of(str);
                    }
                case 't': return ParseLit(s, ref p, "true") ? SaveValue.Of(true) : null;
                case 'f': return ParseLit(s, ref p, "false") ? SaveValue.Of(false) : null;
                case 'n': return ParseLit(s, ref p, "null") ? SaveValue.Nil() : null;
                default: return ParseNum(s, ref p);
            }
        }

        private static bool ParseLit(string s, ref int p, string lit)
        {
            if (p + lit.Length > s.Length) return false;
            for (int i = 0; i < lit.Length; i++)
                if (s[p + i] != lit[i]) return false;
            p += lit.Length;
            return true;
        }

        private static SaveValue ParseObj(string s, ref int p, int depth)
        {
            if (depth >= MaxDepth) return null;
            p++; // '{'
            SaveValue obj = SaveValue.NewObj();
            SkipWs(s, ref p);
            if (p < s.Length && s[p] == '}') { p++; return obj; }
            while (true)
            {
                SkipWs(s, ref p);
                if (p >= s.Length || s[p] != '"') return null;
                string key = ParseStr(s, ref p);
                if (key == null) return null;
                SkipWs(s, ref p);
                if (p >= s.Length || s[p] != ':') return null;
                p++;
                SaveValue val = ParseValue(s, ref p, depth + 1);
                if (val == null) return null;
                obj.Set(key, val); // yinelenen anahtar: JSON.parse gibi SON değer kazanır (yer korunur)
                SkipWs(s, ref p);
                if (p >= s.Length) return null;
                if (s[p] == ',') { p++; continue; }
                if (s[p] == '}') { p++; return obj; }
                return null;
            }
        }

        private static SaveValue ParseArr(string s, ref int p, int depth)
        {
            if (depth >= MaxDepth) return null;
            p++; // '['
            SaveValue arr = SaveValue.NewArr();
            SkipWs(s, ref p);
            if (p < s.Length && s[p] == ']') { p++; return arr; }
            while (true)
            {
                SaveValue val = ParseValue(s, ref p, depth + 1);
                if (val == null) return null;
                arr.Items.Add(val);
                SkipWs(s, ref p);
                if (p >= s.Length) return null;
                if (s[p] == ',') { p++; continue; }
                if (s[p] == ']') { p++; return arr; }
                return null;
            }
        }

        // Hatada null; başarıda dizgi (p kapanış tırnağının arkasında).
        private static string ParseStr(string s, ref int p)
        {
            p++; // '"'
            StringBuilder sb = new StringBuilder();
            while (true)
            {
                if (p >= s.Length) return null;
                char c = s[p++];
                if (c == '"') return sb.ToString();
                if (c < 0x20) return null; // ham kontrol karakteri JSON'da geçersiz
                if (c != '\\') { sb.Append(c); continue; }
                if (p >= s.Length) return null;
                char e = s[p++];
                switch (e)
                {
                    case '"': sb.Append('"'); break;
                    case '\\': sb.Append('\\'); break;
                    case '/': sb.Append('/'); break;
                    case 'b': sb.Append('\b'); break;
                    case 'f': sb.Append('\f'); break;
                    case 'n': sb.Append('\n'); break;
                    case 'r': sb.Append('\r'); break;
                    case 't': sb.Append('\t'); break;
                    case 'u':
                        {
                            int u = ParseHex4(s, ref p);
                            if (u < 0) return null;
                            // C# dizgileri UTF-16: 😀 gibi surrogate çiftleri iki
                            // kod birimi olarak doğal biçimde birleşir; JSON.parse gibi tek
                            // (eşsiz) surrogate da kabul edilir.
                            sb.Append((char)u);
                            break;
                        }
                    default: return null;
                }
            }
        }

        private static int ParseHex4(string s, ref int p)
        {
            if (p + 4 > s.Length) return -1;
            int v = 0;
            for (int i = 0; i < 4; i++)
            {
                char c = s[p + i];
                int d;
                if (c >= '0' && c <= '9') d = c - '0';
                else if (c >= 'a' && c <= 'f') d = c - 'a' + 10;
                else if (c >= 'A' && c <= 'F') d = c - 'A' + 10;
                else return -1;
                v = (v << 4) | d;
            }
            p += 4;
            return v;
        }

        private static SaveValue ParseNum(string s, ref int p)
        {
            int start = p;
            if (p < s.Length && s[p] == '-') p++;
            // tam kısım: "0" ya da [1-9][0-9]* (öncü sıfır JSON'da geçersiz)
            if (p >= s.Length || !IsDigit(s[p])) return null;
            if (s[p] == '0') p++;
            else while (p < s.Length && IsDigit(s[p])) p++;
            // kesir
            if (p < s.Length && s[p] == '.')
            {
                p++;
                if (p >= s.Length || !IsDigit(s[p])) return null;
                while (p < s.Length && IsDigit(s[p])) p++;
            }
            // üs
            if (p < s.Length && (s[p] == 'e' || s[p] == 'E'))
            {
                p++;
                if (p < s.Length && (s[p] == '+' || s[p] == '-')) p++;
                if (p >= s.Length || !IsDigit(s[p])) return null;
                while (p < s.Length && IsDigit(s[p])) p++;
            }
            double d;
            if (!double.TryParse(s.Substring(start, p - start), NumberStyles.Float,
                                 CultureInfo.InvariantCulture, out d))
                return null;
            return SaveValue.Of(d);
        }

        private static bool IsDigit(char c)
        {
            return c >= '0' && c <= '9'; // char.IsDigit KULLANMA: Unicode rakamlarını da kabul eder
        }

        // ---- Write ----

        public static string Write(SaveValue v)
        {
            StringBuilder sb = new StringBuilder();
            WriteValue(sb, v);
            return sb.ToString();
        }

        private static void WriteValue(StringBuilder sb, SaveValue v)
        {
            if (v == null) { sb.Append("null"); return; } // savunmacı: eksik dal → JSON null
            switch (v.K)
            {
                case SaveValue.Kind.Null:
                    sb.Append("null");
                    break;
                case SaveValue.Kind.Bool:
                    sb.Append(v.B ? "true" : "false");
                    break;
                case SaveValue.Kind.Num:
                    WriteNum(sb, v.N);
                    break;
                case SaveValue.Kind.Str:
                    WriteStr(sb, v.S ?? "");
                    break;
                case SaveValue.Kind.Arr:
                    {
                        sb.Append('[');
                        int n = v.Items == null ? 0 : v.Items.Count;
                        for (int i = 0; i < n; i++)
                        {
                            if (i > 0) sb.Append(',');
                            WriteValue(sb, v.Items[i]);
                        }
                        sb.Append(']');
                        break;
                    }
                case SaveValue.Kind.Obj:
                    {
                        sb.Append('{');
                        int n = v.Props == null ? 0 : v.Props.Count;
                        for (int i = 0; i < n; i++)
                        {
                            if (i > 0) sb.Append(',');
                            WriteStr(sb, v.Props[i].Key);
                            sb.Append(':');
                            WriteValue(sb, v.Props[i].Value);
                        }
                        sb.Append('}');
                        break;
                    }
            }
        }

        /* Sayı yazımı sözleşmesi: tam sayı → noktasız ("40"); değilse "R" round-trip
           (invariant kültür). JS'te JSON.stringify(40) === "40", stringify(9.99) === "9.99".
           long aralığı denetimi: d < 2^63 (9223372036854775808.0 double olarak TAM temsil
           edilir; d == 2^63 long'a sığmaz, bu yüzden katı '<'). -0 → "0" (JS String(-0) da "0"). */
        private static void WriteNum(StringBuilder sb, double d)
        {
            if (double.IsNaN(d) || double.IsInfinity(d))
            {
                sb.Append("null"); // JSON.stringify(NaN/Infinity) === "null"
                return;
            }
            if (d >= -9223372036854775808.0 && d < 9223372036854775808.0 && System.Math.Floor(d) == d)
            {
                sb.Append(((long)d).ToString(CultureInfo.InvariantCulture));
                return;
            }
            sb.Append(d.ToString("R", CultureInfo.InvariantCulture));
        }

        /* Dizgi kaçışı — JSON.stringify uyumu: yalnız '"', '\\' ve < 0x20 kontrol
           karakterleri kaçırılır (\b \t \n \f \r adlı; kalanı \u00xx, hex KÜÇÜK harf).
           ASCII dışı karakterler (ör. Türkçe "ğ/ş") JS gibi ham bırakılır. */
        private static void WriteStr(StringBuilder sb, string s)
        {
            sb.Append('"');
            for (int i = 0; i < s.Length; i++)
            {
                char c = s[i];
                switch (c)
                {
                    case '"': sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\b': sb.Append("\\b"); break;
                    case '\f': sb.Append("\\f"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    default:
                        if (c < 0x20)
                        {
                            sb.Append("\\u00");
                            sb.Append("0123456789abcdef"[(c >> 4) & 0xF]);
                            sb.Append("0123456789abcdef"[c & 0xF]);
                        }
                        else sb.Append(c);
                        break;
                }
            }
            sb.Append('"');
        }
    }
}
