import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { vendorDecisionSchema } from "@/lib/validators/vendor"
import { verifyAccessToken } from "@/lib/jwt"
import { generateUniqueVendorSlug } from "@/lib/vendor"
import { sendVendorApplicationApprovalEmail } from "@/lib/email"
import { createNotificationsForUsers } from "@/lib/notification"

function requireAdmin(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value
  const payload = accessToken ? verifyAccessToken(accessToken) : null
  if (!payload || payload.role !== "admin") {
    return null
  }
  return payload
}

// POST /api/admin/vendor-applications/[id]/approve
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id
  const body = await request.json()
  const parsed = vendorDecisionSchema.parse(body)
  if (parsed.status !== "approved") {
    return NextResponse.json({ error: "Use reject endpoint for rejection" }, { status: 400 })
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

  const slug = await generateUniqueVendorSlug(app.businessName)

  const result = await prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.create({
      data: {
        userId: app.userId,
        businessName: app.businessName,
        slug,
        businessDescription: app.description,
        businessType: app.businessType,
        taxId: app.siret,
        isVerified: true,
        isActive: true,
      },
    })

    await tx.vendorApplication.update({
      where: { id },
      data: {
        status: "approved",
        adminNote: parsed.adminNote || null,
        decidedAt: new Date(),
      },
    })

    await tx.user.update({
      where: { id: app.userId },
      data: { role: "seller", isVerified: true },
    })

    return vendor
  })

  void sendVendorApplicationApprovalEmail(app.user.email, app.businessName)
  void createNotificationsForUsers([app.userId], {
    type: "vendor_application",
    titleFr: "Candidature approuvée",
    messageFr: `Votre boutique ${app.businessName} est approuvée`,
    link: "/vendor",
  })

  return NextResponse.json({ success: true, vendor: result })
}
