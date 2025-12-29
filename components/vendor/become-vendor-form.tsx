"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createVendorAccount } from "@/app/actions/vendor"

export function BecomeVendorForm({ locale, userId }: { locale: "fr" | "en"; userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const t = {
    fr: {
      title: "Créer votre compte vendeur",
      description: "Complétez ce formulaire pour commencer à vendre",
      businessName: "Nom commercial",
      businessType: "Type d'entreprise",
      taxId: "Numéro SIRET/TVA",
      description: "Description de votre activité",
      address: "Adresse complète",
      city: "Ville",
      postalCode: "Code postal",
      country: "Pays",
      phone: "Téléphone",
      submit: "Créer mon compte vendeur",
      success: "Compte vendeur créé avec succès!",
    },
    en: {
      title: "Create your vendor account",
      description: "Complete this form to start selling",
      businessName: "Business name",
      businessType: "Business type",
      taxId: "Tax ID / VAT number",
      description: "Business description",
      address: "Full address",
      city: "City",
      postalCode: "Postal code",
      country: "Country",
      phone: "Phone",
      submit: "Create vendor account",
      success: "Vendor account created successfully!",
    },
  }

  const translations = t[locale]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createVendorAccount(formData)

    if (result.success) {
      router.push(`/vendor/dashboard?lang=${locale}`)
    } else {
      alert(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <CardDescription>{translations.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />

          <div className="space-y-2">
            <Label htmlFor="businessName">{translations.businessName}</Label>
            <Input id="businessName" name="businessName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">{translations.businessType}</Label>
            <Input id="businessType" name="businessType" placeholder="e.g., Retail, Wholesale" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">{translations.taxId}</Label>
            <Input id="taxId" name="taxId" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">{translations.description}</Label>
            <Textarea id="businessDescription" name="businessDescription" rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">{translations.address}</Label>
            <Input id="addressLine1" name="addressLine1" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{translations.city}</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">{translations.postalCode}</Label>
              <Input id="postalCode" name="postalCode" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{translations.country}</Label>
            <Input id="country" name="country" required defaultValue="France" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{translations.phone}</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "..." : translations.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
