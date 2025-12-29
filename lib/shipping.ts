/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "./prisma";
import { addDays } from "date-fns";
import type { ShipmentStatus } from "@prisma/client";

export interface ShippingRate {
  carrier: string;
  method: string;
  service: string;
  cost: number;
  estimatedDays: number;
  pickup?: boolean;
}

type CarrierService = {
  name: string;
  service: string;
  base: number;
  perKg: number;
  estimatedDays: number;
  pickup?: boolean;
};

const CARRIERS: Record<string, CarrierService[]> = {
  colissimo: [
    { name: "Colissimo Standard", service: "standard", base: 4.9, perKg: 1.2, estimatedDays: 3 },
    { name: "Colissimo Eco", service: "eco", base: 3.9, perKg: 1.0, estimatedDays: 5 },
  ],
  "mondial_relay": [
    {
      name: "Mondial Relay Point Relais",
      service: "pickup",
      base: 3.5,
      perKg: 0.9,
      estimatedDays: 4,
      pickup: true,
    },
  ],
};

function computeCost(base: number, perKg: number, weightKg: number) {
  const extra = Math.max(0, weightKg - 1);
  return Number((base + perKg * extra).toFixed(2));
}

export async function calculateShippingRates(orderId: string, destinationCountry = "FR"): Promise<ShippingRate[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) throw new Error("Order not found");

  const totalWeight =
    order.items.reduce((sum, item) => {
      // use product weight if provided, default 0.5kg
      const productWeight = item.product?.weight ? Number(item.product.weight) : 0.5;
      return sum + item.quantity * productWeight;
    }, 0) || 0.5;

  const normalizedCountry = destinationCountry.toUpperCase();
  const isFrance = normalizedCountry === "FR";

  const rates: ShippingRate[] = [];
  for (const [carrier, services] of Object.entries(CARRIERS)) {
    // very simple availability: Colissimo for FR/EU, Mondial Relay only FR
    if (carrier === "mondial_relay" && !isFrance) continue;

    services.forEach((svc) => {
      const estimatedDays = isFrance ? svc.estimatedDays : svc.estimatedDays + 2;
      rates.push({
        carrier,
        method: svc.name,
        service: svc.service,
        pickup: svc.pickup,
        estimatedDays,
        cost: computeCost(svc.base, svc.perKg, totalWeight),
      });
    });
  }

  return rates;
}

export function generateTrackingNumber(carrier: string) {
  return `${carrier.toUpperCase().slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function createCarrierLabel(params: {
  orderId: string;
  vendorId: string;
  carrier: string;
  service?: string;
  destinationCountry?: string;
}) {
  const trackingNumber = generateTrackingNumber(params.carrier);
  const estimatedDelivery = addDays(new Date(), params.carrier === "mondial_relay" ? 4 : 3);
  const labelUrl = `https://labels.example.com/${trackingNumber}.pdf`;

  const shipment = await createShipment(
    params.orderId,
    params.vendorId,
    params.carrier,
    trackingNumber,
    labelUrl,
    estimatedDelivery,
    "label_created"
  );

  return { trackingNumber, labelUrl, shipment };
}

export async function createShipment(
  orderId: string,
  vendorId: string,
  carrier: string,
  trackingNumber: string,
  labelUrl?: string | null,
  estimatedDelivery?: Date | null,
  status: ShipmentStatus = "pending"
) {
  return await prisma.shipment.create({
    data: {
      orderId,
      vendorId,
      carrier,
      trackingNumber,
      labelUrl: labelUrl || null,
      estimatedDelivery: estimatedDelivery || null,
      status,
    },
  });
}

export async function updateShipmentStatus(
  trackingNumber: string,
  status: ShipmentStatus,
  location?: string,
  description?: string,
  estimatedDelivery?: Date | null
) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
  });

  if (!shipment) {
    throw new Error("Shipment not found");
  }

  await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status,
      location,
      description,
      timestamp: new Date(),
    },
  });

  return await prisma.shipment.update({
    where: { trackingNumber },
    data: {
      status,
      ...(estimatedDelivery ? { estimatedDelivery } : {}),
      ...(status === "delivered" && { actualDelivery: new Date() }),
    },
  });
}

