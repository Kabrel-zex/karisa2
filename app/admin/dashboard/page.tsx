"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Store, ShoppingCart, AlertTriangle, TrendingUp, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalOrders: number;
  totalDisputes: number;
  totalRevenue: number;
  pendingModerations: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [analyticsRes, moderationsRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/products/pending"),
      ]);

      if (!analyticsRes.ok || !moderationsRes.ok) throw new Error("Failed to fetch");

      const analytics = await analyticsRes.json();
      const moderations = await moderationsRes.json();

      setStats({
        totalUsers: analytics.metrics.totalUsers || 0,
        totalVendors: analytics.metrics.totalVendors || 0,
        totalOrders: analytics.metrics.totalOrders || 0,
        totalDisputes: 0, // TODO: Ajouter route pour disputes
        totalRevenue: analytics.metrics.totalRevenue || 0,
        pendingModerations: moderations.moderations?.length || 0,
      });
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-4xl font-bold mb-2">Administration</h1>
            <p className="text-xl text-muted-foreground">
              Gérez les utilisateurs, vendeurs, produits et la plateforme depuis un tableau de bord centralisé. 
              Accès réservé aux administrateurs.
            </p>
          </div>
        </section>

        {/* Section Dashboard global */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Vue d&apos;ensemble</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Total utilisateurs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendeurs</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalVendors || 0}</div>
                  <p className="text-xs text-muted-foreground">Boutiques actives</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">Total commandes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalRevenue.toFixed(2) || "0.00"}€</div>
                  <p className="text-xs text-muted-foreground">Chiffre d&apos;affaires</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Liste de Fonctionnalités */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Fonctionnalités d&apos;administration</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/users">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>
                      Suspension, activation, réinitialisation mot de passe
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/products">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Validation des vendeurs</CardTitle>
                    <CardDescription>
                      Approuver ou rejeter les candidatures vendeurs
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/products">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <FileText className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Modération produits et avis</CardTitle>
                    <CardDescription>
                      Valider ou rejeter produits et avis soumis
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <AlertTriangle className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Gestion des litiges</CardTitle>
                  <CardDescription>
                    Suivi et résolution des réclamations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Link href="/admin/analytics">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <TrendingUp className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Export données et rapports</CardTitle>
                    <CardDescription>
                      Générer des rapports et exporter les données
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Configuration plateforme</CardTitle>
                  <CardDescription>
                    Paramètres généraux et configurations
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Modération rapide */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Modération en attente</h2>
              {stats && stats.pendingModerations > 0 && (
                <Badge variant="destructive">{stats.pendingModerations} en attente</Badge>
              )}
            </div>
            <Card>
              <CardContent className="pt-6">
                {stats && stats.pendingModerations > 0 ? (
                  <div className="flex items-center justify-between">
                    <p>
                      {stats.pendingModerations} produit(s) en attente de modération
                    </p>
                    <Link href="/admin/products">
                      <Button>Voir les produits</Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun élément en attente de modération
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full" size="lg">
                  Accéder à la gestion des utilisateurs
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full" size="lg">
                  Exporter les rapports
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full" size="lg">
                  Modérer les produits
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

