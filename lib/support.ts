import { prisma } from "./prisma";
import type { TicketStatus, TicketPriority } from "@prisma/client";

export interface CreateTicketData {
  userId: string;
  category: string;
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export async function createSupportTicket(data: CreateTicketData) {
  return await prisma.supportTicket.create({
    data: {
      userId: data.userId,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "medium",
      status: "open",
    },
  });
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  assignedTo?: string
) {
  return await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      assignedTo,
      ...(status === "resolved" && { resolvedAt: new Date() }),
    },
  });
}

export async function getTickets(userId?: string, status?: TicketStatus) {
  return await prisma.supportTicket.findMany({
    where: {
      ...(userId && { userId }),
      ...(status && { status }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

