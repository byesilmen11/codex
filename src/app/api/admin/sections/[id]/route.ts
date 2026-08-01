import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, deleteSection, getSection, updateSection } from "@/lib/db";

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
  const input: Partial<{ label: string; content: unknown; enabled: boolean }> = {};
  if (typeof body.label === "string") input.label = body.label;
  if ("content" in body) input.content = body.content;
  if (typeof body.enabled === "boolean") input.enabled = body.enabled;
  try {
    const section = updateSection(id, input);
    if (!section) {
      return NextResponse.json({ error: "Bölüm bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "section",
      entity_id: id,
      details: { label: section.label, enabled: section.enabled },
    });
    return NextResponse.json({ section });
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
    const section = getSection(id);
    if (!section) {
      return NextResponse.json({ error: "Bölüm bulunamadı" }, { status: 404 });
    }
    deleteSection(id);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "section",
      entity_id: id,
      details: { page_id: section.page_id, type: section.type, label: section.label },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
