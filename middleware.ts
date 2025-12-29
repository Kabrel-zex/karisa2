import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"

// Simple auth guard for protected routes using access_token cookie (JWT)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected =
    pathname.startsWith("/vendor") || pathname.startsWith("/account") || pathname.startsWith("/checkout")

  if (!isProtected) return NextResponse.next()

  const accessToken = request.cookies.get("access_token")?.value
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = verifyAccessToken(accessToken)
  if (!payload) {
    const resp = NextResponse.redirect(new URL("/login", request.url))
    resp.cookies.delete("access_token")
    resp.cookies.delete("refresh_token")
    resp.cookies.delete("user_session")
    return resp
  }

  // Optionally, we could enrich headers with user info if needed
  return NextResponse.next()
}

export const config = {
  matcher: ["/vendor/:path*", "/account/:path*", "/checkout/:path*"],
}
