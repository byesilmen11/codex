import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addAudit, createMedia, listMedia } from "@/lib/db";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE, UPLOADS_DIR } from "@/lib/uploads";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ items: listMedia() });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, "content");
  if (!auth.ok) return auth.response;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Geçersiz form verisi" }, { status: 400 });
  }
  try {
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Dosya zorunludur (form alan adı: file)" },
        { status: 400 }
      );
    }
    const originalName = file.name || "dosya";
    const ext = path.extname(originalName).slice(1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "İzin verilmeyen dosya türü. İzinli uzantılar: png, jpg, jpeg, webp, gif, svg, ico, pdf" },
        { status: 400 }
      );
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB sınırını aşıyor" },
        { status: 400 }
      );
    }
    const filename = `${crypto.randomUUID()}.${ext}`;
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    const item = createMedia({
      filename,
      original_name: originalName,
      mime: file.type,
      size: file.size,
      path: `/uploads/${filename}`,
      uploaded_by: auth.user.id,
    });
    addAudit({
      user_id: auth.user.id,
      user_email: auth.user.email,
      action: "create",
      entity: "media",
      entity_id: item.id,
      details: { filename, original_name: originalName, size: file.size },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
