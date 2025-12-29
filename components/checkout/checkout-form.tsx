"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder } from "@/app/actions/checkout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product: {
    nameFr: string;
    price: number;
  };
  quantity: number;
}

interface CheckoutFormProps {
  locale: "fr" | "en";
  cartItems: CartItem[];
}

export function CheckoutForm({ locale, cartItems }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "FR",
    paymentMethod: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createOrder({
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod as any,
      });

      if (result.success) {
        toast.success("Commande créée avec succès !");
        router.push(`/account/orders/${result.orderId}`);
      } else {
        throw new Error(result.error || "Erreur lors de la création de la commande");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  const t = {
    fr: {
      shipping: "Adresse de livraison",
      fullName: "Nom complet",
      phone: "Téléphone",
      address: "Adresse",
      address2: "Complément d'adresse",
      city: "Ville",
      postal: "Code postal",
      country: "Pays",
      payment: "Méthode de paiement",
      card: "Carte bancaire",
      paypal: "PayPal",
      bank: "Virement bancaire",
    },
    en: {
      shipping: "Shipping address",
      fullName: "Full name",
      phone: "Phone",
      address: "Address",
      address2: "Address line 2",
      city: "City",
      postal: "Postal code",
      country: "Country",
      payment: "Payment method",
      card: "Credit card",
      paypal: "PayPal",
      bank: "Bank transfer",
    },
  }[locale];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.shipping}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t.fullName} *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone} *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">{t.address} *</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">{t.address2}</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t.city} *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">{t.postal} *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t.country} *</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="BE">Belgique</SelectItem>
                <SelectItem value="CH">Suisse</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">{t.payment} *</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">{t.card}</SelectItem>
                <SelectItem value="paypal">{t.paypal}</SelectItem>
                <SelectItem value="bank_transfer">{t.bank}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Traitement..." : "Passer la commande"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

