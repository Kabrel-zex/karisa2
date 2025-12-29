import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// GET /api/orders/[id] - Obtenir une commande par ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
            vendor: true,
          },
        },
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est propriétaire de la commande ou est admin/vendeur
    if (order.userId !== session.id && session.role !== "admin" && session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("[API] Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Mettre à jour une commande (statut, etc.)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Vérifier que l'utilisateur est propriétaire ou admin
    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.userId !== session.id && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: body.status,
        paymentStatus: body.paymentStatus,
        trackingNumber: body.trackingNumber,
        notes: body.notes,
        ...(body.status && {
          history: {
            create: {
              status: body.status,
              note: body.note || `Order status updated to ${body.status}`,
              createdBy: session.id,
            },
          },
        }),
      },
      include: {
        items: true,
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error("[API] Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}


