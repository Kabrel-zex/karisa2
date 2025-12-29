import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { ProductWithDetails } from "@/lib/products"

export function ProductCard({ product, locale = "fr" }: { product: ProductWithDetails; locale?: "fr" | "en" }) {
  const name = locale === "fr" ? product.nameFr : product.nameEn
  const shortDesc = locale === "fr" ? product.shortDescriptionFr : product.shortDescriptionEn
  const price = Number(product.price)
  const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

  const primaryImage = product.images.find((img) => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl

  const translations = {
    fr: { addToCart: "Ajouter", inStock: "En stock", outOfStock: "Rupture" },
    en: { addToCart: "Add to cart", inStock: "In stock", outOfStock: "Out of stock" },
  }

  const t = translations[locale]

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}?lang=${locale}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={primaryImage || "/placeholder.svg?height=400&width=400"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">-{discount}%</Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${product.id}?lang=${locale}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">{name}</h3>
        </Link>

        {shortDesc && <p className="text-sm text-muted-foreground line-clamp-2">{shortDesc}</p>}

        <div className="flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(Number(product.rating)) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.totalReviews})</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{price.toFixed(2)}€</span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through">{comparePrice.toFixed(2)}€</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t.addToCart}
        </Button>
      </CardFooter>
    </Card>
  )
}
