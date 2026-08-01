import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, countOwners, deleteUser, getUser, updateUser } from "@/lib/db";
import { ROLES, Role } from "@/lib/types";

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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req, "users");
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
    email: string;
    name: string;
    password: string;
    role: Role;
    active: boolean;
  }> = {};
  if (typeof body.email === "string" && body.email.trim()) input.email = body.email.trim();
  if (typeof body.name === "string") input.name = body.name;
  if (typeof body.password === "string" && body.password) input.password = body.password;
  if (typeof body.role === "string") {
    if (!ROLES.includes(body.role as Role)) {
      return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
    }
    input.role = body.role as Role;
  }
  if (typeof body.active === "boolean") input.active = body.active;
  try {
    const target = getUser(id);
    if (!target) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    const demotes = input.role !== undefined && input.role !== "OWNER";
    const deactivates = input.active === false;
    if (
      target.role === "OWNER" &&
      target.active === 1 &&
      countOwners() <= 1 &&
      (demotes || deactivates)
    ) {
      return NextResponse.json(
        { error: "Son aktif sahibin rolü düşürülemez veya hesabı pasifleştirilemez" },
        { status: 400 }
      );
    }
    const user = updateUser(id, input);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "update",
      entity: "user",
      entity_id: id,
      details: {
        email: input.email,
        role: input.role,
        active: input.active,
        passwordChanged: input.password !== undefined,
      },
    });
    return NextResponse.json({ user });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req, "users");
  if (!auth.ok) return auth.response;
  const id = await parseId(ctx);
  if (id === null) {
    return NextResponse.json({ error: "Geçersiz kimlik" }, { status: 400 });
  }
  try {
    if (auth.user.id === id) {
      return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz" }, { status: 400 });
    }
    const target = getUser(id);
    if (!target) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }
    if (target.role === "OWNER" && target.active === 1 && countOwners() <= 1) {
      return NextResponse.json({ error: "Son sahip silinemez" }, { status: 400 });
    }
    deleteUser(id);
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "delete",
      entity: "user",
      entity_id: id,
      details: { email: target.email, role: target.role },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
