/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { categoriesAPI } from "@/lib/api"

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const t = getTranslations(locale)

  const categoriesResponse = await categoriesAPI.getAll()
  // if (categoriesResponse.error) {
  //   return <div>Error: {categoriesResponse.error}</div>
  // }
  const categories = categoriesResponse.data?.categories || []
  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">{t.categories}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}?lang=${locale}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-muted">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl || "/placeholder.svg"}
                          alt={locale === "fr" ? category.nameFr : category.nameEn}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {category.icon || "📦"}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {locale === "fr" ? category.nameFr : category.nameEn}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category._count.products} {t.products}
                    </p>
                    {category.children.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {category.children.map((c: any) => (locale === "fr" ? c.nameFr : c.nameEn)).join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
