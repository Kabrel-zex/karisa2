import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("user_session")
  const { pathname } = request.nextUrl

  // Protected vendor routes
  if (pathname.startsWith("/vendor")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const session = JSON.parse(sessionCookie.value)
      if (session.role !== "seller" && session.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protected customer routes
  if (pathname.startsWith("/account") || pathname.startsWith("/checkout")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/vendor/:path*", "/account/:path*", "/checkout/:path*"],
}
