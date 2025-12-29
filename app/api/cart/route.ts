import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET /api/cart - Obtenir le panier de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            vendor: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    return NextResponse.json({
      items,
      subtotal,
      itemCount: items.length,
    })
  } catch (error) {
    console.error("[API] Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

// POST /api/cart - Ajouter un article au panier
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1, variantId } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Vérifier le produit et son stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, stockQuantity: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Vérifier si l'article existe déjà dans le panier
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.id,
        productId,
        variantId: variantId || null,
      },
    })

    let cartItem
    if (existing) {
      // Mettre à jour la quantité
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      })
    } else {
      // Créer un nouvel article
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.id,
          productId,
          variantId: variantId || null,
          quantity,
          price: product.price,
        },
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      })
    }

    return NextResponse.json({ cartItem }, { status: 201 })
  } catch (error) {
    console.error("[API] Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

// DELETE /api/cart - Vider le panier
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}


