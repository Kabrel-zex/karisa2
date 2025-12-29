import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function HeroSection({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const translations = {
    fr: {
      title: "Découvrez des milliers de produits",
      subtitle: "La marketplace qui connecte acheteurs et vendeurs du monde entier",
      cta: "Explorer maintenant",
      vendors: "Vendeurs de confiance",
      products: "Produits disponibles",
      customers: "Clients satisfaits",
    },
    en: {
      title: "Discover thousands of products",
      subtitle: "The marketplace connecting buyers and sellers worldwide",
      cta: "Explore now",
      vendors: "Trusted vendors",
      products: "Products available",
      customers: "Happy customers",
    },
  }

  const t = translations[locale]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-balance">{t.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty">{t.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/products?lang=${locale}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/become-vendor?lang=${locale}`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  {locale === "fr" ? "Devenir vendeur" : "Become a vendor"}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">{t.vendors}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">{t.products}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-sm text-muted-foreground">{t.customers}</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <Image src="/e-commerce-marketplace-shopping.jpg" alt="Marketplace" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
