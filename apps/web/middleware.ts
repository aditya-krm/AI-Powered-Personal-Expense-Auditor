import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Basic token-based authentication for single-user setup
  // Set WEB_ACCESS_TOKEN environment variable to enable protection
  const accessToken = process.env.WEB_ACCESS_TOKEN;
  
  // If no token is configured, allow access (development mode)
  if (!accessToken) {
    return NextResponse.next();
  }
  
  // Check for auth cookie or header
  const authCookie = request.cookies.get("auth_token")?.value;
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
  
  if (authCookie === accessToken || authHeader === accessToken) {
    return NextResponse.next();
  }
  
  // Redirect to login page or return 401
  return NextResponse.json(
    { error: "Unauthorized access" },
    { status: 401 }
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
