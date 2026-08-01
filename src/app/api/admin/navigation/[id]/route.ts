import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, deleteNavItem, updateNavItem } from "@/lib/db";

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
  const auth = requireAuth(req, "content");
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
    menu: "header" | "footer";
    label: string;
    url: string;
    sort_order: number;
    enabled: boolean;
    external: boolean;
  }> = {};
  if (body.menu === "header" || body.menu === "footer") input.menu = body.menu;
  if (typeof body.label === "string") input.label = body.label;
  if (typeof body.url === "string") input.url = body.url;
  if (typeof body.sort_order === "number" && Number.isInteger(body.sort_order))
    input.sort_order = body.sort_order;
  if (typeof body.enabled === "boolean") input.enabled = body.enabled;
  if (typeof body.external === "boolean") input.external = body.external;
  try {
    const item = updateNavItem(id, input);
    if (!item) {
      return NextResponse.json({ error: "Menü öğesi bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "navigation",
      entity_id: id,
      details: input,
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  const id = await parseId(ctx);
  if (id === null) {
    return NextResponse.json({ error: "Geçersiz kimlik" }, { status: 400 });
  }
  try {
    const deleted = deleteNavItem(id);
    if (!deleted) {
      return NextResponse.json({ error: "Menü öğesi bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "navigation",
      entity_id: id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
