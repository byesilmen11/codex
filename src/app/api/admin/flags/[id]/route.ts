import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, deleteFlag, getFlag, updateFlag } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

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

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const num = Number(id);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  const id = await parseId(ctx);
  if (id === null) {
    return NextResponse.json({ error: "Geçersiz kimlik" }, { status: 400 });
  }
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  const input: Partial<{
    key: string;
    name: string;
    description: string;
    enabled: boolean;
    value: unknown;
  }> = {};
  if (typeof body.key === "string" && body.key.trim()) input.key = body.key.trim();
  if (typeof body.name === "string") input.name = body.name;
  if (typeof body.description === "string") input.description = body.description;
  if (typeof body.enabled === "boolean") input.enabled = body.enabled;
  if ("value" in body) input.value = body.value;
  try {
    const flag = updateFlag(id, input);
    if (!flag) {
      return NextResponse.json({ error: "Flag bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "flag",
      entity_id: id,
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  const id = await parseId(ctx);
  if (id === null) {
    return NextResponse.json({ error: "Geçersiz kimlik" }, { status: 400 });
  }
  try {
    const flag = getFlag(id);
    if (!flag) {
      return NextResponse.json({ error: "Flag bulunamadı" }, { status: 404 });
    }
    deleteFlag(id);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "flag",
      entity_id: id,
      details: { key: flag.key },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
