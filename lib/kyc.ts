import { prisma } from "./prisma";
import type { KycStatus } from "@prisma/client";

export interface KycDocumentData {
  userId: string;
  documentType: string;
  documentUrl: string;
}

export async function submitKycDocument(data: KycDocumentData) {
  return await prisma.kycDocument.create({
    data: {
      userId: data.userId,
      documentType: data.documentType,
      documentUrl: data.documentUrl,
      status: "pending",
    },
  });
}

export async function reviewKycDocument(
  documentId: string,
  reviewerId: string,
  status: KycStatus,
  rejectionReason?: string
) {
  return await prisma.kycDocument.update({
    where: { id: documentId },
    data: {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: status === "rejected" ? rejectionReason : null,
    },
  });
}

export async function getUserKycStatus(userId: string) {
  const documents = await prisma.kycDocument.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const hasApproved = documents.some((doc) => doc.status === "approved");
  const hasPending = documents.some((doc) => doc.status === "pending" || doc.status === "under_review");
  const allRejected = documents.length > 0 && documents.every((doc) => doc.status === "rejected");

  return {
    documents,
    isVerified: hasApproved,
    isPending: hasPending,
    isRejected: allRejected,
  };
}

