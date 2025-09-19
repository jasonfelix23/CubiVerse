import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/"];

export function middleware(request: NextRequest) {
  console.log("middleware");
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], //only run middleware on root;
};
