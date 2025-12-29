import { NextRequest, NextResponse } from "next/server"
import { vendorApplicationSchema } from "@/lib/validators/vendor"
import { getUserById } from "@/lib/auth"
import { encryptIban } from "@/lib/crypto"
import { generateUniqueVendorSlug } from "@/lib/vendor"
import { prisma } from "@/lib/prisma"
import { verifyAccessToken } from "@/lib/jwt"
import { sendVendorApplicationReceivedEmail, sendAdminVendorApplicationAlert } from "@/lib/email"
import { createNotificationsForUsers } from "@/lib/notification"

// POST /api/vendors/apply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = vendorApplicationSchema.parse(body)

    const accessToken = request.cookies.get("access_token")?.value
    const payload = accessToken ? verifyAccessToken(accessToken) : null
    const userId = payload?.userId
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingApp = await prisma.vendorApplication.findUnique({ where: { userId } })
    if (existingApp) {
      return NextResponse.json({ error: "Application already submitted" }, { status: 409 })
    }
    const existingVendor = await prisma.vendor.findUnique({ where: { userId } })
    if (existingVendor) {
      return NextResponse.json({ error: "Vendor already exists" }, { status: 409 })
    }

    const slug = await generateUniqueVendorSlug(parsed.businessName)

    const ibanEncrypted = parsed.iban ? encryptIban(parsed.iban) : null

    const app = await prisma.vendorApplication.create({
      data: {
        userId,
        businessName: parsed.businessName,
        slug,
        description: parsed.description || null,
        businessType: parsed.businessType || null,
        legalStatus: parsed.legalStatus || null,
        siret: parsed.siret || null,
        ibanEncrypted,
        portfolio: parsed.portfolio || undefined,
        motivation: parsed.motivation || null,
        status: "pending",
      },
    })

    void sendVendorApplicationReceivedEmail(user.email, parsed.businessName)
    // Simple admin alert (if ADMIN_ALERT_EMAIL env set) and in-app notification to admins
    const adminEmail = process.env.ADMIN_ALERT_EMAIL
    if (adminEmail) {
      void sendAdminVendorApplicationAlert(adminEmail, user.email, parsed.businessName)
    }
    const adminIds = (
      await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } })
    ).map((u) => u.id)
    void createNotificationsForUsers(adminIds, {
      type: "vendor_application",
      titleFr: "Nouvelle candidature vendeur",
      messageFr: `${parsed.businessName} (${user.email})`,
      link: "/admin/vendor-applications",
    })

    return NextResponse.json({ success: true, application: app }, { status: 201 })
  } catch (error) {
    console.error("[API] Error applying as vendor:", error)
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
