import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Konteyner/orkestratör sağlık kontrolü. Veritabanı bağlantısını da doğrular.
export async function GET() {
  try {
    db().prepare("SELECT 1").get();
    return NextResponse.json({ status: "ok", db: "up" });
  } catch {
    return NextResponse.json({ status: "error", db: "down" }, { status: 503 });
  }
}
