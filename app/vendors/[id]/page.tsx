

import { getTranslations } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Package } from "lucide-react"
import Image from "next/image"
import { ProductWithDetails } from "@/lib/products"

export default async function VendorPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { lang?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const t = getTranslations(locale)
  const {id} = await params
  

  if (!id) notFound()
  const vendor = await prisma.vendor.findUnique({
    where: { id: id },
    include: {
      user: true,
      addresses: true,
      products: true,

    },
  })

  if (!vendor) notFound()

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        {/* Vendor header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Logo */}
              <div className="relative h-32 w-32 rounded-xl overflow-hidden bg-background shadow-lg flex-shrink-0">
                {vendor.logoUrl ? (
                  <Image
                    src={vendor.logoUrl || "/placeholder.svg"}
                    alt={vendor.businessName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-4xl font-bold">
                    {vendor.businessName[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{vendor.businessName}</h1>
                  {vendor.isVerified && <Badge variant="secondary">✓ {t.verified}</Badge>}
                </div>

                {vendor.businessDescription && (
                  <p className="text-muted-foreground mb-4 max-w-3xl">{vendor.businessDescription}</p>
                )}

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{Number(vendor.rating).toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({vendor.totalReviews} {t.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {vendor.products.length} {t.products}
                    </span>
                  </div>
                  {vendor.addresses[0] && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>
                        {vendor.addresses[0].city}, {vendor.addresses[0].country}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">{t.products}</h2>
          {vendor.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendor.products.map((product) => (
                <ProductCard key={product.id} product={product as ProductWithDetails} locale={locale} />
              ))}
            </div>
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
