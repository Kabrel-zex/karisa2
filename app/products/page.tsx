import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { getProducts, getTopCategories } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { categoriesAPI, productsAPI } from "@/lib/api"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string; q?: string }>
}) {
  const params = await searchParams
  const locale = (params.lang as "fr" | "en") || "fr"
  const categorySlug = params.category
  const searchQuery = params.q

  const [productsResponse, categoriesResponse] = await Promise.all([
    productsAPI.getAll({category: categorySlug,
      search: searchQuery,
      limit: 24,}),
   categoriesAPI.getAll({limit:20})
  
  ])

  // if(productsResponse.error){
  //   return
  // }
  const products =await productsResponse.data?.products ||[]
  // if(categoriesResponse.error){
  //   return
  // }
  const categories =await categoriesResponse.data?.categories ||[]

  const translations = {
    fr: {
      title: "Tous les produits",
      categories: "Catégories",
      noResults: "Aucun produit trouvé",
      all: "Tous",
    },
    en: {
      title: "All products",
      categories: "Categories",
      noResults: "No products found",
      all: "All",
    },
  }

  const t = translations[locale]

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <Card className="p-4 sticky top-20">
                <h3 className="font-semibold mb-4">{t.categories}</h3>
                <nav className="space-y-2">
                  <Link href={`/products?lang=${locale}`}>
                    <Button variant={!categorySlug ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                      {t.all}
                    </Button>
                  </Link>
                  {categories.map((category) => (
                    <Link key={category.id} href={`/products?category=${category.slug}&lang=${locale}`}>
                      <Button
                        variant={categorySlug === category.slug ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        size="sm"
                      >
                        {locale === "fr" ? category.nameFr : category.nameEn}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </Card>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{searchQuery || t.title}</h1>
                <p className="text-muted-foreground mt-2">
                  {products.length} {locale === "fr" ? "produits" : "products"}
                </p>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-muted-foreground">{t.noResults}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} locale={locale} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}
