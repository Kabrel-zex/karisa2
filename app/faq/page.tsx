"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    category: "Inscription",
    question: "Comment créer un compte ?",
    answer: "Cliquez sur 'S'inscrire' en haut à droite, choisissez votre rôle (acheteur ou vendeur), remplissez le formulaire et validez votre email.",
  },
  {
    category: "Inscription",
    question: "Quels sont les rôles disponibles ?",
    answer: "Trois rôles sont disponibles : Acheteur (pour acheter des produits), Vendeur (pour vendre des produits) et Admin (gestion de la plateforme).",
  },
  {
    category: "Gestion du compte",
    question: "Comment modifier mes informations personnelles ?",
    answer: "Accédez à votre profil depuis le menu utilisateur, puis cliquez sur 'Modifier' pour mettre à jour vos informations.",
  },
  {
    category: "Gestion du compte",
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié', entrez votre email et suivez les instructions reçues.",
  },
  {
    category: "Achat",
    question: "Comment ajouter un produit au panier ?",
    answer: "Sur la fiche produit, sélectionnez les variantes souhaitées (taille, couleur, etc.) et cliquez sur 'Ajouter au panier'.",
  },
  {
    category: "Achat",
    question: "Puis-je acheter plusieurs produits de différents vendeurs ?",
    answer: "Oui, notre panier multi-vendeurs vous permet d'ajouter des produits de plusieurs vendeurs. Chaque vendeur expédiera ses produits séparément.",
  },
  {
    category: "Achat",
    question: "Quels modes de paiement sont acceptés ?",
    answer: "Nous acceptons les cartes bancaires (via Stripe), PayPal, virement bancaire et paiement à la livraison selon les vendeurs.",
  },
  {
    category: "Vente",
    question: "Comment devenir vendeur ?",
    answer: "Remplissez le formulaire de candidature vendeur, soumettez vos documents KYC, et attendez la validation de notre équipe (sous 48h).",
  },
  {
    category: "Vente",
    question: "Quelles sont les commissions ?",
    answer: "Les commissions sont transparentes et varient selon le type de produit. Consultez les détails dans votre espace vendeur après validation.",
  },
  {
    category: "Vente",
    question: "Comment gérer mes stocks ?",
    answer: "Accédez à votre tableau de bord vendeur, section 'Inventaire', pour visualiser et mettre à jour vos stocks en temps réel.",
  },
  {
    category: "Sécurité",
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, nous utilisons un chiffrement SSL/TLS, respectons le RGPD et ne partageons jamais vos données personnelles avec des tiers.",
  },
  {
    category: "Sécurité",
    question: "Comment fonctionne la vérification 2FA ?",
    answer: "La 2FA (authentification à deux facteurs) est obligatoire pour les vendeurs. Configurez-la depuis votre profil pour renforcer la sécurité.",
  },
  {
    category: "Commandes",
    question: "Comment suivre ma commande ?",
    answer: "Connectez-vous, accédez à 'Mes commandes', puis cliquez sur la commande souhaitée pour voir son statut et le numéro de suivi.",
  },
  {
    category: "Commandes",
    question: "Puis-je annuler une commande ?",
    answer: "Oui, si la commande n'a pas encore été expédiée. Accédez aux détails de la commande et utilisez l'option d'annulation.",
  },
  {
    category: "Commandes",
    question: "Comment retourner un produit ?",
    answer: "Dans les détails de votre commande livrée, cliquez sur 'Demander un retour', indiquez la raison et suivez les instructions.",
  },
  {
    category: "Avis",
    question: "Comment laisser un avis ?",
    answer: "Après réception de votre commande, accédez à 'Mes commandes', sélectionnez la commande et cliquez sur 'Laisser un avis' pour chaque produit.",
  },
  {
    category: "Avis",
    question: "Les avis sont-ils modérés ?",
    answer: "Oui, tous les avis sont vérifiés par notre équipe pour garantir leur authenticité avant publication.",
  },
  {
    category: "Litiges",
    question: "Comment ouvrir un litige ?",
    answer: "Accédez aux détails de votre commande, cliquez sur 'Ouvrir un litige', décrivez le problème et ajoutez des preuves si nécessaire.",
  },
  {
    category: "Litiges",
    question: "Combien de temps prend la résolution d'un litige ?",
    answer: "Notre équipe traite les litiges sous 5-7 jours ouvrés. Vous serez notifié de chaque étape par email.",
  },
  {
    category: "Administration",
    question: "Comment accéder au panel d'administration ?",
    answer: "L'accès est réservé aux administrateurs. Connectez-vous avec un compte admin pour accéder au dashboard.",
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Section En-tête */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Foire aux Questions
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Trouvez rapidement des réponses aux questions les plus fréquentes. 
              Notre équipe est là pour vous aider !
            </p>
          </div>
        </section>

        {/* Section Recherche et Filtres */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "all" ? "Toutes les catégories" : cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Liste des FAQ */}
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Aucune question trouvée. Essayez avec d&apos;autres mots-clés.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleItem(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2">
                            {faq.category}
                          </Badge>
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                        </div>
                        {expandedItems.has(index) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                    {expandedItems.has(index) && (
                      <CardContent>
                        <CardDescription className="text-base">
                          {faq.answer}
                        </CardDescription>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Notre équipe support est disponible pour vous aider
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">Nous contacter</Button>
              </Link>
              <Link href="/support/tickets">
                <Button size="lg" variant="outline">
                  Ouvrir un ticket
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

