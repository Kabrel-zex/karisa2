import { getTranslations } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { vendorsAPI } from "@/lib/api"
import { notFound } from "next/navigation"

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const t = getTranslations(locale)

  const vendorsResponse = await vendorsAPI.getAll()
  // if (vendorsResponse.error) {
  //   return notFound()
  // }
  const vendors = vendorsResponse.data?.vendors || []
  

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">{t.vendors}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.id}?lang=${locale}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    {/* Banner */}
                    <div className="aspect-[3/1] relative mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10">
                      {vendor.bannerUrl && (
                        <Image
                          src={vendor.bannerUrl || "/placeholder.svg"}
                          alt={vendor.businessName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Logo */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-background border-4 border-background shadow-lg -mt-8">
                        {vendor.logoUrl ? (
                          <Image
                            src={vendor.logoUrl || "/placeholder.svg"}
                            alt={vendor.businessName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold">
                            {vendor.businessName[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                          {vendor.businessName}
                          {vendor.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ {t.verified}
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{Number(vendor.rating).toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({vendor.totalReviews} {t.reviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {vendor.businessDescription && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{vendor.businessDescription}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {vendor._count.products} {t.products}
                      </span>
                      <span className="text-muted-foreground">
                        {vendor.totalSales} {t.sales}
                      </span>
                    </div>
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
