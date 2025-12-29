import Stripe from "stripe";
import { prisma } from "./prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  //apiVersion: "2024-12-18.acacia",
});

export interface PaymentIntentData {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export async function createPaymentIntent(data: PaymentIntentData) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Créer le PaymentIntent avec Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100), // Convertir en centimes
    currency: data.currency.toLowerCase(),
    payment_method_types: ["card"],
    metadata: {
      orderId: data.orderId,
      orderNumber: order.orderNumber,
    },
  });

  // Créer l'enregistrement Payment dans la base de données
  const payment = await prisma.payment.create({
    data: {
      orderId: data.orderId,
      paymentIntentId: paymentIntent.id,
      amount: data.amount,
      currency: data.currency,
      status: "pending",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      method: data.paymentMethod as any,
    },
  });

  return {
    paymentIntent,
    payment,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function confirmPayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === "succeeded") {
    // Trouver le payment par paymentIntentId
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "completed",
        transactionId: paymentIntent.latest_charge as string,
        capturedAt: new Date(),
      },
    });

    if (payment) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "completed",
          status: "confirmed",
        },
      });
    }
  }

  return paymentIntent;
}

export async function createRefund(paymentId: string, amount: number, reason: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || !payment.paymentIntentId) {
    throw new Error("Payment not found");
  }

  // Créer le remboursement via Stripe
  const refund = await stripe.refunds.create({
    payment_intent: payment.paymentIntentId,
    amount: Math.round(amount * 100),
    reason: reason as Stripe.RefundCreateParams.Reason,
  });

  // Enregistrer le remboursement dans la base de données
  const refundRecord = await prisma.refund.create({
    data: {
      paymentId,
      amount,
      reason,
      status: refund.status === "succeeded" ? "completed" : "pending",
      refundId: refund.id,
      processedAt: refund.status === "succeeded" ? new Date() : null,
    },
  });

  return refundRecord;
}

