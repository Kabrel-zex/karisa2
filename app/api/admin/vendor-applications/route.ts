import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAccessToken } from "@/lib/jwt"

function requireAdmin(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value
  const payload = accessToken ? verifyAccessToken(accessToken) : null
  if (!payload || payload.role !== "admin") {
    return null
  }
  return payload
}

// GET /api/admin/vendor-applications?status=pending|approved|rejected
export async function GET(request: NextRequest) {
  const admin = requireAdmin(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get("status") as
    | "pending"
    | "approved"
    | "rejected"
    | null

  const where = status ? { status } : {}

  const applications = await prisma.vendorApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  })

  return NextResponse.json({ applications })
}
