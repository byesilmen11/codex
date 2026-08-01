import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, login, sessionCookieOptions } from "@/lib/auth";
import { addAudit } from "@/lib/db";
import { hit, reset } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000; // 15 dakika

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "E-posta ve şifre zorunludur" }, { status: 400 });
  }

  // IP + e-posta bazlı brute-force koruması.
  const rlKey = `login:${clientIp(req)}:${email.toLowerCase()}`;
  const rl = hit(rlKey, MAX_ATTEMPTS, WINDOW_MS);
  if (rl.limited) {
    return NextResponse.json(
      { error: "Çok fazla başarısız deneme. Lütfen bir süre sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const result = login(email, password);
    if (!result) {
      // Başarısız denemeyi denetim kaydına yaz (tespit için).
      addAudit({
        user_email: email,
        action: "login_failed",
        entity: "auth",
        details: { ip: clientIp(req) },
      });
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }
    reset(rlKey); // başarılı girişte sayacı sıfırla
    const res = NextResponse.json({ user: result.user });
    res.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
