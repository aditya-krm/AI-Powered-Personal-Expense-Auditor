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
  
  // Return 401 for unauthorized access
  // In a real app, redirect to a login page here
  return new NextResponse("Unauthorized", { status: 401 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
