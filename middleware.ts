import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/courses",
    "/login",
    "/register",
    "/pricing",
  ];

  // Allow public routes
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // API routes for authentication
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  } // Protected routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Instructor routes protection
  if (
    pathname.startsWith("/instructor") &&
    !["INSTRUCTOR", "ADMIN"].includes(token.role as string)
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
