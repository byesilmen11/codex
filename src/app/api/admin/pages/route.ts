import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createPage, listPages } from "@/lib/db";
import { validateSlug } from "@/lib/slug";

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
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ pages: listPages() });
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
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description : "";
  if (!slug || !title) {
    return NextResponse.json({ error: "Slug ve başlık zorunludur" }, { status: 400 });
  }
  const slugError = validateSlug(slug);
  if (slugError) {
    return NextResponse.json({ error: slugError }, { status: 400 });
  }
  try {
    const page = createPage({ slug, title, description });
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "page",
      entity_id: page.id,
      details: { slug: page.slug, title: page.title },
    });
    return NextResponse.json({ page });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 409 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
