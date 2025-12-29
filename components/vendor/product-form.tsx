"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { createProduct } from "@/app/actions/vendor"
import type { Category } from "@prisma/client"

export function ProductForm({ categories, locale }: { categories: Category[]; locale: "fr" | "en" }) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const translations = {
    fr: {
      nameFr: "Nom (Français)",
      nameEn: "Nom (Anglais)",
      descriptionFr: "Description (Français)",
      descriptionEn: "Description (Anglais)",
      price: "Prix",
      stock: "Stock",
      category: "Catégorie",
      selectCategory: "Sélectionner une catégorie",
      submit: "Créer le produit",
      success: "Produit créé avec succès!",
    },
    en: {
      nameFr: "Name (French)",
      nameEn: "Name (English)",
      descriptionFr: "Description (French)",
      descriptionEn: "Description (English)",
      price: "Price",
      stock: "Stock",
      category: "Category",
      selectCategory: "Select a category",
      submit: "Create product",
      success: "Product created successfully!",
    },
  }

  const t = translations[locale]

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    const result = await createProduct(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      setError("")
      setIsLoading(false)
      ;(document.getElementById("product-form") as HTMLFormElement)?.reset()
      alert(t.success)
    }
  }

  return (
    <form id="product-form" action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name_fr">{t.nameFr}</Label>
          <Input id="name_fr" name="name_fr" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_en">{t.nameEn}</Label>
          <Input id="name_en" name="name_en" required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description_fr">{t.descriptionFr}</Label>
          <Textarea id="description_fr" name="description_fr" rows={4} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description_en">{t.descriptionEn}</Label>
          <Textarea id="description_en" name="description_en" rows={4} required />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t.price} (€)</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">{t.stock}</Label>
          <Input id="stock_quantity" name="stock_quantity" type="number" min="0" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">{t.category}</Label>
          <Select name="category_id" required>
            <SelectTrigger>
              <SelectValue placeholder={t.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {locale === "fr" ? cat.nameFr : cat.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t.submit}
      </Button>
    </form>
  )
}
