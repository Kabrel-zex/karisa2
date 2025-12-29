import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { calculateShipping } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, destination } = body;

    if (!orderId || !destination) {
      return NextResponse.json(
        { error: "Order ID and destination are required" },
        { status: 400 }
      );
    }

    const rates = await calculateShipping(orderId, destination);

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("[API] Error calculating shipping:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}

