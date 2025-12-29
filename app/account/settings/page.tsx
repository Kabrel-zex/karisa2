import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Mail, Globe, Lock } from "lucide-react"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const locale = (searchParams.lang as "fr" | "en") || "fr"
  const session = await getSession()

  if (!session) {
    redirect(`/login?lang=${locale}&redirect=/account/settings`)
  }

  const translations = {
    fr: {
      title: "Paramètres du compte",
      personalInfo: "Informations personnelles",
      personalInfoDesc: "Gérez vos informations personnelles",
      name: "Nom complet",
      email: "Adresse e-mail",
      language: "Langue préférée",
      french: "Français",
      english: "English",
      security: "Sécurité",
      securityDesc: "Changez votre mot de passe",
      currentPassword: "Mot de passe actuel",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      save: "Enregistrer les modifications",
      changePassword: "Changer le mot de passe",
    },
    en: {
      title: "Account settings",
      personalInfo: "Personal information",
      personalInfoDesc: "Manage your personal information",
      name: "Full name",
      email: "Email address",
      language: "Preferred language",
      french: "Français",
      english: "English",
      security: "Security",
      securityDesc: "Change your password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      save: "Save changes",
      changePassword: "Change password",
    },
  }

  const t = translations[locale]

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

          <div className="max-w-2xl space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.personalInfo}
                </CardTitle>
                <CardDescription>{t.personalInfoDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.name}</Label>
                  <Input id="name" defaultValue={session.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t.email}
                  </Label>
                  <Input id="email" type="email" defaultValue={session.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t.language}
                  </Label>
                  <select
                    id="language"
                    defaultValue={session.language}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="fr">{t.french}</option>
                    <option value="en">{t.english}</option>
                  </select>
                </div>
                <Button>{t.save}</Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t.security}
                </CardTitle>
                <CardDescription>{t.securityDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>{t.changePassword}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
