import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/mis-reservas", "/admin"];
const adminRoutes = ["/admin"];
const publicRoutes = ["/login", "/register", "/"];

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  const isProtected = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAdmin = adminRoutes.some((route) => path.startsWith(route));
  const isPublic = publicRoutes.some((route) => path === route);

  if (isAdmin && session?.role !== "ADMIN") {
    return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  if (isProtected && !session?.userId) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  if (
    isPublic &&
    session?.userId &&
    (path === "/login" || path === "/register")
  ) {
    return addSecurityHeaders(NextResponse.redirect(new URL("/clases", request.url)));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
