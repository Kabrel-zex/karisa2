import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// PUT /api/cart/[id] - Mettre à jour un article du panier
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { quantity } = body

    if (quantity === undefined) {
      return NextResponse.json({ error: "Quantity is required" }, { status: 400 })
    }

    if (quantity <= 0) {
      // Supprimer l'article si la quantité est 0 ou négative
      await prisma.cartItem.delete({
        where: { id, userId: session.id },
      })
      return NextResponse.json({ success: true, deleted: true })
    }

    const cartItem = await prisma.cartItem.update({
      where: { id, userId: session.id },
      data: { quantity },
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

    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error("[API] Error updating cart item:", error)
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

// DELETE /api/cart/[id] - Supprimer un article du panier
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.cartItem.delete({
      where: { id, userId: session.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error removing cart item:", error)
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}


