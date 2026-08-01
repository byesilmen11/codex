import { NextRequest, NextResponse } from "next/server";

// Edge ortamında SQLite'a erişilemez; burada yalnızca çerez varlığı kontrol
// edilir. Gerçek oturum doğrulaması admin layout'unda ve API guard'larında yapılır.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = req.cookies.has("cms_session");
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
