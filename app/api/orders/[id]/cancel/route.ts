import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { orderService } from "@/services/order/order.service";
import { inventoryService } from "@/services/inventory/inventory.service";
import { prisma } from "@/lib/prisma";

// PUT /api/orders/{id}/cancel - Annuler une commande
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Vérifier les permissions
    if (order.userId !== session.id && session.role !== "admin" && session.role !== "seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Libérer le stock réservé
    for (const item of order.items) {
      await inventoryService.releaseStock(
        item.productId || "",
        item.variantId || undefined,
        item.quantity
      );
    }

    // Mettre à jour le statut
    const updatedOrder = await orderService.updateOrderStatus(id, "cancelled", reason);

    // Initier le remboursement si le paiement a été capturé
    if (order.paymentStatus === "completed") {
      // TODO: Créer un remboursement
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("[API] Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}

