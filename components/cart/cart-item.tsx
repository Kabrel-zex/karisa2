"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cartAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { CartItemWithDetails } from "@/lib/cart"

export function CartItemComponent({ item, locale }: { item: CartItemWithDetails; locale: "fr" | "en" }) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const name = locale === "fr" ? item.product.nameFr : item.product.nameEn
  const price = Number(item.price)
  const total = price * quantity
  const productImage = item.product.images[0]?.imageUrl

  const translations = {
    fr: {
      error: "Erreur lors de la mise à jour",
      removed: "Article supprimé",
    },
    en: {
      error: "Error updating",
      removed: "Item removed",
    },
  }

  const t = translations[locale]

  async function handleUpdateQuantity(newQuantity: number) {
    if (newQuantity < 1 || newQuantity > item.product.stockQuantity) return

    setIsUpdating(true)
    const previousQuantity = quantity
    setQuantity(newQuantity)

    const { error } = await cartAPI.update(item.id, newQuantity)

    if (error) {
      setQuantity(previousQuantity)
      toast.error(error || t.error)
    } else {
      router.refresh()
    }

    setIsUpdating(false)
  }

  async function handleRemove() {
    setIsUpdating(true)
    const { error } = await cartAPI.remove(item.id)

    if (error) {
      toast.error(error || t.error)
    } else {
      toast.success(t.removed)
      router.refresh()
    }
  }

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted shrink-0">
        <Image src={productImage || "/placeholder.svg"} alt={name} fill className="object-cover" />
      </div>

      <div className="flex-1 space-y-2">
        <div>
          <h3 className="font-semibold line-clamp-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{item.product.vendor.businessName}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-3 text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(quantity + 1)}
              disabled={isUpdating || quantity >= item.product.stockQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={handleRemove}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-right space-y-2">
        <div className="font-semibold">{total.toFixed(2)}€</div>
        <div className="text-sm text-muted-foreground">{price.toFixed(2)}€ / item</div>
      </div>
    </div>
  )
}
