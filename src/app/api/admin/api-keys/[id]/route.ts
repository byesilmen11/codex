import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, deleteApiKey, setApiKeyActive } from "@/lib/db";

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
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active (boolean) zorunludur" }, { status: 400 });
  }
  try {
    const updated = setApiKeyActive(id, body.active);
    if (!updated) {
      return NextResponse.json({ error: "API anahtarı bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "api_key",
      entity_id: id,
      details: { active: body.active },
    });
    return NextResponse.json({ ok: true });
  } catch {
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
    const deleted = deleteApiKey(id);
    if (!deleted) {
      return NextResponse.json({ error: "API anahtarı bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "api_key",
      entity_id: id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
