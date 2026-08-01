import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, getSettings, updateSettings } from "@/lib/db";
import { AllSettings } from "@/lib/types";

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

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ settings: getSettings() });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAuth(req, "settings");
  if (!auth.ok) return auth.response;
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  try {
    const patch: Partial<AllSettings> = {};
    if (isPlainObject(body.site)) patch.site = body.site as unknown as AllSettings["site"];
    if (isPlainObject(body.seo)) patch.seo = body.seo as unknown as AllSettings["seo"];
    if (isPlainObject(body.branding))
      patch.branding = body.branding as unknown as AllSettings["branding"];
    if (isPlainObject(body.social)) patch.social = body.social as unknown as AllSettings["social"];
    if (isPlainObject(body.scripts))
      patch.scripts = body.scripts as unknown as AllSettings["scripts"];
    const settings = updateSettings(patch);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "settings",
      entity_id: "",
      details: { keys: Object.keys(patch) },
    });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
