import { NextRequest, NextResponse } from "next/server"
import { resendVerificationSchema } from "@/lib/validators/auth"
import { getUserByEmail, createEmailVerificationToken } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

// POST /api/auth/resend-verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resendVerificationSchema.parse(body)

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified" }, { status: 200 })
    }

    const token = await createEmailVerificationToken(user.id, 24)
    await sendVerificationEmail(user.email, token)

    return NextResponse.json({ success: true, message: "Verification email sent" }, { status: 200 })
  } catch (error) {
    console.error("[API] Error resending verification:", error)
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to resend verification" }, { status: 500 })
  }
}
