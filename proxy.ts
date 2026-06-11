import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = [
  "/mis-reservas",
  "/admin",
  "/clases",
];
const adminRoutes = ["/admin"];
const publicRoutes = ["/login", "/register", "/"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  const isProtected = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAdmin = adminRoutes.some((route) => path.startsWith(route));
  const isPublic = publicRoutes.some((route) => path === route);

  if (isAdmin && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    isPublic &&
    session?.userId &&
    (path === "/login" || path === "/register")
  ) {
    return NextResponse.redirect(new URL("/clases", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
