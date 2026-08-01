import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, deletePage, getPage, listSections, updatePage } from "@/lib/db";
import { validateSlug } from "@/lib/slug";

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

export async function GET(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  const id = await parseId(ctx);
  if (id === null) {
    return NextResponse.json({ error: "Geçersiz kimlik" }, { status: 400 });
  }
  try {
    const page = getPage(id);
    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ page, sections: listSections(page.id) });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
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
  const current = getPage(id);
  if (!current) {
    return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
  }
  const input: Partial<{ slug: string; title: string; description: string; published: boolean }> = {};
  if (typeof body.slug === "string") input.slug = body.slug.trim();
  if (typeof body.title === "string") input.title = body.title.trim();
  if (typeof body.description === "string") input.description = body.description;
  if (typeof body.published === "boolean") input.published = body.published;
  // Slug yalnızca gerçekten değişiyorsa doğrulanır (sayfa kendi mevcut
  // slug'ını — home dahil — koruyabilir).
  if (input.slug !== undefined && input.slug !== current.slug) {
    const slugError = validateSlug(input.slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }
  }
  try {
    const page = updatePage(id, input);
    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "page",
      entity_id: id,
      details: input,
    });
    return NextResponse.json({ page });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
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
    const page = getPage(id);
    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
    }
    if (page.slug === "home") {
      return NextResponse.json({ error: "Ana sayfa (home) silinemez" }, { status: 400 });
    }
    deletePage(id);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "page",
      entity_id: id,
      details: { slug: page.slug },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
