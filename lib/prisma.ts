// index.ts
// Query your database using the Accelerate Client extension

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma =
  globalForPrisma.prisma || new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate())

export { prisma }
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
