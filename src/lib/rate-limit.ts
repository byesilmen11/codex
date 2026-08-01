// Basit, bellek içi kayan pencere hız sınırlayıcı. Tek örnekli (single
// instance) dağıtımlar için yeterlidir; yatay ölçeklemede Redis gibi paylaşımlı
// bir depoya taşınmalıdır.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  limited: boolean;
  retryAfter: number; // saniye
}

/**
 * Verilen anahtar için isteği sayar. Pencere içinde `max`'ı aşarsa limited=true
 * döner. Sızıntıyı önlemek için başarılı işlemlerde reset() çağırın.
 */
export function hit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > max) {
    return { limited: true, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

export function reset(key: string): void {
  buckets.delete(key);
}

// Süresi dolan kovaları ara sıra temizle (bellek sızıntısını önler).
export function sweep(): void {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}
