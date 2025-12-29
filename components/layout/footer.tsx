import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export function Footer({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const translations = {
    fr: {
      about: "À propos",
      contact: "Contact",
      terms: "Conditions",
      privacy: "Confidentialité",
      help: "Aide",
      sellers: "Pour les vendeurs",
      buyers: "Pour les acheteurs",
      company: "Entreprise",
      support: "Support",
      rights: "Tous droits réservés.",
    },
    en: {
      about: "About",
      contact: "Contact",
      terms: "Terms",
      privacy: "Privacy",
      help: "Help",
      sellers: "For sellers",
      buyers: "For buyers",
      company: "Company",
      support: "Support",
      rights: "All rights reserved.",
    },
  }

  const t = translations[locale]

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MarketPlace</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {locale === "fr"
                ? "La marketplace qui connecte acheteurs et vendeurs du monde entier."
                : "The marketplace connecting buyers and sellers worldwide."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.company}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/about?lang=${locale}`} className="hover:text-foreground">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link href={`/contact?lang=${locale}`} className="hover:text-foreground">
                  {t.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.support}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/help?lang=${locale}`} className="hover:text-foreground">
                  {t.help}
                </Link>
              </li>
              <li>
                <Link href={`/sellers?lang=${locale}`} className="hover:text-foreground">
                  {t.sellers}
                </Link>
              </li>
              <li>
                <Link href={`/buyers?lang=${locale}`} className="hover:text-foreground">
                  {t.buyers}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={`/terms?lang=${locale}`} className="hover:text-foreground">
                  {t.terms}
                </Link>
              </li>
              <li>
                <Link href={`/privacy?lang=${locale}`} className="hover:text-foreground">
                  {t.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} MarketPlace. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
