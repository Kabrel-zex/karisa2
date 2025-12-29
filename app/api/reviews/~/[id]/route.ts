import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET /api/reviews/[id] - Obtenir un avis par ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
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
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error("[API] Error fetching review:", error)
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 })
  }
}

// PUT /api/reviews/[id] - Mettre à jour un avis
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.userId !== session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: body.rating,
        title: body.title,
        comment: body.comment,
        images: body.images,
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
      where: { productId: review.productId },
      select: { rating: true },
    })

    const averageRating =
      productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: averageRating,
      },
    })

    return NextResponse.json({ review: updatedReview })
  } catch (error) {
    console.error("[API] Error updating review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] - Supprimer un avis
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.userId !== session.id && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const productId = review.productId

    await prisma.review.delete({
      where: { id },
    })

    // Mettre à jour la note moyenne du produit
    const productReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    if (productReviews.length > 0) {
      const averageRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: averageRating,
          totalReviews: productReviews.length,
        },
      })
    } else {
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: 0,
          totalReviews: 0,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}


