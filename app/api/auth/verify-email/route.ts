import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/auth"
import { verifyEmailSchema } from "@/lib/validators/auth"
import { clearAuthCookies } from "@/lib/auth-cookies"

// POST /api/auth/verify-email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = verifyEmailSchema.parse(body)

    const result = await verifyEmailToken(token)
    if (!result.ok || !result.user) {
      return NextResponse.json({ error: "Invalid or expired token", reason: result.reason }, { status: 400 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        isVerified: true,
      },
      message: "Email verified",
    })
    // On ne modifie pas les cookies d'auth ici; l'app peut redemander un refresh
    return response
  } catch (error) {
    console.error("[API] Error verifying email:", error)
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
