"use server"

import {prisma} from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { getCartItems } from "@/lib/cart"
import { redirect } from "next/navigation"

export async function createOrder(formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    // Get cart items
    const cartItems = await getCartItems(session.id)
    if (cartItems.length === 0) {
      return { error: "Cart is empty" }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const tax = subtotal * 0.2 // 20% VAT
    const shippingCost = 5.99
    const total = subtotal + tax + shippingCost

    // Create shipping address object
    const shippingAddress = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address_line1: formData.get("address_line1") as string,
      address_line2: formData.get("address_line2") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      country: formData.get("country") as string,
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`

    // Create order with items in a transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.id,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "credit_card",
        subtotal,
        tax,
        shippingCost,
        total,
        customerEmail: session.email,
        customerPhone: shippingAddress.phone,
        shippingAddress,
        billingAddress: shippingAddress,
        items: {
          create: cartItems.map((item) => {
            const itemTotal = Number(item.price) * item.quantity
            const commissionRate = 10
            const commissionAmount = itemTotal * (commissionRate / 100)

            return {
              productId: item.productId,
              variantId: item.variantId,
              vendorId: item.product.vendor.id,
              productName: item.product.nameFr,
              productSku: "",
              quantity: item.quantity,
              price: item.price,
              subtotal: itemTotal,
              commissionRate,
              commissionAmount,
            }
          }),
        },
        history: {
          create: {
            status: "pending",
            note: "Order created",
            createdBy: session.id,
          },
        },
      },
    })

    // Update product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
          totalSales: { increment: item.quantity },
        },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.id },
    })

    redirect(`/account/orders/${order.id}?lang=${session.language}`)
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return { error: "Failed to create order" }
  }
}
