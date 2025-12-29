import { prisma } from "./prisma";

export async function createConversation(
  senderId: string,
  receiverId: string,
  subject?: string,
  orderId?: string,
  productId?: string
) {
  // Vérifier si une conversation existe déjà
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      ...(orderId && { orderId }),
      ...(productId && { productId }),
    },
  });

  if (existing) {
    return existing;
  }

  return await prisma.conversation.create({
    data: {
      senderId,
      receiverId,
      subject,
      orderId,
      productId,
    },
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  return await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
    },
  });
}

export async function getConversations(userId: string) {
  return await prisma.conversation.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getMessages(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || (conversation.senderId !== userId && conversation.receiverId !== userId)) {
    throw new Error("Unauthorized");
  }

  // Marquer les messages comme lus
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  return await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

