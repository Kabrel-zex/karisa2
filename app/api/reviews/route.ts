import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET /api/reviews - Liste des avis
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId")
    const limit = searchParams.get("limit")

    const where: any = {}

    if (productId) {
      where.productId = productId
    }

    if (userId) {
      where.userId = userId
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        product: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json({ reviews, count: reviews.length })
  } catch (error) {
    console.error("[API] Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST /api/reviews - Créer un avis
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, orderItemId, rating, title, comment, images } = body

    if (!productId || !rating) {
      return NextResponse.json({ error: "Product ID and rating are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.id,
        orderItemId: orderItemId || null,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: "Review already exists" }, { status: 409 })
    }

    // Vérifier si l'utilisateur a acheté le produit (si orderItemId est fourni)
    if (orderItemId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          id: orderItemId,
          order: {
            userId: session.id,
          },
        },
      })

      if (!orderItem) {
        return NextResponse.json({ error: "Order item not found" }, { status: 404 })
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.id,
        orderItemId: orderItemId || null,
        rating,
        title: title || null,
        comment: comment || null,
        images: images || null,
        isVerifiedPurchase: !!orderItemId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Mettre à jour la note moyenne du produit
    const productReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    const averageRating =
      productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: averageRating,
        totalReviews: productReviews.length,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}


