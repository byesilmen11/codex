import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, getPage, reorderSections } from "@/lib/db";

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

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  const pageId = typeof body.page_id === "number" ? body.page_id : NaN;
  const orderedIds = Array.isArray(body.ordered_ids)
    ? body.ordered_ids.filter((v): v is number => typeof v === "number" && Number.isInteger(v))
    : null;
  if (!Number.isInteger(pageId) || !orderedIds || orderedIds.length !== (body.ordered_ids as unknown[]).length) {
    return NextResponse.json(
      { error: "page_id ve ordered_ids (sayı dizisi) zorunludur" },
      { status: 400 }
    );
  }
  try {
    const page = getPage(pageId);
    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
    }
    reorderSections(pageId, orderedIds);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "section",
      entity_id: pageId,
      details: { reorder: orderedIds },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
