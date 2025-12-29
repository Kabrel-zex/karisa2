# Services Architecture

Cette structure organise le code en modules de services, même si l'application est monolithique avec Next.js.
Chaque service est indépendant et peut être extrait en microservice si nécessaire.

## Structure des Services

```
services/
├── auth/          # Authentification, JWT, 2FA
├── user/         # Profils utilisateurs, adresses
├── product/      # Catalogue, variantes, recherche
├── inventory/    # Stocks, réservations
├── cart/         # Panier, coupons
├── order/        # Commandes, workflow
├── payment/      # Paiements, remboursements
├── shipping/     # Logistique, tracking
├── review/       # Avis, ratings
├── seller/       # Gestion vendeurs, boutiques
├── messaging/    # Chat, notifications
├── search/       # Recherche Elasticsearch
├── admin/        # Modération, analytics
└── notification/ # Email, SMS, push
```

## Principes

- Chaque service a ses propres types, services métier et utilitaires
- Les API routes dans `app/api/` appellent les services correspondants
- Les services peuvent communiquer via des événements (message queue)
- Chaque service peut avoir sa propre base de données ou partager PostgreSQL

