"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Store, BarChart3, MessageSquare, Package, Users, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function VendeursPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Section En-tête */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Rejoignez notre communauté de vendeurs
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vendez facilement sur notre plateforme multi-vendeurs sécurisée. 
              Créez votre boutique, gérez vos produits et développez votre activité en ligne.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/become-vendor">
                <Button size="lg">Devenir vendeur</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Se connecter</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section Liste de Fonctionnalités */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Fonctionnalités pour vendeurs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Store className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Création de boutique</CardTitle>
                  <CardDescription>
                    Créez et personnalisez votre boutique en quelques clics
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Package className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Gestion de catalogue</CardTitle>
                  <CardDescription>
                    Upload en masse, variantes produits, gestion des stocks
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Dashboard statistiques</CardTitle>
                  <CardDescription>
                    Suivez vos ventes, commandes et performances en temps réel
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Messagerie acheteurs</CardTitle>
                  <CardDescription>
                    Communiquez directement avec vos clients
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Validation admin</CardTitle>
                  <CardDescription>
                    Processus de candidature sécurisé avec validation
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Gestion des commandes</CardTitle>
                  <CardDescription>
                    Suivez et gérez toutes vos commandes facilement
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Accès au dashboard statistiques
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">+150%</div>
                  <p className="text-muted-foreground">Croissance moyenne</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-muted-foreground">Suivi en temps réel</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <p className="text-muted-foreground">Données sécurisées</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">∞</div>
                  <p className="text-muted-foreground">Produits illimités</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Témoignages de vendeurs
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle2 key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4">
                    {"Plateforme intuitive et efficace. Mes ventes ont doublé en 3 mois !"}
                  </p>
                  <p className="font-semibold">- Marie D., Vendeuse</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle2 key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4">
                    Support réactif et outils de gestion complets. Je recommande !
                  </p>
                  <p className="font-semibold">- Jean P., Vendeur</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle2 key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mb-4">
                    Facile à utiliser, même pour un débutant. Excellent rapport qualité/prix.
                  </p>
                  <p className="font-semibold">- Sophie L., Vendeuse</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez notre communauté de vendeurs dès aujourd&apos;hui
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/become-vendor">
                <Button size="lg" variant="secondary">
                  Déposer une candidature
                </Button>
              </Link>
              <Link href="/vendor/dashboard">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Accéder à l&apos;espace vendeur
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comment devenir vendeur ?</CardTitle>
                  <CardDescription>
                    Déposez votre candidature via le formulaire. Notre équipe valide votre demande sous 48h.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quels sont les critères d&apos;acceptation ?</CardTitle>
                  <CardDescription>
                    Vérification KYC, qualité des produits, conformité aux règles de la plateforme.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comment gérer ma boutique ?</CardTitle>
                  <CardDescription>
                    Accédez à votre dashboard vendeur pour gérer produits, stocks, commandes et statistiques.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quelles sont les commissions ?</CardTitle>
                  <CardDescription>
                    Commission transparente par vente. Consultez nos tarifs détaillés dans votre espace vendeur.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Besoin d&apos;aide ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Contactez notre équipe support pour toute question liée à la vente
            </p>
            <Link href="/contact">
              <Button size="lg">Nous contacter</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

