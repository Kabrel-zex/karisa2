import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createCarrierLabel, createShipment } from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import { sendShippingNotificationEmail } from "@/lib/email";
import { createNotificationsForUsers } from "@/lib/notification";

// POST /api/shipping/shipments - Créer un shipment
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, carrier, trackingNumber, service } = body;

    if (!orderId || !carrier) {
      return NextResponse.json(
        { error: "Order ID and carrier are required" },
        { status: 400 }
      );
    }

    // Vérifier que la commande appartient au vendeur
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        vendor: { userId: session.id },
      },
    });

    if (!orderItem || !orderItem.vendorId) {
      return NextResponse.json(
        { error: "Order not found or not authorized" },
        { status: 404 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, customerEmail: true, userId: true, shippingAddress: true },
    });

    if (!order || !order.userId || !order.customerEmail) {
      return NextResponse.json(
        { error: "Order missing customer information" },
        { status: 400 }
      );
    }

    const destinationCountry =
      order.shippingAddress &&
      typeof order.shippingAddress === "object" &&
      order.shippingAddress !== null &&
      "country" in order.shippingAddress
        ? (order.shippingAddress as Record<string, any>).country || "FR"
        : "FR";

    // Créer étiquette et tracking si non fourni
    let labelUrl: string | null = null;
    let finalTracking = trackingNumber as string | undefined;
    if (!finalTracking) {
      const result = await createCarrierLabel({
        orderId,
        vendorId: orderItem.vendorId,
        carrier,
        service,
        destinationCountry,
      });
      finalTracking = result.trackingNumber;
      labelUrl = result.labelUrl;
    }

    const shipment = await createShipment(
      orderId,
      orderItem.vendorId,
      carrier,
      finalTracking!,
      labelUrl,
      null,
      "label_created"
    );

    // Mettre à jour le statut de la commande
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "shipped" },
    });

    await prisma.orderHistory.create({
      data: {
        orderId,
        status: "shipped",
        note: `Expédiée via ${carrier} (${finalTracking})`,
        createdBy: session.id,
      },
    });

    // Notifications & email (fire-and-forget)
    void createNotificationsForUsers([order.userId], {
      type: "shipping",
      titleFr: "Commande expédiée",
      messageFr: `Votre commande ${order.orderNumber} a été expédiée (${carrier})`,
      link: `/account/orders/${order.id}`,
    });
    void sendShippingNotificationEmail(order.customerEmail, order.orderNumber, finalTracking!, carrier);

    return NextResponse.json({ shipment, labelUrl }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating shipment:", error);
    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 500 }
    );
  }
}

