import { NextRequest, NextResponse } from "next/server";
import { getPublicFlags } from "@/lib/content";
import { verifyApiKey } from "@/lib/db";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key") ?? "";
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json(
        { error: "Geçerli bir API anahtarı gerekli" },
        { status: 401, headers: CORS_HEADERS }
      );
    }
    return NextResponse.json({ flags: getPublicFlags() }, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
