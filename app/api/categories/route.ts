/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/categories - Liste des catégories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const parentId = searchParams.get("parentId")
    const includeChildren = searchParams.get("includeChildren") === "true"
    const limit = searchParams.get("limit")

    const where: any = {
      isActive: true,
    }

    if (parentId === "null" || parentId === null) {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: includeChildren
          ? {
              where: { isActive: true },
            }
          : false,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: "asc" },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json({ categories, count: categories.length })
  } catch (error) {
    console.error("[API] Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}


