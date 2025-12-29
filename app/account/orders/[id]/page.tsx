/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, MapPin, CreditCard, Truck } from "lucide-react"
import Image from "next/image"

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { lang?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const session = await getSession()

  if (!session) {
    redirect(`/login?lang=${locale}&redirect=/account/orders/${params.id}`)
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id, userId: session.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          vendor: true,
        },
      },
    },
  })

  if (!order) notFound()

  const translations = {
    fr: {
      orderDetails: "Détails de la commande",
      orderNumber: "Numéro de commande",
      date: "Date",
      status: "Statut",
      paymentStatus: "Paiement",
      items: "Articles",
      shippingAddress: "Adresse de livraison",
      paymentMethod: "Méthode de paiement",
      orderSummary: "Récapitulatif",
      subtotal: "Sous-total",
      shipping: "Livraison",
      tax: "TVA",
      total: "Total",
      trackingNumber: "Numéro de suivi",
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En traitement",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
      completed: "Complété",
      failed: "Échoué",
      refunded: "Remboursé",
      credit_card: "Carte bancaire",
      paypal: "PayPal",
      bank_transfer: "Virement bancaire",
      cash_on_delivery: "Paiement à la livraison",
    },
    en: {
      orderDetails: "Order details",
      orderNumber: "Order number",
      date: "Date",
      status: "Status",
      paymentStatus: "Payment",
      items: "Items",
      shippingAddress: "Shipping address",
      paymentMethod: "Payment method",
      orderSummary: "Order summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
      trackingNumber: "Tracking number",
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      completed: "Completed",
      failed: "Failed",
      refunded: "Refunded",
      credit_card: "Credit card",
      paypal: "PayPal",
      bank_transfer: "Bank transfer",
      cash_on_delivery: "Cash on delivery",
    },
  }

  const t = translations[locale]

  const shippingAddr = order.shippingAddress as any

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{t.orderDetails}</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>
                        {t.orderNumber} #{order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary">{t[order.status]}</Badge>
                      <Badge variant={order.paymentStatus === "completed" ? "default" : "secondary"}>
                        {t[order.paymentStatus]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t.items}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product?.images[0] ? (
                          <Image
                            src={item.product.images[0].imageUrl || "/placeholder.svg"}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        {item.variantName && <p className="text-sm text-muted-foreground">{item.variantName}</p>}
                        {item.vendor && (
                          <p className="text-sm text-muted-foreground">
                            {locale === "fr" ? "Vendeur" : "Vendor"}: {item.vendor.businessName}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {locale === "fr" ? "Quantité" : "Quantity"}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Number(item.subtotal).toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">
                          {Number(item.price).toFixed(2)}€ × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t.shippingAddress}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{shippingAddr?.fullName}</p>
                  <p className="text-muted-foreground">{shippingAddr?.addressLine1}</p>
                  {shippingAddr?.addressLine2 && <p className="text-muted-foreground">{shippingAddr.addressLine2}</p>}
                  <p className="text-muted-foreground">
                    {shippingAddr?.postalCode} {shippingAddr?.city}
                  </p>
                  <p className="text-muted-foreground">{shippingAddr?.country}</p>
                  {shippingAddr?.phone && <p className="text-muted-foreground mt-2">{shippingAddr.phone}</p>}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment & Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t.paymentMethod}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{order.paymentMethod ? t[order.paymentMethod] : "-"}</p>

                  {order.trackingNumber && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-5 w-5" />
                          <p className="font-medium">{t.trackingNumber}</p>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground">{order.trackingNumber}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.orderSummary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-medium">{Number(order.subtotal).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.shipping}</span>
                    <span className="font-medium">{Number(order.shippingCost).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.tax}</span>
                    <span className="font-medium">{Number(order.tax).toFixed(2)}€</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{locale === "fr" ? "Réduction" : "Discount"}</span>
                      <span>-{Number(order.discount).toFixed(2)}€</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}</span>
                    <span>{Number(order.total).toFixed(2)}€</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
