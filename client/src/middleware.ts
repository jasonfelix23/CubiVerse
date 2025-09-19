import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // -- Guard room route (requires roomSection.<id> cookie) ----
  const roomMatch = pathname.match(/^\/rooms\/([^/]+)$/);
  if (roomMatch) {
    const roomId = roomMatch[1];
    const cookieName = `roomSession.${roomId}`;
    const has = request.cookies.get(cookieName)?.value;
    if (!has) {
      const url = request.nextUrl.clone();
      url.pathname = `/prejoin/${roomId}`;
      return NextResponse.redirect(url);
    }
  }

  // --- Your existing protected paths -----------
  const token = request.cookies.get("token")?.value;
  const protectedPaths = ["/dashboard", "/map", "/meeting"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/map/:path*",
    "/meeting/:path*",
    "/rooms/:path*",
  ],
};
