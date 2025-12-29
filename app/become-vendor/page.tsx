import { getTranslations } from "@/lib/i18n"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BecomeVendorForm } from "@/components/vendor/become-vendor-form"
import { CheckCircle } from "lucide-react"

export default async function BecomeVendorPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const t = getTranslations(locale)
  const session = await getSession()

  if (!session) {
    redirect(`/login?lang=${locale}&redirect=/become-vendor`)
  }

  if (session.role === "seller") {
    redirect(`/vendor/dashboard?lang=${locale}`)
  }

  const benefits = [
    t.vendorBenefit1 || "Reach millions of customers worldwide",
    t.vendorBenefit2 || "Easy-to-use seller dashboard",
    t.vendorBenefit3 || "Secure payment processing",
    t.vendorBenefit4 || "Marketing and promotional tools",
    t.vendorBenefit5 || "24/7 seller support",
    t.vendorBenefit6 || "Low commission rates",
  ]

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Benefits */}
            <div>
              <h1 className="text-4xl font-bold mb-6">{t.becomeVendor}</h1>
              <p className="text-lg text-muted-foreground mb-8">
                {t.vendorDescription || "Join thousands of successful sellers on our platform"}
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:sticky lg:top-24">
              <BecomeVendorForm locale={locale} userId={session.id} />
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
