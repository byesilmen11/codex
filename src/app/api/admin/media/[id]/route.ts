import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, deleteMedia, updateMediaAlt } from "@/lib/db";
import { UPLOADS_DIR } from "@/lib/uploads";
import fs from "fs";
import path from "path";

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
  const alt = typeof body.alt === "string" ? body.alt : "";
  try {
    const item = updateMediaAlt(id, alt);
    if (!item) {
      return NextResponse.json({ error: "Medya bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "media",
      entity_id: id,
      details: { alt },
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
    const item = deleteMedia(id);
    if (!item) {
      return NextResponse.json({ error: "Medya bulunamadı" }, { status: 404 });
    }
    // Diskten de sil — hata yutulur.
    try {
      fs.unlinkSync(path.join(UPLOADS_DIR, item.filename));
    } catch {
      // dosya zaten yok olabilir
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "media",
      entity_id: id,
      details: { filename: item.filename, path: item.path },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
