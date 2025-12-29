/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getProductById } from "@/lib/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, Store, Package, Shield, Truck, MessageSquare, HelpCircle } from "lucide-react";
import Image from "next/image";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import Link from "next/link";
import { getBaseUrl } from "@/lib/config";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) return {};

  const BASE_URL = getBaseUrl();
  const name = product.nameFr || product.nameEn;
  const description = product.shortDescriptionFr || product.shortDescriptionEn || product.descriptionFr || product.descriptionEn || "";
  const primaryImage = product.images[0]?.imageUrl || `${BASE_URL}/placeholder.png`;

  return {
    title: name,
    description,
    alternates: {
      canonical: `${BASE_URL}/products/${product.id}`,
    },
    openGraph: {
      title: name,
      description,
      url: `${BASE_URL}/products/${product.id}`,
      images: [{ url: primaryImage }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = (lang as "fr" | "en") || "fr";

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Récupérer les avis du produit
  const reviewsRes = await fetch(`${getBaseUrl()}/api/reviews/${id}`, {
    cache: "no-store",
  });
  const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };

  const name = locale === "fr" ? product.nameFr : product.nameEn;
  const description = locale === "fr" ? product.descriptionFr : product.descriptionEn;
  const price = Number(product.price);
  const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const translations = {
    fr: {
      addToCart: "Ajouter au panier",
      buyNow: "Acheter maintenant",
      description: "Description",
      specifications: "Caractéristiques",
      vendor: "Vendeur",
      inStock: "En stock",
      outOfStock: "Rupture de stock",
      freeShipping: "Livraison gratuite",
      securePayment: "Paiement sécurisé",
      returns: "Retours sous 30 jours",
      warranty: "Garantie",
      productFeatures: "Éléments clés",
      shippingOptions: "Options de livraison",
      returnPolicy: "Politique de retour",
      warrantyInfo: "Informations garantie",
      vendorInfo: "Informations vendeur",
      reviews: "Avis clients",
      verifiedPurchase: "Achat vérifié",
      contactVendor: "Contacter le vendeur",
      faq: "Questions fréquentes",
      faqQ1: "Quels sont les délais de livraison ?",
      faqA1: "Livraison standard : 3-5 jours ouvrés. Express : 1-2 jours.",
      faqQ2: "Puis-je retourner ce produit ?",
      faqA2: "Oui, retour gratuit sous 30 jours si le produit est non utilisé.",
      faqQ3: "Le produit est-il disponible ?",
      faqA3: "Oui, ce produit est actuellement en stock et prêt à être expédié.",
    },
    en: {
      addToCart: "Add to cart",
      buyNow: "Buy now",
      description: "Description",
      specifications: "Specifications",
      vendor: "Vendor",
      inStock: "In stock",
      outOfStock: "Out of stock",
      freeShipping: "Free shipping",
      securePayment: "Secure payment",
      returns: "30-day returns",
      warranty: "Warranty",
      productFeatures: "Key features",
      shippingOptions: "Shipping options",
      returnPolicy: "Return policy",
      warrantyInfo: "Warranty information",
      vendorInfo: "Vendor information",
      reviews: "Customer reviews",
      verifiedPurchase: "Verified purchase",
      contactVendor: "Contact vendor",
      faq: "Frequently asked questions",
      faqQ1: "What are the delivery times?",
      faqA1: "Standard delivery: 3-5 business days. Express: 1-2 days.",
      faqQ2: "Can I return this product?",
      faqA2: "Yes, free return within 30 days if product is unused.",
      faqQ3: "Is the product available?",
      faqA3: "Yes, this product is currently in stock and ready to ship.",
    },
  };

  const t = translations[locale];
  const BASE_URL = getBaseUrl();

  const productUrl = `${BASE_URL}/products/${product.id}`;
  const primaryImage = product.images[0]?.imageUrl || `${BASE_URL}/placeholder.png`;
  const availability = product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || "",
    image:
      product.images.map((img: { imageUrl: string | null }) => img.imageUrl).filter(Boolean).length > 0
        ? product.images.map((img: { imageUrl: string | null }) => img.imageUrl).filter(Boolean)
        : [primaryImage],
    sku: product.sku || undefined,
    brand: product.vendor?.businessName,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: "EUR",
      availability,
      url: productUrl,
    },
    aggregateRating:
      Number(product.totalReviews) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating).toFixed(1),
            reviewCount: product.totalReviews,
          }
        : undefined,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {/* Section En-tête de Produit Ecommerce */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Galerie d'images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={product.images[0]?.imageUrl || "/placeholder.svg?height=600&width=600"}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-lg px-3 py-1">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((image, idx) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={`${name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informations clés */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{name}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(Number(product.rating)) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({product.totalReviews} {locale === "fr" ? "avis" : "reviews"})
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-4" />

                  <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                    {product.stockQuantity > 0 ? t.inStock : t.outOfStock}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold">{price.toFixed(2)}€</span>
                  {comparePrice && (
                    <span className="text-xl text-muted-foreground line-through">{comparePrice.toFixed(2)}€</span>
                  )}
                </div>
              </div>

              {/* Vendeur */}
              {product.vendor && (
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t.vendor}</p>
                      <Link href={`/vendors/${product.vendor.id}`}>
                        <p className="font-semibold hover:underline">{product.vendor.businessName}</p>
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{Number(product.vendor.rating).toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section CTA */}
              <div className="space-y-3">
                <AddToCartButton
                  productId={product.id}
                  disabled={product.stockQuantity === 0}
                  className="w-full"
                  locale={locale}
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={product.stockQuantity === 0}
                >
                  {t.buyNow}
                </Button>
                {product.vendor && (
                  <Link href={`/messages?vendorId=${product.vendor.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.contactVendor}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Section Produit Ecommerce - Détails complets */}
          <div className="max-w-4xl mb-12">
            <h2 className="text-2xl font-bold mb-4">{t.description}</h2>
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Liste de Fonctionnalités */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t.productFeatures}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <Truck className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{t.shippingOptions}</CardTitle>
                  <CardDescription>Livraison standard ou express disponible</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Package className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{t.returnPolicy}</CardTitle>
                  <CardDescription>Retour gratuit sous 30 jours</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{t.warranty}</CardTitle>
                  <CardDescription>Garantie constructeur incluse</CardDescription>
                </CardHeader>
              </Card>

              {product.vendor && (
                <Card>
                  <CardHeader>
                    <Store className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">{t.vendorInfo}</CardTitle>
                    <CardDescription>{product.vendor.businessName}</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </section>

          {/* Section Témoignages - Avis clients */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t.reviews}</h2>
            {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.reviews.slice(0, 5).map((review: any) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {review.title || "Avis"}
                            {review.verifiedPurchase && (
                              <Badge variant="secondary" className="text-xs">
                                {t.verifiedPurchase}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            Par {review.user?.name || "Anonyme"} -{" "}
                            {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    {review.comment && (
                      <CardContent>
                        <p className="text-sm">{review.comment}</p>
                        {review.sellerResponse && (
                          <div className="mt-4 p-3 bg-muted rounded">
                            <p className="text-sm font-semibold mb-1">Réponse du vendeur :</p>
                            <p className="text-sm">{review.sellerResponse.content}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
                <Link href={`/products/${id}/reviews`}>
                  <Button variant="outline" className="w-full">
                    Voir tous les avis
                  </Button>
                </Link>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun avis pour le moment</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Section FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t.faq}</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    {t.faqQ1}
                  </CardTitle>
                  <CardDescription>{t.faqA1}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    {t.faqQ2}
                  </CardTitle>
                  <CardDescription>{t.faqA2}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    {t.faqQ3}
                  </CardTitle>
                  <CardDescription>{t.faqA3}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
