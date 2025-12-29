import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/payments/{transactionId} - Récupérer les détails d'une transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId } = await params;

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { id: transactionId },
          { transactionId },
          { paymentIntentId: transactionId },
        ],
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true,
            total: true,
          },
        },
        refunds: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Vérifier les permissions
    if (payment.order.userId !== session.id && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("[API] Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

