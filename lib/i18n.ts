export type Locale = "fr" | "en"

export const defaultLocale: Locale = "fr"

export const locales: Locale[] = ["fr", "en"]

export const translations = {
  fr: {
    common: {
      search: "Rechercher",
      login: "Connexion",
      signup: "S'inscrire",
      logout: "Déconnexion",
      cart: "Panier",
      account: "Compte",
      home: "Accueil",
      products: "Produits",
      categories: "Catégories",
      vendors: "Vendeurs",
      orders: "Commandes",
      language: "Langue",
      currency: "Devise",
    },
    nav: {
      becomeVendor: "Devenir vendeur",
      vendorDashboard: "Tableau de bord vendeur",
      help: "Aide",
    },
    home: {
      hero: {
        title: "Découvrez des milliers de produits",
        subtitle: "La marketplace qui connecte acheteurs et vendeurs du monde entier",
        cta: "Explorer maintenant",
      },
      featured: "Produits en vedette",
      categories: "Catégories populaires",
      topVendors: "Vendeurs de confiance",
    },
    product: {
      addToCart: "Ajouter au panier",
      buyNow: "Acheter maintenant",
      inStock: "En stock",
      outOfStock: "Rupture de stock",
      price: "Prix",
      description: "Description",
      specifications: "Caractéristiques",
      reviews: "Avis",
      rating: "Note",
      vendor: "Vendeur",
    },
    cart: {
      title: "Mon panier",
      empty: "Votre panier est vide",
      subtotal: "Sous-total",
      shipping: "Livraison",
      tax: "Taxes",
      total: "Total",
      checkout: "Passer la commande",
      continueShopping: "Continuer les achats",
    },
    verified: "Vérifié",
    sales: "ventes",
    noProducts: "Aucun produit disponible",
    becomeVendor: "Devenir vendeur",
    vendorBenefit1: "Accédez à des millions de clients dans le monde entier",
    vendorBenefit2: "Tableau de bord vendeur facile à utiliser",
    vendorBenefit3: "Traitement sécurisé des paiements",
    vendorBenefit4: "Outils de marketing et de promotion",
    vendorBenefit5: "Support vendeur 24/7",
    vendorBenefit6: "Taux de commission compétitifs",
    vendorDescription: "Rejoignez des milliers de vendeurs à succès sur notre plateforme",
  },
  en: {
    common: {
      search: "Search",
      login: "Login",
      signup: "Sign up",
      logout: "Logout",
      cart: "Cart",
      account: "Account",
      home: "Home",
      products: "Products",
      categories: "Categories",
      vendors: "Vendors",
      orders: "Orders",
      language: "Language",
      currency: "Currency",
    },
    nav: {
      becomeVendor: "Become a vendor",
      vendorDashboard: "Vendor dashboard",
      help: "Help",
    },
    home: {
      hero: {
        title: "Discover thousands of products",
        subtitle: "The marketplace connecting buyers and sellers worldwide",
        cta: "Explore now",
      },
      featured: "Featured products",
      categories: "Popular categories",
      topVendors: "Trusted vendors",
    },
    product: {
      addToCart: "Add to cart",
      buyNow: "Buy now",
      inStock: "In stock",
      outOfStock: "Out of stock",
      price: "Price",
      description: "Description",
      specifications: "Specifications",
      reviews: "Reviews",
      rating: "Rating",
      vendor: "Vendor",
    },
    cart: {
      title: "My cart",
      empty: "Your cart is empty",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
      checkout: "Checkout",
      continueShopping: "Continue shopping",
    },
    verified: "Verified",
    sales: "sales",
    noProducts: "No products available",
    becomeVendor: "Become a vendor",
    vendorBenefit1: "Reach millions of customers worldwide",
    vendorBenefit2: "Easy-to-use seller dashboard",
    vendorBenefit3: "Secure payment processing",
    vendorBenefit4: "Marketing and promotional tools",
    vendorBenefit5: "24/7 seller support",
    vendorBenefit6: "Competitive commission rates",
    vendorDescription: "Join thousands of successful sellers on our platform",
  },
} as const

export function getTranslations(locale: Locale): Record<string, string> {
  const t = translations[locale] || translations[defaultLocale]

  // Flatten the nested object for easier access
  const flattened: Record<string, string> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function flatten(obj: any, prefix = "") {
    for (const key in obj) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === "string") {
        flattened[key] = value
        flattened[newKey] = value
      } else if (typeof value === "object") {
        flatten(value, newKey)
        Object.assign(flattened, value)
      }
    }
  }

  flatten(t)
  return flattened
}

export function getTranslation(locale: Locale) {
  return translations[locale] || translations[defaultLocale]
}
