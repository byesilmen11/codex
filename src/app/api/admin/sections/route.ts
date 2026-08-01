import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createSection, getPage } from "@/lib/db";
import { SECTION_DEFINITIONS, SectionType } from "@/lib/types";

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
  const type = typeof body.type === "string" ? body.type : "";
  if (!Number.isInteger(pageId)) {
    return NextResponse.json({ error: "Geçerli bir page_id zorunludur" }, { status: 400 });
  }
  if (!(type in SECTION_DEFINITIONS)) {
    return NextResponse.json({ error: "Geçersiz bölüm tipi" }, { status: 400 });
  }
  try {
    const page = getPage(pageId);
    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 });
    }
    const def = SECTION_DEFINITIONS[type as SectionType];
    const label =
      typeof body.label === "string" && body.label.trim() ? body.label.trim() : def.name;
    const section = createSection({
      page_id: pageId,
      type: def.type,
      label,
      content: def.defaultContent,
    });
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "section",
      entity_id: section.id,
      details: { page_id: pageId, type: def.type, label },
    });
    return NextResponse.json({ section });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
