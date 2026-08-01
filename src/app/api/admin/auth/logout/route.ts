import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, logout, requireAuth } from "@/lib/auth";
import { addAudit } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;
  try {
    await logout();
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "logout",
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
