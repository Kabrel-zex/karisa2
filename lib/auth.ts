import { prisma } from "./prisma"
import type { User, Vendor, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export type { User, Vendor }

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  } catch (error) {
    console.error("[v0] Error fetching user by email:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return user
  } catch (error) {
    console.error("[v0] Error fetching user by id:", error)
    return null
  }
}

export async function createUser(data: {
  email: string
  password: string
  name?: string
  role?: UserRole
  language?: string
}): Promise<User | null> {
  try {
    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name || null,
        role: data.role || "buyer",
        language: data.language || "fr",
        isVerified: false,
      },
    })

    return user
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, passwordHash)
  } catch (error) {
    console.error(" Error verifying password:", error)
    return false
  }
}

export async function getVendorByUserId(userId: string): Promise<Vendor | null> {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    })
    return vendor
  } catch (error) {
    console.error(" Error fetching vendor:", error)
    return null
  }
}

export async function createEmailVerificationToken(userId: string, expiresInHours = 24) {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
  return token
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return { ok: false, reason: "invalid" as const }
  if (record.usedAt) return { ok: false, reason: "used" as const }
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" as const }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    }),
  ])

  return { ok: true, user: record.user }
}

export async function createRefreshToken(userId: string, token: string, expiresAt: Date) {
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  })
}

export async function rotateRefreshToken(oldToken: string, newToken: string, expiresAt: Date) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.refreshToken.findUnique({ where: { token: oldToken } })
    if (!existing || existing.revoked || existing.expiresAt < new Date()) {
      throw new Error("Invalid refresh token")
    }
    await tx.refreshToken.update({
      where: { token: oldToken },
      data: { revoked: true },
    })
    await tx.refreshToken.create({
      data: {
        userId: existing.userId,
        token: newToken,
        expiresAt,
      },
    })
    return existing.userId
  })
}

export async function isRefreshTokenValid(token: string) {
  const found = await prisma.refreshToken.findUnique({
    where: { token },
  })
  if (!found) return null
  if (found.revoked) return null
  if (found.expiresAt < new Date()) return null
  return found
}
