import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "./lib/auth";

export async function middleware(req: NextRequest) {
  // Hanya lindungi root dan halaman-halaman utama dalam dashboard
  // Biarkan halaman login dan API tetap dapat diakses publik
  const url = req.nextUrl;
  const isLoginPage = url.pathname.startsWith("/login");
  const isRegisterPage = url.pathname.startsWith("/register");
  const isApiAuth = url.pathname.startsWith("/api/auth");
  const isPublicFile = url.pathname.includes(".");

  if (isLoginPage || isRegisterPage || isApiAuth || isPublicFile) {
    return NextResponse.next();
  }

  // Cek token JWT
  const session = await getSessionFromRequest(req);

  // Jika tidak login, redirect ke /login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Boleh mengakses halaman
  return NextResponse.next();
}

export const config = {
  // Hanya jalankan middleware ini pada root dan pola halaman tertentu
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
