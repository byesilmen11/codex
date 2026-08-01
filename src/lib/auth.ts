import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  deleteSession,
  getSessionUser,
  verifyPassword,
  addAudit,
} from "./db";
import { Capability, Role, User, can } from "./types";

export const SESSION_COOKIE = "cms_session";

/** Server component / route handler içinden aktif kullanıcıyı döndürür. */
export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionUser(token);
}

export function login(email: string, password: string): { user: User; token: string } | null {
  const user = verifyPassword(email, password);
  if (!user) return null;
  const token = createSession(user.id);
  addAudit({ user_id: user.id, user_email: user.email, action: "login" });
  return { user, token };
}

export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}

// --- API route guard'ları ---------------------------------------------------

export type Guarded =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/** API route'larında oturum + yetki kontrolü. */
export function requireAuth(req: NextRequest, cap?: Capability): Guarded {
  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const user = getSessionUser(token);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Oturum gerekli" }, { status: 401 }),
    };
  }
  if (cap && !can(user.role as Role, cap)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
