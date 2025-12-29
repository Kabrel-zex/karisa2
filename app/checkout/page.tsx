import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSession } from "@/lib/session";
import { getCartItems, getCartTotal } from "@/lib/cart";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
//import { Input } from "@/components/ui/input";
//import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
//import { createOrder } from "@/app/actions/checkout";
//import Image from "next/image";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { ShoppingBag, Truck, CreditCard, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cartAPI } from "@/lib/api";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = (params.lang as "fr" | "en") || "fr";
  const session = await getSession();

  if (!session) {
    redirect(`/login?lang=${locale}`);
  }

  const response = await cartAPI.get()
   if(response.error){
    redirect(`/cart?lang=${locale}`);
   }
   const cartItems=response.data?.items||[]

  if (cartItems.length === 0) {
    redirect(`/cart?lang=${locale}`);
  }

  const translations = {
    fr: {
      title: "Finaliser mon achat",
      subtitle: "Rappel du panier multi-vendeurs et des étapes du processus d'achat",
      howItWorks: "Comment ça marche",
      step1: "Panier",
      step2: "Livraison",
      step3: "Paiement",
      step1Desc: "Vérifiez vos produits",
      step2Desc: "Choisissez l'adresse",
      step3Desc: "Payez en sécurité",
      features: "Fonctionnalités principales",
      feature1: "Panier multi-vendeurs",
      feature2: "Paiement sécurisé",
      feature3: "Suivi en temps réel",
      feature4: "Support 24/7",
      pricing: "Résumé du panier",
      subtotal: "Sous-total",
      shipping: "Frais de port",
      tax: "Taxes",
      total: "Total à payer",
      payNow: "Payer maintenant",
      contact: "Besoin d'aide ?",
      contactDesc: "Support client ou FAQ dédiée",
      faq: "Questions fréquentes",
    },
    en: {
      title: "Finalize my purchase",
      subtitle: "Multi-vendor cart reminder and purchase process steps",
      howItWorks: "How it works",
      step1: "Cart",
      step2: "Shipping",
      step3: "Payment",
      step1Desc: "Review your products",
      step2Desc: "Choose address",
      step3Desc: "Pay securely",
      features: "Main features",
      feature1: "Multi-vendor cart",
      feature2: "Secure payment",
      feature3: "Real-time tracking",
      feature4: "24/7 support",
      pricing: "Cart summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Taxes",
      total: "Total to pay",
      payNow: "Pay now",
      contact: "Need help?",
      contactDesc: "Customer support or dedicated FAQ",
      faq: "Frequently asked questions",
    },
  };

  const t = translations[locale];

  const subtotal = response.data?.subtotal||0;
  const shipping = 5.99;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Section En-tête */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Section Comment ça Marche */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.howItWorks}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mb-2">{t.step1}</CardTitle>
                  <CardDescription>{t.step1Desc}</CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mb-2">{t.step2}</CardTitle>
                  <CardDescription>{t.step2Desc}</CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="mb-2">{t.step3}</CardTitle>
                  <CardDescription>{t.step3Desc}</CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section Liste de Fonctionnalités */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.features}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.feature1}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.feature2}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.feature3}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.feature4}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire de commande */}
            <div className="lg:col-span-2">
              <CheckoutForm locale={locale} cartItems={cartItems} />
            </div>

            {/* Section Tarification */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>{t.pricing}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product.nameFr} x {item.quantity}
                        </span>
                        <span>{(Number(item.price) * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.subtotal}</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.shipping}</span>
                    <span className="font-medium">{shipping.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.tax}</span>
                    <span className="font-medium">{tax.toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </CardContent>
              </Card>

              {/* Section Contact */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-5 w-5" />
                    {t.contact}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{t.contactDesc}</CardDescription>
                  <div className="flex gap-2">
                    <Link href="/contact" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Support client
                      </Button>
                    </Link>
                    <Link href="/faq" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        FAQ
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
