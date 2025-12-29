import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { calculateShippingRates } from "@/lib/shipping";

// GET /api/shipping/methods - Liste des méthodes de livraison disponibles
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const country = searchParams.get("country") || "FR";

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const rates = await calculateShippingRates(orderId, country);

    const methods = rates.map((rate) => ({
      id: rate.service,
      name: rate.method,
      carrier: rate.carrier,
      estimatedDays: rate.estimatedDays,
      cost: rate.cost,
      pickup: rate.pickup ?? false,
      available: true,
    }));

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("[API] Error fetching shipping methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping methods" },
      { status: 500 }
    );
  }
}

