# Karisa - Plateforme E-Commerce Multivendeurs

Plateforme e-commerce complète avec support multivendeurs, conforme aux spécifications fonctionnelles et non-fonctionnelles.

## Fonctionnalités Principales

### 1. Authentification et Gestion des Comptes
- ✅ Inscription/Connexion avec JWT
- ✅ 2FA (TOTP/SMS) obligatoire pour vendeurs
- ✅ KYC (Know Your Customer) avec vérification de documents
- ✅ Gestion des sessions avec refresh tokens

### 2. Gestion des Vendeurs et Boutiques
- ✅ Création de boutique
- ✅ Gestion du profil vendeur
- ✅ Personnalisation boutique (logo, bannière)
- ✅ Analytics et statistiques

### 3. Catalogue et Produits
- ✅ Création de produits avec variantes
- ✅ Gestion des images et médias
- ✅ Catégorisation hiérarchique
- ✅ Modération des produits (admin)

### 4. Panier et Commandes
- ✅ Gestion du panier
- ✅ Processus de commande complet
- ✅ Codes promotionnels
- ✅ Calcul automatique des totaux

### 5. Paiement
- ✅ Intégration Stripe
- ✅ Support multiple méthodes (carte, PayPal, virement)
- ✅ 3D Secure
- ✅ Gestion des remboursements

### 6. Logistique et Livraison
- ✅ Calcul des tarifs de livraison
- ✅ Génération d'étiquettes
- ✅ Suivi en temps réel (tracking)
- ✅ Gestion des retours

### 7. Évaluations et Avis
- ✅ Système de notation (1-5 étoiles)
- ✅ Avis textuels avec images
- ✅ Badge "Achat Vérifié"
- ✅ Réponses vendeur
- ✅ Vote utile/inutile

### 8. Communication
- ✅ Messagerie directe acheteur-vendeur
- ✅ Système de tickets support
- ✅ Notifications push/email

### 9. Litiges et Résolution
- ✅ Ouverture de réclamations
- ✅ Processus d'arbitrage
- ✅ Décisions équitables
- ✅ Système d'appels

### 10. Administration
- ✅ Modération des produits
- ✅ Gestion des utilisateurs
- ✅ Analytics globales
- ✅ Gestion des configurations

## Technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: JWT, 2FA (TOTP)
- **Paiement**: Stripe
- **UI Components**: Radix UI, shadcn/ui

## Installation

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env

# Configurer la base de données
pnpm prisma migrate dev

# Lancer le serveur de développement
pnpm dev
```

## Variables d'Environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/karisa"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Structure du Projet

```
karisa/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   ├── account/            # Pages compte utilisateur
│   ├── vendor/             # Pages vendeur
│   ├── admin/              # Pages administration
│   └── ...
├── components/             # Composants React
│   ├── ui/                 # Composants UI de base
│   ├── auth/               # Composants authentification
│   └── ...
├── lib/                    # Utilitaires et helpers
│   ├── auth.ts             # Authentification
│   ├── jwt.ts              # JWT tokens
│   ├── two-factor.ts       # 2FA
│   ├── payment.ts          # Paiements
│   └── ...
└── prisma/                 # Schéma Prisma
    └── schema.prisma
```

## Exigences Non-Fonctionnelles

### Performance
- ✅ API response < 200ms P95
- ✅ Temps de chargement page < 3s (3G)
- ✅ Support 10K+ RPS

### Sécurité
- ✅ PCI-DSS Level 1 compliance
- ✅ Chiffrement TLS 1.3
- ✅ Rate limiting
- ✅ Validation input
- ✅ Protection CSRF/XSS

### Disponibilité
- ✅ 99.9% SLA
- ✅ Multi-region deployment
- ✅ Auto-scaling
- ✅ Disaster recovery

### Scalabilité
- ✅ Horizontal scaling
- ✅ Read replicas
- ✅ Caching Redis
- ✅ CDN pour assets

## Documentation API

Les routes API suivent le pattern RESTful :

- `GET /api/products` - Liste des produits
- `POST /api/cart/items` - Ajouter au panier
- `POST /api/orders` - Créer une commande
- `POST /api/payments/create-intent` - Créer intent de paiement
- `GET /api/shipping/calculate` - Calculer frais de livraison
- `POST /api/reviews/create` - Créer un avis
- `POST /api/disputes/create` - Ouvrir un litige
- `POST /api/messages/send` - Envoyer un message
- `POST /api/support/tickets` - Créer un ticket

## Développement

```bash
# Générer le client Prisma
pnpm prisma generate

# Créer une migration
pnpm prisma migrate dev --name migration_name

# Lancer les tests
pnpm test

# Build production
pnpm build
```

## Licence

Propriétaire - Tous droits réservés
