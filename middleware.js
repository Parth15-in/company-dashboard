import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // Do NOT protect login page
  if (path === "/admin/login" || path === "/admin/signup") {
    return NextResponse.next();
  }

  // Protect all other admin pages
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}
