import { prisma } from "./prisma";
import type { DisputeType, DisputeStatus } from "@prisma/client";

export interface CreateDisputeData {
  orderId: string;
  userId: string;
  type: DisputeType;
  description: string;
  evidence?: Array<{ type: string; content: string; fileUrl?: string }>;
}

export async function createDispute(data: CreateDisputeData) {
  const dispute = await prisma.dispute.create({
    data: {
      orderId: data.orderId,
      userId: data.userId,
      type: data.type,
      status: "open",
      description: data.description,
      evidence: {
        create: data.evidence || [],
      },
    },
    include: {
      evidence: true,
    },
  });

  return dispute;
}

export async function resolveDispute(
  disputeId: string,
  moderatorId: string,
  decision: string,
  justification: string,
  refundAmount?: number
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  // Créer la décision
  await prisma.disputeDecision.create({
    data: {
      disputeId,
      decision,
      justification,
      refundAmount,
      decidedBy: moderatorId,
    },
  });

  // Mettre à jour le statut du litige
  const updatedDispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: decision === "favor_buyer" ? "resolved" : "closed",
      resolvedBy: moderatorId,
      resolvedAt: new Date(),
    },
  });

  // Si remboursement nécessaire
  if (refundAmount && decision === "favor_buyer") {
    const order = await prisma.order.findUnique({
      where: { id: dispute.orderId },
      include: { payments: true },
    });

    if (order && order.payments.length > 0) {
      // Créer le remboursement
      // Note: Implémenter la logique de remboursement via le service de paiement
    }
  }

  return updatedDispute;
}

export async function appealDispute(disputeId: string, reason: string) {
  return await prisma.appealRequest.create({
    data: {
      disputeId,
      reason,
      status: "pending",
    },
  });
}

