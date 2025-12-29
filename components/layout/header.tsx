
import Link from "next/link"
import { ShoppingCart, Search, User, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSession } from "@/lib/session"
import { UserMenu } from "./user-menu"

export async function Header({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const session = await getSession()

  const translations = {
    fr: {
      search: "Rechercher des produits...",
      categories: "Catégories",
      vendors: "Vendeurs",
      becomeVendor: "Devenir vendeur",
      login: "Connexion",
      signup: "S'inscrire",
    },
    en: {
      search: "Search products...",
      categories: "Categories",
      vendors: "Vendors",
      becomeVendor: "Become a vendor",
      login: "Login",
      signup: "Sign up",
    },
  }

  const t = translations[locale]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/?lang=${locale}`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold hidden sm:inline-block">MarketPlace</span>
          </Link>

          {/* Search */}
          <form action="/products" className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" name="q" placeholder={t.search} className="w-full pl-10" />
              <input type="hidden" name="lang" value={locale} />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <Link href={`/?lang=${locale === "fr" ? "en" : "fr"}`}>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link href={`/cart?lang=${locale}`}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            {/* User menu */}
            {session ? (
              <UserMenu session={session} locale={locale} />
            ) : (
              <>
                <Link href={`/login?lang=${locale}`} className="hidden sm:inline-block">
                  <Button variant="ghost">{t.login}</Button>
                </Link>
                <Link href={`/signup?lang=${locale}`} className="hidden sm:inline-block">
                  <Button>{t.signup}</Button>
                </Link>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex h-12 items-center gap-6 text-sm font-medium">
          <Link href={`/categories?lang=${locale}`} className="hover:text-primary transition-colors">
            {t.categories}
          </Link>
          <Link href={`/vendors?lang=${locale}`} className="hover:text-primary transition-colors">
            {t.vendors}
          </Link>
          {session?.role !== "seller" && (
            <Link href={`/become-vendor?lang=${locale}`} className="hover:text-primary transition-colors">
              {t.becomeVendor}
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
