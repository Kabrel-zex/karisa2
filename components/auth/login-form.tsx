"use client"

import { useState } from "react"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function LoginForm({ locale }: { locale: "fr" | "en" }) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const translations = {
    fr: {
      title: "Connexion",
      email: "Email",
      password: "Mot de passe",
      submit: "Se connecter",
      demo: "Comptes de démo",
    },
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      demo: "Demo accounts",
    },
  }

  const t = translations[locale]

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    const result = await loginAction(formData)
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
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" placeholder="email@example.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.password}</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t.submit}
        </Button>
      </form>

      <div className="rounded-lg border p-4 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{t.demo}:</p>
        <div className="text-xs space-y-1 text-muted-foreground">
          <p>Buyer: customer1@example.com</p>
          <p>Seller: vendor1@example.com</p>
          <p>Admin: admin@marketplace.com</p>
          <p className="text-[10px] mt-2">Password: Use any password (demo mode)</p>
        </div>
      </div>
    </div>
  )
}
