"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const email = searchParams.get("email");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Veuillez entrer un code à 6 chiffres");
      return;
    }

    setLoading(true);
    try {
    
       const response = await fetch("/api/auth/verify-email", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ code, email }),
       });



      toast.success("Email vérifié avec succès !");
      router.push("/login");
    } catch (error) {
      toast.error("Code invalide. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email non trouvé");
      return;
    }

    setResending(true);
    try {
      
       await fetch("/api/auth/resend-verification", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email }),
       });

      toast.success("Code renvoyé ! Vérifiez votre boîte email.");
    } catch (error) {
      toast.error("Erreur lors du renvoi du code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vérification de votre adresse email</CardTitle>
              <CardDescription>
                {email ? (
                  <>
                    Nous avons envoyé un code de vérification à <strong>{email}</strong>
                  </>
                ) : (
                  "Entrez le code reçu par email pour vérifier votre compte"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Code de vérification (6 chiffres)</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading || code.length !== 6}>
                  {loading ? "Vérification..." : "Vérifier"}
                </Button>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Vous n&apos;avez pas reçu le code ?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="w-full"
                  >
                    {resending ? "Envoi..." : "Renvoyer le code"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-1">Conseils :</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Vérifiez votre dossier spam/courrier indésirable</li>
                      <li>Le code est valide pendant 15 minutes</li>
                      <li>Vous pouvez demander un nouveau code si nécessaire</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => router.push("/login")}>
              Retour à la connexion
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

