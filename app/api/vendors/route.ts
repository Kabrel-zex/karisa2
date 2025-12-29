import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/vendors - Liste des vendeurs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit")
    const verified = searchParams.get("verified")

    const where: any = {
      isActive: true,
    }

    if (verified === "true") {
      where.isVerified = true
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { totalSales: "desc" },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json({ vendors, count: vendors.length })
  } catch (error) {
    console.error("[API] Error fetching vendors:", error)
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}


