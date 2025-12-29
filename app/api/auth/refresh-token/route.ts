import { NextRequest, NextResponse } from "next/server"
import { refreshSchema } from "@/lib/validators/auth"
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import { isRefreshTokenValid, rotateRefreshToken } from "@/lib/auth"
import { setAuthCookies, clearAuthCookies } from "@/lib/auth-cookies"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = refreshSchema.safeParse(body)
    const bodyToken = parsed.success ? parsed.data.refreshToken : undefined
    const cookieToken = request.cookies.get("refresh_token")?.value
    const refreshToken = bodyToken || cookieToken

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      const resp = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
      return clearAuthCookies(resp)
    }

    const dbToken = await isRefreshTokenValid(refreshToken)
    if (!dbToken) {
      const resp = NextResponse.json({ error: "Token revoked or expired" }, { status: 401 })
      return clearAuthCookies(resp)
    }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })
    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })
    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await rotateRefreshToken(refreshToken, newRefreshToken, newExpires)

    const response = NextResponse.json({ accessToken: newAccessToken })
    return setAuthCookies(response, newAccessToken, newRefreshToken)
  } catch (error) {
    console.error("[API] Error refreshing token:", error)
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 })
  }
}
