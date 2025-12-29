import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks/paypal - Webhook PayPal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Vérifier la signature PayPal (à implémenter)
    // const isValid = verifyPayPalWebhook(body, signature);

    // Traiter les événements PayPal
    const eventType = body.event_type;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        // Traiter le paiement complété
        break;

      case "PAYMENT.CAPTURE.DENIED":
        // Traiter le paiement refusé
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        // Traiter le remboursement
        break;

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[API] Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

