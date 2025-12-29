import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createRefund } from "@/lib/payment";
import { prisma } from "@/lib/prisma";

// POST /api/payments/{id}/refund - Créer un remboursement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "seller")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Vérifier les permissions
    if (session.role === "seller") {
      // Vérifier que le vendeur est associé à cette commande
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: payment.orderId,
          vendor: { userId: session.id },
        },
      });

      if (!orderItem) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const refundAmount = amount || Number(payment.amount);

    const refund = await createRefund(id, refundAmount, reason);

    return NextResponse.json({ refund }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating refund:", error);
    return NextResponse.json(
      { error: "Failed to create refund" },
      { status: 500 }
    );
  }
}

