import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must include uppercase letter")
    .regex(/[0-9]/, "Must include number")
    .regex(/[^A-Za-z0-9]/, "Must include special character"),
  name: z.string().min(1),
  role: z.enum(["buyer", "seller", "admin"]).optional(),
  language: z.string().default("fr"),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
})

export const resendVerificationSchema = z.object({
  email: z.string().email(),
})
