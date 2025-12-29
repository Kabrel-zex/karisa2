"use server"

import { getUserByEmail, createUser, verifyPassword } from "@/lib/auth"
import { setSession, clearSession } from "@/lib/session"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const user = await getUserByEmail(email)

  if (!user) {
    return { error: "Invalid credentials" }
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    return { error: "Invalid credentials" }
  }

  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
  })

  redirect(user.role === "seller" ? "/vendor/dashboard" : "/")
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string
  const role = (formData.get("role") as "buyer" | "seller") || "buyer"
  const language = (formData.get("language") as string) || "fr"

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { error: "User already exists" }
  }

  const user = await createUser({ email, name, password, role, language })

  if (!user) {
    return { error: "Failed to create user" }
  }

  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    language: user.language,
  })

  redirect(role === "seller" ? "/vendor/dashboard" : "/")
}

export async function logoutAction() {
  await clearSession()
  redirect("/")
}
