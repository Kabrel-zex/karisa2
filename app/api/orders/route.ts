import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createNotificationsForUsers } from "@/lib/notification"

// GET /api/orders - Liste des commandes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.id }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
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
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json({ orders, count: orders.length })
  } catch (error) {
    console.error("[API] Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST /api/orders - Créer une commande
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      shippingAddress,
      billingAddress,
      paymentMethod = "credit_card",
      shippingMethod = "standard",
      notes,
    } = body

    // Récupérer les articles du panier
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.id },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
        variant: true,
      },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculer les totaux
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const tax = subtotal * 0.2 // 20% TVA
    const shippingCost = shippingMethod === "express" ? 9.99 : shippingMethod === "priority" ? 19.99 : 5.99
    const total = subtotal + tax + shippingCost

    // Générer un numéro de commande
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Créer la commande avec les articles dans une transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.id,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: paymentMethod as any,
        shippingMethod: shippingMethod as any,
        subtotal,
        tax,
        shippingCost,
        total,
        currency: "EUR",
        customerEmail: session.email,
        customerPhone: shippingAddress?.phone || null,
        shippingAddress: shippingAddress || {},
        billingAddress: billingAddress || shippingAddress || {},
        notes: notes || null,
        items: {
          create: cartItems.map((item) => {
            const itemTotal = Number(item.price) * item.quantity
            const commissionRate = Number(item.product.vendor.commissionRate) || 10
            const commissionAmount = itemTotal * (commissionRate / 100)

            return {
              productId: item.productId,
              variantId: item.variantId,
              vendorId: item.product.vendor.id,
              productName: item.product.nameFr,
              productSku: item.product.sku || "",
              variantName: item.variant?.name || null,
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
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            variant: true,
          },
        },
      },
    })

    // Mettre à jour le stock des produits
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
          totalSales: { increment: item.quantity },
        },
      })
    }

    // Vider le panier
    await prisma.cartItem.deleteMany({
      where: { userId: session.id },
    })

    // Notifications & email (fire-and-forget)
    void createNotificationsForUsers([session.id], {
      type: "order",
      titleFr: "Commande confirmée",
      messageFr: `Votre commande ${order.orderNumber} est confirmée`,
      link: `/account/orders/${order.id}`,
    })
    void sendOrderConfirmationEmail(
      session.email,
      order.orderNumber,
      Number(order.total),
      order.items.map((item) => ({
        name: item.productName || item.product?.nameFr || "Article",
        quantity: item.quantity,
        price: Number(item.price),
      }))
    )

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}


