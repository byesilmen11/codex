namespace Yuvo.Core
{
    /* mulberry32 — prototype/js/engine/gacha.js rand() ile BİT DÜZEYİNDE özdeş olmak
       ZORUNDA (altın vektör sözleşmesi, docs/v2/07 §3). JS kaynağı:

         s.seed = (s.seed + 0x6D2B79F5) >>> 0;
         var t = s.seed;
         t = Math.imul(t ^ (t >>> 15), t | 1);
         t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
         return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

       Eşleme notları:
         - JS ">>> n"  → uint üzerinde ">> n" (mantıksal kaydırma)
         - Math.imul   → unchecked uint çarpma (mod 2^32 aynı sonucu verir)
         - "+", "^"    → unchecked uint aritmetiği (taşma sarmalı)
         - Bölüm: 2^32'ye double bölme — IEEE-754 double iki dilde de aynı. */
    public static class Rng
    {
        public static double Next(GameState s)
        {
            unchecked
            {
                s.Seed = s.Seed + 0x6D2B79F5u;
                uint t = s.Seed;
                t = (t ^ (t >> 15)) * (t | 1u);
                t ^= t + ((t ^ (t >> 7)) * (t | 61u));
                return (t ^ (t >> 14)) / 4294967296.0;
            }
        }
    }
}
