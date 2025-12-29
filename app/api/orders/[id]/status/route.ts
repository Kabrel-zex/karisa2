import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { orderService } from "@/services/order/order.service";

// PUT /api/orders/{id}/status - Mettre à jour le statut d'une commande
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
    const { status, note } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const order = await orderService.updateOrderStatus(id, status, note);

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[API] Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

