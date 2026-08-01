import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  UPLOADS_DIR,
  UPLOAD_NAME_RE,
  contentTypeFor,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Yüklenen medyayı kalıcı veri dizininden servis eder. Production'da
// `next start` build sonrası public/ dosyalarını sunmadığından medya bu
// handler üzerinden verilir.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ filename: string }> }
) {
  const { filename } = await ctx.params;

  // Katı doğrulama: yalnızca beklenen UUID.uzantı biçimi (path traversal koruması).
  if (!UPLOAD_NAME_RE.test(filename)) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, filename);
  // Ek güvenlik: çözümlenen yolun gerçekten UPLOADS_DIR altında olduğunu doğrula.
  if (path.dirname(path.resolve(filePath)) !== path.resolve(UPLOADS_DIR)) {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  let data: Buffer;
  try {
    data = fs.readFileSync(filePath);
  } catch {
    return new NextResponse("Bulunamadı", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(filename),
      // SVG gibi aktif içerik taşıyabilen dosyaların doğrudan açıldığında
      // script çalıştırmasını engeller (stored XSS koruması). <img> ile
      // kullanıldığında zaten script çalışmaz; bu başlıklar doğrudan
      // navigasyon senaryosunu da güvene alır.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
