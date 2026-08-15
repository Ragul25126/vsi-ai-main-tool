import { NextResponse, type NextRequest } from "next/server";

// Routes that do not require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/features",
  "/privacy",
  "/r",
  "/qa",
  "/api/qa",
  "/api/cron",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Legacy auth links redirect to /login
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check authentication status (via session cookie)
  const isAuthenticated = request.cookies.has("vsi_session") || request.cookies.has("sb-access-token");

  // Allow public routes to pass through (Landing page / and Login page /login are always accessible)
  if (PUBLIC_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")))) {
    return response;
  }

  // Protected route check for /dashboard
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
