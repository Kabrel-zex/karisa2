import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ProductCard } from "@/components/products/product-card";
import { getFeaturedProducts, getTopCategories } from "@/lib/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Shield, ShoppingCart, Store, Users, Star, Mail, MessageSquare } from "lucide-react";
import { categoriesAPI, productsAPI } from "@/lib/api";
import { getSession } from "@/lib/session";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = (params.lang as "fr" | "en") || "fr";

  const categoriesResponse = await categoriesAPI.getAll()
  
  const categories = categoriesResponse.data?.categories || []
  const ProductsResponse = await productsAPI.getAll()
  
  const featuredProducts = ProductsResponse.data?.products || []
  const session= await getSession()

  


  const translations = {
    fr: {
      featured: "Produits en vedette",
      viewAll: "Voir tout",
      categories: "Catégories populaires",
      explore: "Explorer",
      features: "Fonctionnalités principales",
      services: "Services",
      advantages: "Avantages",
      testimonials: "Témoignages",
      cta: "Rejoignez la plateforme",
      faq: "Questions fréquentes",
      contact: "Contact",
      forBuyers: "Pour les acheteurs",
      forSellers: "Pour les vendeurs",
      security: "Sécurité",
      simplicity: "Simplicité",
      diversity: "Diversité",
      support: "Support réactif",
    },
    en: {
      featured: "Featured products",
      viewAll: "View all",
      categories: "Popular categories",
      explore: "Explore",
      features: "Main features",
      services: "Services",
      advantages: "Advantages",
      testimonials: "Testimonials",
      cta: "Join the platform",
      faq: "Frequently asked questions",
      contact: "Contact",
      forBuyers: "For buyers",
      forSellers: "For sellers",
      security: "Security",
      simplicity: "Simplicity",
      diversity: "Diversity",
      support: "Responsive support",
    },
  };

  const t = translations[locale];

  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />

      <main className="flex-1">
        {/* Section En-tête Hero */}
        <HeroSection locale={locale} />

        {/* Section Liste de Fonctionnalités */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t.features}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Inscription multi-rôles</CardTitle>
                  <CardDescription>
                    Acheteur, vendeur ou admin - choisissez votre rôle
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Sécurisation par email</CardTitle>
                  <CardDescription>
                    Vérification email et 2FA pour une sécurité maximale
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Store className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Catalogue multi-vendeurs</CardTitle>
                  <CardDescription>
                    Des milliers de produits de vendeurs vérifiés
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <ShoppingCart className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Paiement sécurisé</CardTitle>
                  <CardDescription>
                    Stripe, PayPal - paiements sécurisés et rapides
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Suivi commandes</CardTitle>
                  <CardDescription>
                    Suivez vos commandes en temps réel
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Avis vérifiés</CardTitle>
                  <CardDescription>
                    Système d&apos;avis avec badge &quot;Achat vérifié&quot;
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Messagerie intégrée</CardTitle>
                  <CardDescription>
                    Communiquez directement avec les vendeurs
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Gestion profil</CardTitle>
                  <CardDescription>
                    Gérez facilement vos informations personnelles
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Services */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t.services}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    {t.forBuyers}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Achat simple et sécurisé
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Suivi de commande en temps réel
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Avis et évaluations produits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Support client réactif
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-6 w-6" />
                    {t.forSellers}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Création de boutique personnalisée
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Gestion de produits et stocks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Dashboard statistiques complet
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Messagerie avec acheteurs
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Avantages */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t.advantages}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">{t.security}</CardTitle>
                  <CardDescription>
                    Données protégées, paiements sécurisés, conformité RGPD
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">{t.simplicity}</CardTitle>
                  <CardDescription>
                    Interface intuitive, processus simplifiés, navigation facile
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Store className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">{t.diversity}</CardTitle>
                  <CardDescription>
                    Large catalogue, multiples vendeurs, produits variés
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">{t.support}</CardTitle>
                  <CardDescription>
                    Équipe disponible, réponse rapide, assistance complète
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t.testimonials}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4 italic">
                    &quot;Plateforme exceptionnelle ! Achat simple, livraison rapide, 
                    produits de qualité. Je recommande vivement !&quot;
                  </p>
                  <p className="font-semibold">- Sophie M., Acheteuse</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4 italic">
                    &quot;En tant que vendeur, j&apos;apprécie les outils de gestion 
                    et le support réactif. Mes ventes ont augmenté de 200% !&quot;
                  </p>
                  <p className="font-semibold">- Marc L., Vendeur</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4 italic">
                    &quot;Interface claire, processus fluide, sécurité au rendez-vous. 
                    Une expérience d&apos;achat parfaite !&quot;
                  </p>
                  <p className="font-semibold">- Julie D., Acheteuse</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t.cta}</h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des milliers d&apos;utilisateurs satisfaits dès aujourd&apos;hui
            </p>
            <div className="flex gap-4 justify-center">
             {session&&(
               <Link href="/signup">
                <Button size="sm" variant="secondary">
                  S&apos;inscrire gratuitement
                </Button>
              </Link>
             )}
              <Link href="/products">
                <Button size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Découvrir le catalogue
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">{t.faq}</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comment créer un compte ?</CardTitle>
                  <CardDescription>
                    Cliquez sur &quot;S&apos;inscrire&quot;, choisissez votre rôle et remplissez le formulaire.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Les paiements sont-ils sécurisés ?</CardTitle>
                  <CardDescription>
                    Oui, nous utilisons Stripe et PayPal pour des transactions 100% sécurisées.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comment devenir vendeur ?</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire de candidature et attendez la validation (sous 48h).
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline">Voir toutes les questions</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t.contact}</h2>
            <p className="text-muted-foreground mb-8">
              Besoin d&apos;aide ? Notre équipe est disponible pour vous assister
            </p>
            <Link href="/contact">
              <Button size="lg">Nous contacter</Button>
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">{t.categories}</h2>
              <Link href={`/categories?lang=${locale}`}>
                <Button variant="ghost">
                  {t.viewAll}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}&lang=${locale}`}>
                  <Card className="group hover:shadow-lg transition-all overflow-hidden">
                    <div className="aspect-square relative bg-muted">
                      <Image
                        src={
                          category.imageUrl ||
                          `/placeholder.svg?height=300&width=300&query=${locale === "fr" ? category.nameFr : category.nameEn}`
                        }
                        alt={locale === "fr" ? category.nameFr : category.nameEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold">{locale === "fr" ? category.nameFr : category.nameEn}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">{t.featured}</h2>
              <Link href={`/products?lang=${locale}`}>
                <Button variant="ghost">
                  {t.viewAll}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
