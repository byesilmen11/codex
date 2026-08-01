import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createNavItem, listNavigation } from "@/lib/db";

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
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ items: listNavigation() });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  const menu = body.menu === "header" || body.menu === "footer" ? body.menu : null;
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!menu || !label || !url) {
    return NextResponse.json(
      { error: "menu (header/footer), label ve url zorunludur" },
      { status: 400 }
    );
  }
  try {
    const item = createNavItem({
      menu,
      label,
      url,
      external: typeof body.external === "boolean" ? body.external : false,
    });
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "navigation",
      entity_id: item.id,
      details: { menu, label, url },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
