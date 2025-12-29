"use client"

import { useState } from "react"
import { signupAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

export function SignupForm({ locale }: { locale: "fr" | "en" }) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const translations = {
    fr: {
      title: "Créer un compte",
      name: "Nom complet",
      email: "Email",
      password: "Mot de passe",
      accountType: "Type de compte",
      buyer: "Acheteur",
      seller: "Vendeur",
      submit: "S'inscrire",
    },
    en: {
      title: "Create account",
      name: "Full name",
      email: "Email",
      password: "Password",
      accountType: "Account type",
      buyer: "Buyer",
      seller: "Seller",
      submit: "Sign up",
    },
  }

  const t = translations[locale]

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    formData.append("language", locale)
    const result = await signupAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t.title}</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t.name}</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" placeholder="email@example.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.password}</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <div className="space-y-2">
          <Label>{t.accountType}</Label>
          <RadioGroup defaultValue="buyer" name="role">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buyer" id="buyer" />
              <Label htmlFor="buyer" className="font-normal cursor-pointer">
                {t.buyer}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="seller" id="seller" />
              <Label htmlFor="seller" className="font-normal cursor-pointer">
                {t.seller}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t.submit}
        </Button>
      </form>
    </div>
  )
}
