import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createFlag, listFlags } from "@/lib/db";

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

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    String((err as { code: unknown }).code).startsWith("SQLITE_CONSTRAINT")
  );
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ flags: listFlags() });
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
  const key = typeof body.key === "string" ? body.key.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!key || !name) {
    return NextResponse.json({ error: "key ve name zorunludur" }, { status: 400 });
  }
  try {
    const flag = createFlag({
      key,
      name,
      description: typeof body.description === "string" ? body.description : "",
      enabled: typeof body.enabled === "boolean" ? body.enabled : false,
      value: "value" in body ? body.value : {},
    });
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "flag",
      entity_id: flag.id,
      details: { key: flag.key, enabled: flag.enabled },
    });
    return NextResponse.json({ flag });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Bu anahtar (key) zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
