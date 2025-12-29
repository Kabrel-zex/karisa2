"use server"

import {prisma} from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function addToCart(productId: string, quantity = 1, variantId?: string) {
  const session = await getSession()
  if (!session) {
    return { error: "Please login to add items to cart" }
  }

  try {
    // Get product price and stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, stockQuantity: true },
    })

    if (!product) {
      return { error: "Product not found" }
    }

    if (product.stockQuantity < quantity) {
      return { error: "Insufficient stock" }
    }

    // Check if item already exists in cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.id,
        productId,
        variantId: variantId || null,
      },
    })

    if (existing) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
    } else {
      // Insert new item
      await prisma.cartItem.create({
        data: {
          userId: session.id,
          productId,
          variantId: variantId || null,
          quantity,
          price: product.price,
        },
      })
    }

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error adding to cart:", error)
    return { error: "Failed to add to cart" }
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const session = await getSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId, userId: session.id },
      })
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId, userId: session.id },
        data: { quantity },
      })
    }

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating cart:", error)
    return { error: "Failed to update cart" }
  }
}

export async function removeFromCart(cartItemId: string) {
  const session = await getSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId, userId: session.id },
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error removing from cart:", error)
    return { error: "Failed to remove from cart" }
  }
}

export async function clearCart() {
  const session = await getSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: session.id },
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error clearing cart:", error)
    return { error: "Failed to clear cart" }
  }
}
