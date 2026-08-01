import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createApiKey, listApiKeys } from "@/lib/db";

export const dynamic = "force-dynamic";

async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ keys: listApiKeys() });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "İsim zorunludur" }, { status: 400 });
  }
  try {
    const { key, record } = createApiKey(name);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "api_key",
      entity_id: record.id,
      details: { name, prefix: record.prefix },
    });
    // Ham anahtar YALNIZCA bu yanıtta döner.
    return NextResponse.json({ key, record });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
