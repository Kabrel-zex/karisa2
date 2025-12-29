import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSession } from "@/lib/session";
import { getCartItems, getCartTotal } from "@/lib/cart";
import { CartItemComponent } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ShoppingCart, ArrowRight, HelpCircle, MessageSquare } from "lucide-react";
import { cartAPI } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function CartPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const locale = (params.lang as "fr" | "en") || "fr";
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header locale={locale} />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">
            {locale === "fr" ? "Connectez-vous pour voir votre panier" : "Login to see your cart"}
          </h1>
          <Link href={`/login?lang=${locale}`}>
            <Button className="mt-4">{locale === "fr" ? "Se connecter" : "Login"}</Button>
          </Link>
        </main>
        <Footer locale={locale} />
      </div>
    );
  }
  const response = await cartAPI.get()
  // if(response.error){
  //  redirect(`/cart?lang=${locale}`);
  // }
  const cartItems=response.data?.items||[]

  // if (cartItems.length === 0) {
  //   redirect(`/cart?lang=${locale}`);
  // }
  
  const translations = {
    fr: {
      title: "Mon panier",
      empty: "Votre panier est vide",
      continueShopping: "Continuer les achats",
      checkout: "Passer à la commande",
      summary: "Résumé",
      subtotal: "Sous-total",
      shipping: "Frais de port estimés",
      tax: "TVA (20%)",
      total: "Total général",
      items: "articles",
      groupedByVendor: "Produits regroupés par vendeur",
      faq: "Questions fréquentes",
      contact: "Besoin d'aide ?",
      faqQ1: "Comment modifier la quantité ?",
      faqA1: "Utilisez les boutons + et - à côté de chaque produit.",
      faqQ2: "Puis-je payer plusieurs vendeurs en une fois ?",
      faqA2: "Oui, notre système gère automatiquement les paiements multi-vendeurs.",
      faqQ3: "Les frais de port sont-ils inclus ?",
      faqA3: "Les frais de port sont calculés à l'étape de la commande selon l'adresse de livraison.",
    },
    en: {
      title: "My cart",
      empty: "Your cart is empty",
      continueShopping: "Continue shopping",
      checkout: "Checkout",
      summary: "Summary",
      subtotal: "Subtotal",
      shipping: "Estimated shipping",
      tax: "Tax (20%)",
      total: "Total",
      items: "items",
      groupedByVendor: "Products grouped by vendor",
      faq: "Frequently asked questions",
      contact: "Need help?",
      faqQ1: "How to modify quantity?",
      faqA1: "Use the + and - buttons next to each product.",
      faqQ2: "Can I pay multiple vendors at once?",
      faqA2: "Yes, our system automatically handles multi-vendor payments.",
      faqQ3: "Are shipping costs included?",
      faqA3: "Shipping costs are calculated at checkout based on delivery address.",
    },
  };

  const t = translations[locale];

  const subtotal = response.data?.subtotal||0;
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-4">{t.empty}</p>
              <Link href={`/products?lang=${locale}`}>
                <Button>
                  {t.continueShopping}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Section Produit Ecommerce - Liste des produits */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t.groupedByVendor}</CardTitle>
                    <CardDescription>
                      {cartItems.length} {t.items}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y">
                    {cartItems.map((item) => (
                      <CartItemComponent key={item.id} item={item} locale={locale} />
                    ))}
                  </CardContent>
                </Card>

                {/* Section FAQ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      {t.faq}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">{t.faqQ1}</h4>
                      <p className="text-sm text-muted-foreground">{t.faqA1}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">{t.faqQ2}</h4>
                      <p className="text-sm text-muted-foreground">{t.faqA2}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1">{t.faqQ3}</h4>
                      <p className="text-sm text-muted-foreground">{t.faqA3}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {t.contact}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Un problème avec votre panier ? Notre équipe est là pour vous aider.
                    </p>
                    <Link href="/contact">
                      <Button variant="outline" size="sm">
                        Contacter le support
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Section Tarification - Résumé */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>{t.summary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  <CardFooter>
                    <Link href={`/checkout?lang=${locale}`} className="w-full">
                      <Button className="w-full" size="lg">
                        {t.checkout}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
