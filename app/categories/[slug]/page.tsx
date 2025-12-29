/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTranslations } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { ProductWithDetails } from "@/lib/products"
import { categoriesAPI, productsAPI } from "@/lib/api"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { lang?: string; page?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const t = getTranslations(locale)
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 24

  const categorys = await categoriesAPI.getBySlug(params.slug) 
    
  if (categorys.error) notFound()
  const category =categorys.data?.category
  const productsResponse = await productsAPI.getAll({
    category:category.id,
    limit
  })
  if(productsResponse.error){
    return
  }

  const products=productsResponse.data?.products||[]
   

  const totalProducts = productsResponse.data?.count||0

  const totalPages = Math.ceil(totalProducts / limit)

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href={`/?lang=${locale}`} className="hover:text-foreground">
              {t.home}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/categories?lang=${locale}`} className="hover:text-foreground">
              {t.categories}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{locale === "fr" ? category.nameFr : category.nameEn}</span>
          </div>

          {/* Category header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{locale === "fr" ? category.nameFr : category.nameEn}</h1>
            {category.descriptionFr && (
              <p className="text-muted-foreground">
                {locale === "fr" ? category.descriptionFr : category.descriptionEn}
              </p>
            )}
          </div>

          {/* Subcategories */}
          {category.children.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {category.children.map((child:any) => (
                <Link key={child.id} href={`/categories/${child.slug}?lang=${locale}`}>
                  <Button variant="outline" size="sm">
                    {locale === "fr" ? child.nameFr : child.nameEn}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Products grid */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as unknown as ProductWithDetails} locale={locale} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={`/categories/${params.slug}?lang=${locale}&page=${p}`}>
                      <Button variant={p === page ? "default" : "outline"} size="sm">
                        {p}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t.noProducts}</p>
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
