"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function SuiviCommandePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "processing":
      case "confirmed":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      completed: "Terminée",
      cancelled: "Annulée",
    };
    return labels[status] || status;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => ["pending", "confirmed", "processing"].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered" || o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center">Chargement...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Section En-tête */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Suivi de Commande</h1>
            <p className="text-xl text-muted-foreground">
              Consultez le statut, voyez les détails et l&apos;historique de vos commandes en temps réel
            </p>
          </div>
        </section>

        {/* Section Comment ça Marche */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Comment utiliser le suivi</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">1</div>
                  <p>Connectez-vous à votre compte</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">2</div>
                  <p>Accédez à l&apos;historique</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">3</div>
                  <p>Consultez le statut</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">4</div>
                  <p>Recevez les notifications</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Résumé de vos commandes</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2 text-yellow-600">{stats.pending}</div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2 text-blue-600">{stats.shipped}</div>
                  <p className="text-sm text-muted-foreground">Expédiées</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2 text-green-600">{stats.delivered}</div>
                  <p className="text-sm text-muted-foreground">Livrées</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2 text-red-600">{stats.cancelled}</div>
                  <p className="text-sm text-muted-foreground">Annulées</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Chronologie */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Vos commandes</h2>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune commande pour le moment</p>
                  <Link href="/products">
                    <Button className="mt-4">Découvrir le catalogue</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(order.status)}
                          <div>
                            <CardTitle>Commande {order.orderNumber}</CardTitle>
                            <CardDescription>
                              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge>{getStatusLabel(order.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.productName} x {item.quantity}
                            </span>
                            <span>{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-bold text-lg">Total: {order.total.toFixed(2)}€</span>
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section Liste de Fonctionnalités */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Fonctionnalités disponibles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Détails des produits</CardTitle>
                  <CardDescription>
                    Consultez tous les détails de vos produits commandés
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Informations de livraison</CardTitle>
                  <CardDescription>
                    Suivez l&apos;adresse et le statut de livraison
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Suivi du colis</CardTitle>
                  <CardDescription>
                    Numéro de suivi et statut en temps réel
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Messagerie vendeur</CardTitle>
                  <CardDescription>
                    Contactez directement le vendeur
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Signalement problème</CardTitle>
                  <CardDescription>
                    Ouvrez un litige si nécessaire
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Télécharger facture</CardTitle>
                  <CardDescription>
                    Accédez à vos factures en PDF
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">Questions fréquentes</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comment suivre ma commande ?</CardTitle>
                  <CardDescription>
                    Connectez-vous et accédez à la section <strong>Mes commandes</strong>. 
                    Le statut est mis à jour automatiquement.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Puis-je annuler ma commande ?</CardTitle>
                  <CardDescription>
                    Oui, si la commande n&apos;a pas encore été expédiée. 
                    Contactez le vendeur ou utilisez l&apos;option d&apos;annulation.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Comment retourner un produit ?</CardTitle>
                  <CardDescription>
                    Accédez aux détails de votre commande et utilisez l&apos;option de retour. 
                    Le vendeur validera votre demande.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Besoin d&apos;aide ?</h2>
            <p className="text-muted-foreground mb-8">
              Contactez notre support en cas de problème avec une commande
            </p>
            <Link href="/contact">
              <Button size="lg">Contacter le support</Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
