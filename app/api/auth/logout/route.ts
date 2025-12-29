import { NextRequest, NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/auth-cookies"
import { revokeRefreshToken } from "@/lib/auth"

// POST /api/auth/logout - Déconnexion
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value
    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }
    const resp = NextResponse.json({ success: true })
    return clearAuthCookies(resp)
  } catch (error) {
    console.error("[API] Error logging out:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}


