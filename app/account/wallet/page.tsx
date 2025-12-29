"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wallet, Plus } from "lucide-react";

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 0, currency: "EUR" });
  const [loading, setLoading] = useState(true);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await fetch("/api/user/wallet");
      if (!response.ok) throw new Error("Failed to fetch wallet");
      const data = await response.json();
      setWallet(data.wallet);
    } catch (error) {
      toast.error("Erreur lors du chargement du portefeuille");
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();

    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      toast.error("Montant invalide");
      return;
    }

    try {
      const response = await fetch("/api/user/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: rechargeAmount,
          paymentMethod: "card",
        }),
      });

      if (!response.ok) throw new Error("Failed to initiate recharge");

      const data = await response.json();
      toast.success("Recharge initiée");
      setRechargeDialogOpen(false);
      setAmount("");
      // Rediriger vers le paiement
    } catch (error) {
      toast.error("Erreur lors de la recharge");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                Mon Portefeuille
              </CardTitle>
              <CardDescription>Gérez votre solde et rechargez votre compte</CardDescription>
            </div>
            <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Recharger
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recharger le portefeuille</DialogTitle>
                  <DialogDescription>
                    Entrez le montant que vous souhaitez ajouter
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRecharge} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant ({wallet.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Procéder au paiement
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl font-bold mb-2">
              {wallet.balance.toFixed(2)} {wallet.currency}
            </div>
            <p className="text-muted-foreground">Solde disponible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

