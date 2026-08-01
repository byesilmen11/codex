import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listAudit } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "audit");
  if (!auth.ok) return auth.response;
  try {
    const sp = req.nextUrl.searchParams;
    const limitRaw = parseInt(sp.get("limit") ?? "", 10);
    const offsetRaw = parseInt(sp.get("offset") ?? "", 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;
    return NextResponse.json({ entries: listAudit(limit, offset) });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
