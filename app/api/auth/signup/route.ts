import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser, createEmailVerificationToken } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"
import { signupSchema } from "@/lib/validators/auth"
import { setAuthCookies } from "@/lib/auth-cookies"
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt"
import { createRefreshToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/auth/signup - Inscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.parse(body)
    const { email, name, password, role = "buyer", language = "fr" } = parsed

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const user = await createUser({ email, name, password, role, language })

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const verifyToken = await createEmailVerificationToken(user.id, 24)
    await sendVerificationEmail(user.email, verifyToken)

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role })
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await createRefreshToken(user.id, refreshToken, refreshExpires)

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
          isVerified: user.isVerified,
        },
        message: "Account created. Check your email to verify.",
      },
      { status: 201 }
    )

    return setAuthCookies(response, accessToken, refreshToken, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      language: user.language,
    })
  } catch (error) {
    console.error("[API] Error signing up:", error)
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 })
  }
}


