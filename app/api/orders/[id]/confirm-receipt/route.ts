import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { orderService } from "@/services/order/order.service";
import { prisma } from "@/lib/prisma";

// POST /api/orders/{id}/confirm-receipt - Confirmer la réception d'une commande
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que la commande appartient à l'utilisateur
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Mettre à jour le statut
    const updatedOrder = await orderService.updateOrderStatus(id, "delivered", "Confirmed by customer");

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("[API] Error confirming receipt:", error);
    return NextResponse.json(
      { error: "Failed to confirm receipt" },
      { status: 500 }
    );
  }
}

