import {prisma} from "./prisma"
import type { Product, Category } from "@prisma/client"

export type ProductWithDetails = Product & {
  images: Array<{ id: string; imageUrl: string; altText: string | null; isPrimary: boolean }>
  category: Category | null
  vendor: {
    id: string
    businessName: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rating: any
    totalReviews: number
  } | null
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithDetails[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        status: "active",
      },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: { totalSales: "desc" },
      take: limit,
    })
    return products as ProductWithDetails[]
  } catch (error) {
    console.error("[v0] Error fetching featured products:", error)
    return []
  }
}

export async function getTopCategories(limit = 8): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      orderBy: { displayOrder: "asc" },
      take: limit,
    })
    return categories
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return []
  }
}

export async function getProducts(filters?: {
  category?: string
  vendor?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}): Promise<ProductWithDetails[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: "active",
    }

    if (filters?.category) {
      where.category = {
        slug: filters.category,
      }
    }

    if (filters?.vendor) {
      where.vendorId = filters.vendor
    }

    if (filters?.search) {
      where.OR = [
        { nameFr: { contains: filters.search, mode: "insensitive" } },
        { nameEn: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit,
      skip: filters?.offset,
    })

    return products as ProductWithDetails[]
  } catch (error) {
    console.error(" Error fetching products:", error)
    return []
  }
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            totalReviews: true,
          },
        },
      },
    })
    return product as ProductWithDetails | null
  } catch (error) {
    console.error(" Error fetching product:", error)
    return null
  }
}
