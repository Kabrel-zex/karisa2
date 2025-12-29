import { SignupForm } from "@/components/auth/signup-form"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const session = await getSession()
  if (session) {
    redirect(session.role === "seller" ? "/vendor/dashboard" : "/")
  }

  const params = await searchParams
  const locale = (params.lang as "fr" | "en") || "fr"

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <SignupForm locale={locale} />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {locale === "fr" ? "Déjà un compte ?" : "Already have an account?"}{" "}
          <Link href={`/login?lang=${locale}`} className="font-medium text-primary hover:underline">
            {locale === "fr" ? "Se connecter" : "Login"}
          </Link>
        </p>
      </div>
    </div>
  )
}
