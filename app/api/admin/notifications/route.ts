import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

function requireAdmin(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value
  const payload = accessToken ? verifyAccessToken(accessToken) : null
  if (!payload || payload.role !== "admin") return null
  return payload
}

// GET /api/admin/notifications - liste des notifications (admin)
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ notifications })
}
