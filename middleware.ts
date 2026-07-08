import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("engetech-token")?.value;
  const pathname = request.nextUrl.pathname;

  const isPublic = pathname === "/login" || pathname.startsWith("/api/auth");

  // Se não tem token e não é rota pública, redireciona para login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tem token e está na página de login, redireciona para dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
