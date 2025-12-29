import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createPaymentIntent } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, paymentMethod } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Créer un PaymentIntent pour recharger le wallet
    // Dans un vrai système, créer une commande spéciale "wallet recharge"
    // const result = await createPaymentIntent({ ... });

    return NextResponse.json({
      message: "Wallet recharge initiated",
      // clientSecret: result.clientSecret,
    });
  } catch (error) {
    console.error("[API] Error recharging wallet:", error);
    return NextResponse.json(
      { error: "Failed to recharge wallet" },
      { status: 500 }
    );
  }
}

