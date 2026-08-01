import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  listApiKeys,
  listAudit,
  listFlags,
  listMedia,
  listPages,
  listSections,
  listUsers,
} from "@/lib/db";
import { can } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;
  try {
    const pages = listPages();
    const sectionCount = pages.reduce((sum, p) => sum + listSections(p.id).length, 0);
    const counts = {
      pages: pages.length,
      sections: sectionCount,
      media: listMedia().length,
      users: listUsers().length,
      flags: listFlags().length,
      apiKeys: listApiKeys().length,
    };
    const recentAudit = can(auth.user.role, "audit") ? listAudit(10, 0) : [];
    return NextResponse.json({ counts, recentAudit });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
