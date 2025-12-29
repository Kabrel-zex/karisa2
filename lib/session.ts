"use server"

import { cookies } from "next/headers"

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: "buyer" | "seller" | "admin"
  language: string
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies()
  cookieStore.set("user_session", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user_session")
    if (!sessionCookie?.value) return null
    return JSON.parse(sessionCookie.value) as SessionUser
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")
}
