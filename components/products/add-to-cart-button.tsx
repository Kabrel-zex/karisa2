"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { cartAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AddToCartButtonProps {
  productId: string
  variantId?: string
  quantity?: number
  disabled?: boolean
  className?: string
  locale?: "fr" | "en"
}

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  disabled = false,
  className,
  locale = "fr",
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const translations = {
    fr: {
      addToCart: "Ajouter au panier",
      added: "Ajouté au panier",
      error: "Erreur lors de l'ajout",
      loginRequired: "Veuillez vous connecter",
    },
    en: {
      addToCart: "Add to cart",
      added: "Added to cart",
      error: "Error adding to cart",
      loginRequired: "Please login",
    },
  }

  const t = translations[locale]

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const { data, error } = await cartAPI.add(productId, quantity, variantId)

      if (error) {
        if (error.includes("Unauthorized") || error.includes("login")) {
          toast.error(t.loginRequired)
          router.push(`/login?lang=${locale}&redirect=/products/${productId}`)
        } else {
          toast.error(error || t.error)
        }
      } else if (data) {
        toast.success(t.added)
        router.refresh() // Rafraîchir pour mettre à jour le compteur du panier
      }
    } catch (err) {
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className={className}
      size="lg"
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {loading ? (locale === "fr" ? "Ajout..." : "Adding...") : t.addToCart}
    </Button>
  )
}


