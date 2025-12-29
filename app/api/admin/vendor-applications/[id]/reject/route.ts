import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { vendorDecisionSchema } from "@/lib/validators/vendor"
import { verifyAccessToken } from "@/lib/jwt"
import { sendVendorApplicationRejectionEmail } from "@/lib/email"

function requireAdmin(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value
  const payload = accessToken ? verifyAccessToken(accessToken) : null
  if (!payload || payload.role !== "admin") {
    return null
  }
  return payload
}

// POST /api/admin/vendor-applications/[id]/reject
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id
  const body = await request.json()
  const parsed = vendorDecisionSchema.parse(body)
  if (parsed.status !== "rejected") {
    return NextResponse.json({ error: "Use approve endpoint for approval" }, { status: 400 })
  }

  const app = await prisma.vendorApplication.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }
  if (app.status !== "pending") {
    return NextResponse.json({ error: "Application already processed" }, { status: 400 })
  }

  await prisma.vendorApplication.update({
    where: { id },
    data: {
      status: "rejected",
      adminNote: parsed.adminNote || null,
      decidedAt: new Date(),
    },
  })

  void sendVendorApplicationRejectionEmail(app.user.email, app.businessName, parsed.adminNote || undefined)

  return NextResponse.json({ success: true })
}
