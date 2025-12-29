import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shipping/tracking/{trackingNumber} - Suivi en temps réel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        events: {
          orderBy: { timestamp: "desc" },
        },
        order: {
          select: {
            orderNumber: true,
            shippingAddress: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Tracking number not found" }, { status: 404 });
    }

    return NextResponse.json({
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      events: shipment.events,
      orderNumber: shipment.order.orderNumber,
    });
  } catch (error) {
    console.error("[API] Error fetching tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking information" },
      { status: 500 }
    );
  }
}

