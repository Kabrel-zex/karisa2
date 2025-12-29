import { z } from "zod"

export const vendorApplicationSchema = z.object({
  businessName: z.string().min(2),
  description: z.string().optional(),
  businessType: z.string().optional(),
  legalStatus: z.string().optional(),
  siret: z.string().min(9).max(14).optional(),
  iban: z.string().min(10).optional(),
  portfolio: z.array(z.string().url()).optional(),
  motivation: z.string().optional(),
})

export const vendorDecisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminNote: z.string().optional(),
})
