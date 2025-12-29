/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Image as ImageIcon, Filter, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  createdAt: string;
  product: {
    id: string;
    nameFr: string;
    nameEn: string;
    images: Array<{ imageUrl: string }>;
  };
  user: {
    name: string | null;
  };
  sellerResponse?: {
    content: string;
  };
}

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/rewiew")
      if(!response.ok)return
      const data=await response.json()
      setReviews(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des avis");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = filter === "all" 
    ? reviews 
    : reviews.filter((r) => r.rating === parseInt(filter));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Section En-tête */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Avis et Témoignages
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Découvrez les expériences de nos clients et partagez la vôtre. 
              Les avis vérifiés aident toute la communauté à faire les meilleurs choix.
            </p>
          </div>
        </section>

        {/* Section Liste de Fonctionnalités */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Fonctionnalités du système d&apos;avis
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Star className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Notation 5 étoiles</h3>
                  <p className="text-sm text-muted-foreground">
                    Évaluez de 1 à 5 étoiles
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <MessageSquare className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Avis texte</h3>
                  <p className="text-sm text-muted-foreground">
                    Partagez votre expérience détaillée
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <ImageIcon className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des photos de vos produits
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Badge className="mb-4">Vérifié</Badge>
                  <h3 className="font-semibold mb-2">Achat vérifié</h3>
                  <p className="text-sm text-muted-foreground">
                    Badge pour les achats confirmés
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Avis avec filtres */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Avis récents</h2>
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  Tous
                </Button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Button
                    key={rating}
                    variant={filter === rating.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(rating.toString() as any)}
                  >
                    {rating} <Star className="h-3 w-3 ml-1 fill-current" />
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">Chargement...</div>
            ) : filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Aucun avis pour le moment
                  </p>
                  <Link href="/products">
                    <Button>Découvrir les produits</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {review.product.nameFr}
                          </CardTitle>
                          <CardDescription>
                            Par {review.user.name || "Anonyme"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {review.comment}
                        </p>
                      )}
                      {review.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {review.images.map((img, i) => (
                            <Image
                              key={i}
                              src={img}
                              alt="Avis"
                              fill
                              className="w-20 h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      {review.sellerResponse && (
                        <div className="mt-4 p-3 bg-muted rounded">
                          <p className="text-sm font-semibold mb-1">
                            Réponse du vendeur :
                          </p>
                          <p className="text-sm">{review.sellerResponse.content}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-4">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Partagez votre expérience
            </h2>
            <p className="text-muted-foreground mb-8">
              Avez-vous acheté un produit ? Laissez un avis pour aider les autres clients !
            </p>
            <Link href="/account/orders">
              <Button size="lg">Laisser un avis</Button>
            </Link>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comment publier un avis ?</CardTitle>
                  <CardDescription>
                    Après avoir reçu votre commande, accédez à <strong>Mes commandes</strong> 
                    et cliquez sur <strong>Laisser un avis</strong> pour le produit concerné.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Les avis sont-ils modérés ?</CardTitle>
                  <CardDescription>
                    Oui, tous les avis sont vérifiés par notre équipe pour garantir 
                    leur authenticité et leur pertinence avant publication.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Puis-je modifier mon avis ?</CardTitle>
                  <CardDescription>
                    Vous pouvez modifier votre avis dans les 30 jours suivant sa publication 
                    depuis votre espace <strong>Mes avis</strong>.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pourquoi les avis sont-ils importants ?</CardTitle>
                  <CardDescription>
                    Les avis aident les autres clients à faire des choix éclairés et 
                    permettent aux vendeurs d&apos;améliorer leurs produits et services.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

