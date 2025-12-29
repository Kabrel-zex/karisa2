import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, confirmPayment } from "@/lib/payment";

// POST /api/payments/process - Traiter un paiement
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentMethod, paymentIntentId } = body;

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: "Order ID and payment method are required" },
        { status: 400 }
      );
    }

    // Si paymentIntentId est fourni, confirmer le paiement
    if (paymentIntentId) {
      const paymentIntent = await confirmPayment(paymentIntentId);
      return NextResponse.json({ paymentIntent });
    }

    // Sinon, créer un nouveau PaymentIntent
    // Récupérer les détails de la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await createPaymentIntent({
      orderId,
      amount: Number(order.total),
      currency: order.currency,
      paymentMethod,
    });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentId: result.payment.id,
    });
  } catch (error) {
    console.error("[API] Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

