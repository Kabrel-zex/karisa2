"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, AlertTriangle, Plus } from "lucide-react";

interface Product {
  id: string;
  nameFr: string;
  nameEn: string;
  sku: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: string;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    stockQuantity: number;
  }>;
}

export default function VendorInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockQuantity, setStockQuantity] = useState("");

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const fetchInventory = async () => {
    try {
      const url = new URL("/api/inventory", window.location.origin);
      if (lowStockOnly) url.searchParams.set("lowStock", "true");

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string, variantId?: string) => {
    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: parseInt(stockQuantity),
          variantId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update stock");

      toast.success("Stock mis à jour");
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setStockQuantity("");
      fetchInventory();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Stock faible uniquement</span>
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{product.nameFr}</CardTitle>
                  {product.sku && (
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  )}
                </div>
                <Badge
                  variant={
                    product.stockQuantity <= product.lowStockThreshold
                      ? "destructive"
                      : "default"
                  }
                >
                  {product.stockQuantity} en stock
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span>
                    Stock: {product.stockQuantity} / Seuil: {product.lowStockThreshold}
                  </span>
                  {product.stockQuantity <= product.lowStockThreshold && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <Dialog open={editDialogOpen && selectedProduct?.id === product.id} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setStockQuantity(product.stockQuantity.toString());
                      }}
                    >
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le stock</DialogTitle>
                      <DialogDescription>
                        Mettez à jour la quantité en stock pour {product.nameFr}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          min="0"
                          required
                        />
                      </div>
                      <Button
                        onClick={() => handleUpdateStock(product.id)}
                        className="w-full"
                      >
                        Enregistrer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Variantes:</p>
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{variant.name}</span>
                      <span className="text-sm font-semibold">
                        Stock: {variant.stockQuantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {lowStockOnly
                ? "Aucun produit en stock faible"
                : "Aucun produit dans l&apos;inventaire"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

