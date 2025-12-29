# Routes API Complètes - Référence

Ce document liste toutes les routes API créées selon l'architecture complète.

## 🔐 Authentification (Auth Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| POST | `/api/auth/signup` | Inscription | ✅ |
| POST | `/api/auth/login` | Connexion | ✅ |
| POST | `/api/auth/logout` | Déconnexion | ✅ |
| GET | `/api/auth/me` | Utilisateur actuel | ✅ |
| POST | `/api/auth/2fa/setup` | Configurer 2FA | ✅ |
| POST | `/api/auth/2fa/enable` | Activer 2FA | ✅ |
| POST | `/api/auth/2fa/verify` | Vérifier code 2FA | ✅ |
| POST | `/api/auth/refresh-token` | Rafraîchir token | ✅ |
| POST | `/api/auth/password-reset` | Demander reset | ✅ |
| PUT | `/api/auth/password-reset` | Réinitialiser mot de passe | ✅ |

## 👤 Utilisateur (User Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/user/profile` | Profil utilisateur | ✅ |
| PUT | `/api/user/profile` | Mettre à jour profil | ✅ |
| GET | `/api/user/addresses` | Liste des adresses | ✅ |
| POST | `/api/user/addresses` | Ajouter adresse | ✅ |
| PUT | `/api/user/addresses/[id]` | Modifier adresse | ✅ |
| DELETE | `/api/user/addresses/[id]` | Supprimer adresse | ✅ |
| GET | `/api/user/wallet` | Portefeuille | ✅ |
| POST | `/api/user/wallet/recharge` | Recharger portefeuille | ✅ |
| GET | `/api/user/payment-methods` | Méthodes de paiement | ✅ |
| POST | `/api/user/payment-methods` | Ajouter méthode paiement | ✅ |

## 📦 Produits (Product Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/products` | Liste produits (recherche/filtres) | ✅ |
| POST | `/api/products` | Créer produit | ✅ |
| GET | `/api/products/[id]` | Détails produit | ✅ |
| PUT | `/api/products/[id]` | Modifier produit | ✅ |
| DELETE | `/api/products/[id]` | Supprimer produit | ✅ |
| POST | `/api/products/[id]/images` | Ajouter images | ✅ |
| POST | `/api/products/[id]/bulk-upload` | Upload en masse | ✅ |
| GET | `/api/products/[id]/reviews` | Avis du produit | ✅ |

## 📊 Inventaire (Inventory Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/inventory` | Liste stocks | ✅ |
| PUT | `/api/inventory/[productId]` | Mettre à jour stock | ✅ |
| POST | `/api/inventory/[productId]/log` | Log changement stock | ✅ |
| GET | `/api/inventory/reserved` | Stocks réservés | ✅ |

## 🛒 Commandes (Order Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/orders` | Liste commandes | ✅ |
| POST | `/api/orders` | Créer commande | ✅ |
| GET | `/api/orders/[id]` | Détails commande | ✅ |
| PUT | `/api/orders/[id]` | Modifier commande | ✅ |
| PUT | `/api/orders/[id]/status` | Mettre à jour statut | ✅ |
| PUT | `/api/orders/[id]/cancel` | Annuler commande | ✅ |
| POST | `/api/orders/[id]/return` | Initier retour | ✅ |
| POST | `/api/orders/[id]/confirm-receipt` | Confirmer réception | ✅ |
| POST | `/api/orders/[id]/review` | Créer avis depuis commande | ✅ |

## 💳 Paiements (Payment Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| POST | `/api/payments/create-intent` | Créer PaymentIntent | ✅ |
| POST | `/api/payments/process` | Traiter paiement | ✅ |
| GET | `/api/payments/[transactionId]` | Détails transaction | ✅ |
| POST | `/api/payments/[id]/refund` | Créer remboursement | ✅ |
| POST | `/api/webhooks/stripe` | Webhook Stripe | ✅ |
| POST | `/api/webhooks/paypal` | Webhook PayPal | ✅ |

## 🚚 Livraison (Shipping Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/shipping/methods` | Méthodes de livraison | ✅ |
| POST | `/api/shipping/calculate` | Calculer frais | ✅ |
| POST | `/api/shipping/shipments` | Créer shipment | ✅ |
| GET | `/api/shipping/shipments/[trackingNumber]` | Détails shipment | ✅ |
| GET | `/api/shipping/tracking/[trackingNumber]` | Suivi en temps réel | ✅ |
| POST | `/api/shipping/returns/initiate` | Initier retour | ✅ |
| POST | `/api/shipping/returns/[id]/confirm` | Confirmer retour | ✅ |

## ⭐ Avis (Review Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/reviews` | Liste avis | ✅ |
| POST | `/api/reviews/create` | Créer avis | ✅ |
| GET | `/api/reviews/[productId]` | Avis d'un produit | ✅ |
| POST | `/api/reviews/response` | Répondre à avis | ✅ |
| POST | `/api/reviews/[id]/respond` | Répondre (alias) | ✅ |
| POST | `/api/reviews/[id]/helpful` | Marquer utile/inutile | ✅ |
| POST | `/api/reviews/[id]/report` | Signaler avis | ✅ |
| GET | `/api/sellers/[id]/reviews` | Avis d'un vendeur | ✅ |

## 💬 Messagerie (Messaging Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/messages/conversations` | Liste conversations | ✅ |
| POST | `/api/messages/send` | Envoyer message | ✅ |
| GET | `/api/messages/[conversationId]` | Messages conversation | ✅ |
| POST | `/api/messages/[conversationId]` | Envoyer dans conversation | ✅ |

## 🎫 Support (Support Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/support/tickets` | Liste tickets | ✅ |
| POST | `/api/support/tickets` | Créer ticket | ✅ |

## ⚖️ Litiges (Dispute Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| POST | `/api/disputes/create` | Créer litige | ✅ |

## 🔍 Recherche (Search Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/search` | Recherche full-text | ✅ |

## 👨‍💼 Administration (Admin Service)

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| POST | `/api/admin/moderate/product` | Modérer produit | ✅ |
| GET | `/api/admin/products/pending` | Produits en attente | ✅ |
| GET | `/api/admin/users` | Liste utilisateurs | ✅ |
| POST | `/api/admin/users/[id]/suspend` | Suspendre utilisateur | ✅ |
| GET | `/api/admin/analytics` | Analytics globales | ✅ |

## 🎟️ Coupons

| Méthode | Route | Description | Status |
|---------|-------|-------------|--------|
| GET | `/api/coupons` | Liste coupons | ✅ |
| POST | `/api/coupons` | Créer coupon (admin) | ✅ |
| POST | `/api/coupons/validate` | Valider coupon | ✅ |

## 📄 Pages Frontend

| Route | Description | Status |
|-------|-------------|--------|
| `/reset-password` | Réinitialisation mot de passe | ✅ |
| `/account/profile` | Profil utilisateur | ✅ |
| `/account/addresses` | Gestion adresses | ✅ |
| `/account/wallet` | Portefeuille | ✅ |
| `/tracking/[trackingNumber]` | Suivi colis | ✅ |
| `/admin/products` | Modération produits | ✅ |
| `/admin/users` | Gestion utilisateurs | ✅ |
| `/admin/analytics` | Analytics | ✅ |
| `/vendor/inventory` | Gestion stocks | ✅ |
| `/vendor/orders` | Commandes vendeur | ✅ |

## 📊 Statistiques

- **Total routes API**: ~60+
- **Total pages frontend**: 10+
- **Services couverts**: 10/15 (Auth, User, Product, Inventory, Order, Payment, Shipping, Review, Messaging, Admin)

## 🎯 Routes Manquantes (à implémenter)

- Routes Seller Service (gestion boutique détaillée)
- Routes Analytics Service (rapports avancés)
- Routes Notification Service (préférences notifications)
- WebSocket pour messagerie temps réel
- Routes de recherche avancée avec filtres complexes

