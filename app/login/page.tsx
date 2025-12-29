"use server"

import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const session = await getSession()
  if (session) {
    redirect(`/vendor/dashboard`)
  }

  const params = await searchParams
  const locale = (params.lang as "fr" | "en") || "fr"

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <LoginForm locale={locale} />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {locale === "fr" ? "Pas encore de compte ?" : "Don't have an account?"}{" "}
          <Link href={`/signup?lang=${locale}`} className="font-medium text-primary hover:underline">
            {locale === "fr" ? "S'inscrire" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  )
}
