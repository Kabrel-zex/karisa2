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
    const { orderId, amount, currency, paymentMethod } = body;

    if (!orderId || !amount || !currency || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createPaymentIntent({
      orderId,
      amount,
      currency,
      paymentMethod,
    });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentId: result.payment.id,
    });
  } catch (error) {
    console.error("[API] Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

