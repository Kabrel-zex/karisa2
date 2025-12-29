/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "./prisma"

export type CartItemWithDetails = {
  id: string
  userId: string
  productId: string
  variantId: string | null
  quantity: number
  price: any
  product: {
    id: string
    nameFr: string
    nameEn: string
    stockQuantity: number
    images: Array<{ imageUrl: string; isPrimary: boolean }>
    vendor: {
      id: string
      businessName: string
    }
  }
}

export async function getCartItems(userId: string): Promise<CartItemWithDetails[]> {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId },
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
      },
      orderBy: { createdAt: "desc" },
    })
    return items as any
  } catch (error) {
    console.error("[v0] Error fetching cart items:", error)
    return []
  }
}

export async function getCartTotal(userId: string) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      select: {
        price: true,
        quantity: true,
      },
    })

    const subtotal = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity
    }, 0)

    return {
      itemCount: items.length,
      subtotal,
    }
  } catch (error) {
    console.error("[v0] Error fetching cart total:", error)
    return { itemCount: 0, subtotal: 0 }
  }
}
