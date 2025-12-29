"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface ProductModeration {
  id: string;
  product: {
    id: string;
    nameFr: string;
    nameEn: string;
    price: number;
    vendor: {
      businessName: string;
    };
    images: Array<{ imageUrl: string }>;
  };
  status: string;
}

export default function AdminProductsPage() {
  const [moderations, setModerations] = useState<ProductModeration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductModeration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingModerations();
  }, []);

  const fetchPendingModerations = async () => {
    try {
      const response = await fetch("/api/admin/products/pending");
      if (!response.ok) throw new Error("Failed to fetch moderations");
      const data = await response.json();
      setModerations(data.moderations);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (productId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch("/api/admin/moderate/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          status,
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to moderate product");

      toast.success(`Produit ${status === "approved" ? "approuvé" : "rejeté"}`);
      setDialogOpen(false);
      setRejectionReason("");
      fetchPendingModerations();
    } catch (error) {
      toast.error("Erreur lors de la modération");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Modération des Produits</h1>

      <div className="grid gap-4">
        {moderations.map((moderation) => (
          <Card key={moderation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{moderation.product.nameFr}</CardTitle>
                  <CardDescription>
                    Vendeur: {moderation.product.vendor.businessName}
                  </CardDescription>
                </div>
                <Badge variant="outline">{moderation.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                {moderation.product.images[0] && (
                  <img
                    src={moderation.product.images[0].imageUrl}
                    alt={moderation.product.nameFr}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{moderation.product.nameEn}</p>
                  <p className="text-lg font-bold">{moderation.product.price}€</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(moderation);
                      setDialogOpen(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleModerate(moderation.product.id, "approved")}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {moderations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun produit en attente de modération</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le produit</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Contenu inapproprié, contrefaçon, etc."
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (selectedProduct) {
                    handleModerate(selectedProduct.product.id, "rejected");
                  }
                }}
                disabled={!rejectionReason}
              >
                Rejeter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

