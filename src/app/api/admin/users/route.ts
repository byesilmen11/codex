import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createUser, listUsers } from "@/lib/db";
import { ROLES, Role } from "@/lib/types";

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
  const auth = requireAuth(req, "users");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ users: listUsers() });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "users");
  if (!auth.ok) return auth.response;
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role : "";
  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "E-posta, isim ve şifre zorunludur" },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role as Role)) {
    return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
  }
  try {
    const user = createUser({ email, name, password, role: role as Role });
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "user",
      entity_id: user.id,
      details: { email: user.email, role: user.role },
    });
    return NextResponse.json({ user });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
