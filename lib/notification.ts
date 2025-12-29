import { prisma } from "./prisma"

type NotificationInput = {
  type: string
  titleFr: string
  titleEn?: string
  messageFr?: string
  messageEn?: string
  link?: string
}

export async function createNotificationsForUsers(userIds: string[], input: NotificationInput) {
  if (!userIds.length) return
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: input.type,
      titleFr: input.titleFr,
      titleEn: input.titleEn || input.titleFr,
      messageFr: input.messageFr || null,
      messageEn: input.messageEn || input.messageFr || null,
      link: input.link || null,
    })),
  })
}
