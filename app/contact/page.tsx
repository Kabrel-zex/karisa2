"use client";

import { Suspense, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.subject,
          message: `${formData.name} (${formData.email})\n\n${formData.message}`,
          category: "contact",
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message envoyé avec succès !");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
     

      <main className="flex-1">
        {/* Section En-tête */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Une question ? Une demande d&apos;assistance ? Nous sommes là pour vous aider. 
              Notre équipe vous répondra dans les plus brefs délais.
            </p>
          </div>
        </section>

        {/* Section Formulaire de Contact */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Formulaire de contact
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">Question générale</SelectItem>
                        <SelectItem value="technical">Problème technique</SelectItem>
                        <SelectItem value="order">Question sur une commande</SelectItem>
                        <SelectItem value="vendor">Devenir vendeur</SelectItem>
                        <SelectItem value="partnership">Partenariat</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      placeholder="Décrivez votre demande en détail..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Contact */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Autres moyens de nous contacter
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Mail className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">Email</CardTitle>
                  <CardDescription>
                    support@karisa.com
                  </CardDescription>
                  <CardDescription className="mt-2">
                    contact@karisa.com
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Phone className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">Téléphone</CardTitle>
                  <CardDescription>
                    +33 1 23 45 67 89
                  </CardDescription>
                  <CardDescription className="mt-2 text-sm">
                    Lun-Ven : 9h-18h
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <MapPin className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <CardTitle className="mb-2">Adresse</CardTitle>
                  <CardDescription>
                    123 Rue de la Marketplace
                  </CardDescription>
                  <CardDescription>
                    75001 Paris, France
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section Horaires */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Horaires de disponibilité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Lundi - Vendredi</span>
                    <span>9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Samedi</span>
                    <span>10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dimanche</span>
                    <span>Fermé</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    * Réponse sous 24h pour les emails, temps réel pour le chat en ligne
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Newsletter */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Restez informé
            </h2>
            <p className="text-muted-foreground mb-8">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités, 
              nouveautés produits et offres exclusives
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Votre email"
                className="flex-1"
              />
              <Button>S&apos;inscrire</Button>
            </div>
          </div>
        </section>

        {/* Section FAQ */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quel est le délai de réponse ?</CardTitle>
                  <CardDescription>
                    Nous répondons généralement sous 24h pour les emails et en temps réel 
                    pour le chat en ligne (Lun-Ven, 9h-18h).
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Puis-je venir vous voir en personne ?</CardTitle>
                  <CardDescription>
                    Notre bureau est ouvert sur rendez-vous uniquement. 
                    Contactez-nous par email pour prendre rendez-vous.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comment suivre ma demande ?</CardTitle>
                  <CardDescription>
                    Vous recevrez un numéro de ticket par email. 
                    Vous pouvez suivre l&apos;avancement depuis votre espace <strong>Support</strong>.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline">
                  Voir toutes les questions fréquentes
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

