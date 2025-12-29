import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createRefreshToken } from "@/lib/auth"
import { loginSchema } from "@/lib/validators/auth"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import { setAuthCookies } from "@/lib/auth-cookies"
import { checkRateLimit, cacheDelete } from "@/lib/redis"

// POST /api/auth/login - Connexion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const rateKey = `login:${email}:${clientIp}`

    const allowed = await checkRateLimit(rateKey, 5, 15 * 60) // 5 tentatives / 15 min
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 })
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await cacheDelete(rateKey)

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role })
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await createRefreshToken(user.id, refreshToken, refreshExpires)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified,
      },
    })

    return setAuthCookies(response, accessToken, refreshToken, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      language: user.language,
    })
  } catch (error) {
    console.error("[API] Error logging in:", error)
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}


