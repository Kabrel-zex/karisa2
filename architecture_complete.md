# ARCHITECTURE COMPLÈTE ET DÉTAILLÉE
## Plateforme E-Commerce Multivendeurs

---

## PARTIE 1 : ARCHITECTURE GLOBALE

### 1.1 Vue d'Ensemble du Système

```
                          ┌─────────────────────────────────────┐
                          │    CLIENT LAYER (Presentation)      │
                          ├─────────────────────────────────────┤
        ┌─────────────────┼─────────────────┬─────────────────┐
        │                 │                 │                 │
    ┌───────┐         ┌───────┐        ┌────────┐         ┌────────┐
    │ Web   │         │Mobile │        │ Admin  │         │Seller  │
    │(React)│         │(React │        │Panel   │         │App     │
    │       │         │Native)│        │(React) │         │(React) │
    └───┬───┘         └───┬───┘        └───┬────┘         └───┬────┘
        │                 │                 │                 │
        └─────────────────┼─────────────────┼─────────────────┘
                          │
                  ┌───────▼────────┐
                  │  API GATEWAY   │
                  │  (Kong/AWS)    │
                  │ - Rate Limit   │
                  │ - Auth         │
                  │ - Logging      │
                  └───────┬────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────────┐
        │                 │                 │                  │
    ┌───▼────┐       ┌────▼────┐      ┌────▼────┐        ┌────▼────┐
    │ Core   │       │ Vendor  │      │ Admin   │        │ Payment │
    │Service │       │ Service │      │ Service │        │ Service │
    │(Node)  │       │(Node)   │      │(Node)   │        │(Node)   │
    └────────┘       └─────────┘      └─────────┘        └─────────┘

    ┌───▼────┐       ┌────▼────┐      ┌────▼────┐        ┌────▼────┐
    │Order   │       │Product  │      │ Review  │        │ Shipping│
    │Service │       │ Service │      │ Service │        │ Service │
    │(Node)  │       │(Node)   │      │(Node)   │        │(Node)   │
    └────────┘       └─────────┘      └─────────┘        └─────────┘

        │                 │                 │                  │
        └─────────────────┼─────────────────┼──────────────────┘
                          │
                    ┌─────▼──────┐
                    │ Data Layer │
                    ├────────────┤
                    │ PostgreSQL │
                    │ Redis      │
                    │ MongoDB    │
                    │ Elasticsearch
                    └────────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────────┐
        │                 │                 │                  │
    ┌───▼────┐       ┌────▼────┐      ┌────▼────┐        ┌────▼────┐
    │  CDN   │       │  Message │      │ Storage │        │ Search  │
    │(Cloudflare)
    │        │       │ Queue    │      │(S3)     │        │(ES)     │
    └────────┘       │(RabbitMQ)│      └─────────┘        └─────────┘
                    └──────────┘
                          │
        ┌─────────────────┼─────────────────┬──────────────────┐
        │                 │                 │                  │
    ┌───▼────┐       ┌────▼────┐      ┌────▼────┐        ┌────▼────┐
    │  Email │       │  Payment │      │Shipping │        │Analytics│
    │Service │       │Gateway   │      │API      │        │ Service │
    │(SendGrid)
    │        │       │(Stripe)  │      │(FedEx,  │        │(BigQuery)
    └────────┘       │          │      │DHL)     │        └─────────┘
                    └──────────┘      └─────────┘
                          │
                    ┌─────▼──────┐
                    │Monitoring &│
                    │ Logging    │
                    ├────────────┤
                    │ Prometheus │
                    │ ELK Stack  │
                    │ Jaeger     │
                    │ DataDog    │
                    └────────────┘
```

---

## PARTIE 2 : ARCHITECTURE MICROSERVICES

### 2.1 Liste des Microservices

| Service | Port | Fonction | Tech Stack | Replica |
|---------|------|----------|-----------|---------|
| **Auth Service** | 3001 | Authentification, JWT, 2FA | Node.js + Express | 3 |
| **User Service** | 3002 | Profils, adresses, préférences | Node.js + Express | 3 |
| **Product Service** | 3003 | Gestion catalogue, variants | Node.js + Express | 5 |
| **Inventory Service** | 3004 | Stocks, réservations | Node.js + Express | 3 |
| **Cart Service** | 3005 | Panier, coupons | Node.js + Express | 3 |
| **Order Service** | 3006 | Commandes, workflows | Node.js + Express | 5 |
| **Payment Service** | 3007 | Paiements, webhooks, fraud | Node.js + Express | 5 |
| **Shipping Service** | 3008 | Logistique, tracking | Node.js + Express | 3 |
| **Review Service** | 3009 | Avis, ratings, modération | Node.js + Express | 3 |
| **Seller Service** | 3010 | Gestion vendeurs, boutiques | Node.js + Express | 3 |
| **Messaging Service** | 3011 | Chat, notifications | Node.js + Socket.io | 3 |
| **Search Service** | 3012 | Recherche full-text | Node.js + Elasticsearch | 2 |
| **Admin Service** | 3013 | Modération, analytics | Node.js + Express | 2 |
| **Analytics Service** | 3014 | Rapports, BI, KPIs | Node.js + BigQuery | 1 |
| **Notification Service** | 3015 | Email, SMS, push | Node.js + Bull | 3 |

### 2.2 Architecture Détaillée par Service

#### **2.2.1 Auth Service**

```
┌─────────────────────────────────────┐
│      AUTH SERVICE (3001)            │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - POST /register                    │
│ - POST /login                       │
│ - POST /2fa/setup                   │
│ - POST /2fa/verify                  │
│ - POST /refresh-token               │
│ - POST /logout                      │
│ - POST /password-reset              │
├─────────────────────────────────────┤
│ Services:                           │
│ - AuthenticationService             │
│ - PasswordService                   │
│ - TwoFactorService (TOTP/SMS)       │
│ - TokenService (JWT)                │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ PostgreSQL (users, sessions)    │
│ ├─ Redis (token blacklist)         │
│ ├─ Twilio (SMS 2FA)                │
│ └─ Node-2FA (TOTP)                 │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - user.registered                   │
│ - user.login                        │
│ - 2fa.enabled                       │
│ - password.reset                    │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
users:
  - id (UUID, PK)
  - email (VARCHAR, UNIQUE)
  - password_hash (VARCHAR)
  - first_name (VARCHAR)
  - last_name (VARCHAR)
  - user_type (ENUM: buyer, seller, admin)
  - status (ENUM: pending, active, suspended)
  - 2fa_enabled (BOOLEAN)
  - 2fa_method (ENUM: totp, sms)
  - phone_number (VARCHAR)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

sessions:
  - id (UUID, PK)
  - user_id (UUID, FK)
  - refresh_token (VARCHAR, UNIQUE)
  - expires_at (TIMESTAMP)
  - created_at (TIMESTAMP)
```

#### **2.2.2 User Service**

```
┌─────────────────────────────────────┐
│       USER SERVICE (3002)           │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - GET /profile                      │
│ - PUT /profile                      │
│ - GET /addresses                    │
│ - POST /addresses                   │
│ - PUT /addresses/{id}               │
│ - DELETE /addresses/{id}            │
│ - POST /payment-methods             │
│ - GET /wallet                       │
│ - POST /wallet/recharge             │
├─────────────────────────────────────┤
│ Services:                           │
│ - ProfileService                    │
│ - AddressService                    │
│ - PaymentMethodService              │
│ - WalletService                     │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ PostgreSQL                      │
│ ├─ Payment Service (PCI tokens)    │
│ └─ Event Bus (for updates)         │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - profile.updated                   │
│ - address.added/updated/deleted     │
│ - wallet.recharged                  │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
users_profiles:
  - user_id (UUID, PK, FK)
  - avatar_url (VARCHAR)
  - phone (VARCHAR)
  - country (VARCHAR)
  - preferred_language (VARCHAR)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

user_addresses:
  - id (UUID, PK)
  - user_id (UUID, FK)
  - label (VARCHAR)
  - full_name (VARCHAR)
  - street (VARCHAR)
  - building (VARCHAR)
  - city (VARCHAR)
  - postal_code (VARCHAR)
  - country (VARCHAR)
  - phone (VARCHAR)
  - is_default (BOOLEAN)
  - created_at (TIMESTAMP)

user_wallets:
  - user_id (UUID, PK, FK)
  - balance (DECIMAL(12,2))
  - currency (VARCHAR)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

#### **2.2.3 Product Service**

```
┌─────────────────────────────────────┐
│      PRODUCT SERVICE (3003)         │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - POST /products                    │
│ - GET /products (search, filter)    │
│ - GET /products/{id}                │
│ - PUT /products/{id}                │
│ - DELETE /products/{id}             │
│ - POST /products/{id}/images        │
│ - POST /products/{id}/bulk-upload   │
│ - GET /products/{id}/reviews        │
├─────────────────────────────────────┤
│ Services:                           │
│ - ProductService (CRUD)             │
│ - VariantService                    │
│ - ImageService (S3 integration)     │
│ - SearchService (ES sync)           │
│ - ModerationService                 │
│ - RecommendationService (ML)        │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ PostgreSQL (products, variants) │
│ ├─ MongoDB (product metadata)      │
│ ├─ Elasticsearch (search index)    │
│ ├─ S3 (image storage)              │
│ ├─ ImageMagick (resizing)          │
│ └─ ML Service (recommendations)    │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - product.created/updated/deleted   │
│ - product.published                 │
│ - product.rejected (moderation)     │
│ - product.image.uploaded            │
│ - variant.created/updated           │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
products:
  - id (UUID, PK)
  - seller_id (UUID, FK)
  - title (VARCHAR)
  - description (TEXT)
  - category_id (UUID, FK)
  - sku (VARCHAR, UNIQUE per seller)
  - current_price (DECIMAL(12,2))
  - original_price (DECIMAL(12,2))
  - quantity (INTEGER)
  - status (ENUM: draft, pending, active, inactive)
  - visibility (ENUM: public, private, scheduled)
  - published_at (TIMESTAMP)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

product_images:
  - id (UUID, PK)
  - product_id (UUID, FK)
  - url (VARCHAR)
  - alt_text (VARCHAR)
  - is_primary (BOOLEAN)
  - order (INTEGER)

product_variants:
  - id (UUID, PK)
  - product_id (UUID, FK)
  - sku (VARCHAR, UNIQUE)
  - attributes (JSONB)
  - price (DECIMAL(12,2))
  - stock (INTEGER)

product_attributes:
  - id (UUID, PK)
  - product_id (UUID, FK)
  - name (VARCHAR)
  - value (VARCHAR)
  - type (ENUM: text, select, multiselect)
```

#### **2.2.4 Inventory Service**

```
┌─────────────────────────────────────┐
│     INVENTORY SERVICE (3004)        │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - GET /inventory (products)         │
│ - PUT /inventory/{productId}        │
│ - POST /inventory/{productId}/log   │
│ - GET /inventory/reserved           │
├─────────────────────────────────────┤
│ Services:                           │
│ - InventoryService                  │
│ - ReservationService                │
│ - StockAllocationService            │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ PostgreSQL (inventory, logs)    │
│ ├─ Redis (real-time stock cache)   │
│ ├─ Order Service (reservations)    │
│ └─ Notification Service (alerts)   │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - inventory.updated                 │
│ - inventory.low_stock_alert         │
│ - inventory.reserved                │
│ - inventory.released                │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
inventory:
  - product_id (UUID, PK, FK)
  - current_quantity (INTEGER)
  - reserved_quantity (INTEGER)
  - available_quantity (GENERATED as current - reserved)
  - reorder_level (INTEGER)
  - last_restocked_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

inventory_logs:
  - id (UUID, PK)
  - product_id (UUID, FK)
  - quantity_change (INTEGER)
  - reason (ENUM: restock, order, return, correction)
  - order_id (UUID, optional FK)
  - notes (TEXT)
  - created_by (UUID, FK users)
  - created_at (TIMESTAMP)

reservations:
  - id (UUID, PK)
  - product_id (UUID, FK)
  - order_id (UUID, FK)
  - variant_id (UUID, FK)
  - quantity (INTEGER)
  - reserved_until (TIMESTAMP)
  - status (ENUM: active, released, used)
  - created_at (TIMESTAMP)
```

#### **2.2.5 Order Service**

```
┌─────────────────────────────────────┐
│       ORDER SERVICE (3006)          │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - POST /orders (create)             │
│ - GET /orders/{id}                  │
│ - GET /orders (list)                │
│ - PUT /orders/{id}/status           │
│ - PUT /orders/{id}/cancel           │
│ - POST /orders/{id}/return          │
│ - POST /orders/{id}/confirm-receipt │
│ - POST /orders/{id}/review          │
├─────────────────────────────────────┤
│ Services:                           │
│ - OrderService (CRUD)               │
│ - OrderCreationService (complex)    │
│ - ReturnService                     │
│ - OrderStatusService                │
│ - OrderValidationService            │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ PostgreSQL (orders, items)      │
│ ├─ Cart Service                    │
│ ├─ Inventory Service               │
│ ├─ Payment Service (charge)        │
│ ├─ Shipping Service (labels)       │
│ ├─ Notification Service            │
│ └─ Seller Service                  │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - order.created                     │
│ - order.confirmed                   │
│ - order.updated                     │
│ - order.shipped                     │
│ - order.delivered                   │
│ - order.cancelled                   │
│ - order.returned                    │
│ - return.approved                   │
│ - return.rejected                   │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
orders:
  - id (UUID, PK)
  - order_number (VARCHAR, UNIQUE)
  - user_id (UUID, FK)
  - status (ENUM: pending, confirmed, processing, shipped, delivered, completed, cancelled)
  - subtotal (DECIMAL(12,2))
  - tax_amount (DECIMAL(12,2))
  - shipping_cost (DECIMAL(12,2))
  - discount_amount (DECIMAL(12,2))
  - total_amount (DECIMAL(12,2))
  - currency (VARCHAR)
  - notes (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  - completed_at (TIMESTAMP)

order_items:
  - id (UUID, PK)
  - order_id (UUID, FK)
  - product_id (UUID, FK)
  - seller_id (UUID, FK)
  - variant_id (UUID, FK)
  - quantity (INTEGER)
  - unit_price (DECIMAL(12,2))
  - total_price (DECIMAL(12,2))
  - status (ENUM: pending, processing, shipped, delivered, returned, cancelled)

order_shipping:
  - order_id (UUID, PK, FK)
  - address_id (UUID, FK)
  - method (VARCHAR)
  - carrier (VARCHAR)
  - tracking_number (VARCHAR)
  - estimated_delivery (TIMESTAMP)
  - actual_delivery (TIMESTAMP)

order_returns:
  - id (UUID, PK)
  - order_id (UUID, FK)
  - reason (ENUM: defective, not_as_described, wrong_item, changed_mind)
  - status (ENUM: pending, approved, rejected, in_transit, received, completed)
  - created_at (TIMESTAMP)
```

#### **2.2.6 Payment Service**

```
┌─────────────────────────────────────┐
│      PAYMENT SERVICE (3007)         │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - POST /payments/process            │
│ - GET /payments/{transactionId}     │
│ - POST /payments/{id}/refund        │
│ - POST /webhooks/stripe             │
│ - POST /webhooks/paypal             │
├─────────────────────────────────────┤
│ Services:                           │
│ - PaymentService (orchestration)    │
│ - StripeService (integration)       │
│ - PayPalService (integration)       │
│ - RefundService                     │
│ - FraudDetectionService (ML)        │
│ - PCI-DSS ComplianceService         │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ Stripe API                      │
│ ├─ PayPal API                      │
│ ├─ PostgreSQL (transactions)       │
│ ├─ Redis (idempotency keys)        │
│ ├─ Order Service                   │
│ ├─ Notification Service            │
│ ├─ User Service (wallet)           │
│ └─ ML Service (fraud scoring)      │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - payment.initiated                 │
│ - payment.authorized                │
│ - payment.captured                  │
│ - payment.failed                    │
│ - payment.refunded                  │
│ - fraud.suspected                   │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
payments:
  - id (UUID, PK)
  - order_id (UUID, FK)
  - amount (DECIMAL(12,2))
  - currency (VARCHAR)
  - method (ENUM: card, bank_transfer, wallet, cod)
  - status (ENUM: pending, authorized, captured, failed, refunded)
  - gateway_transaction_id (VARCHAR)
  - gateway_response (JSONB)
  - created_at (TIMESTAMP)
  - processed_at (TIMESTAMP)

payment_transactions:
  - id (UUID, PK)
  - payment_id (UUID, FK)
  - type (ENUM: authorization, capture, refund)
  - amount (DECIMAL(12,2))
  - status (VARCHAR)
  - response (JSONB)
  - created_at (TIMESTAMP)

fraud_scores:
  - id (UUID, PK)
  - payment_id (UUID, FK)
  - risk_score (DECIMAL(3,2)) -- 0.0 to 1.0
  - risk_level (ENUM: low, medium, high)
  - indicators (JSONB)
  - created_at (TIMESTAMP)
```

#### **2.2.7 Shipping Service**

```
┌─────────────────────────────────────┐
│      SHIPPING SERVICE (3008)        │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - GET /shipping-methods             │
│ - POST /shipments                   │
│ - GET /shipments/{trackingNumber}   │
│ - POST /returns/initiate            │
│ - POST /returns/{id}/confirm        │
│ - GET /tracking/{trackingNumber}    │
├─────────────────────────────────────┤
│ Services:                           │
│ - ShippingService (orchestration)   │
│ - CarrierService (FedEx, DHL, etc)  │
│ - TrackingService (real-time)       │
│ - ReturnService                     │
│ - LabelGenerationService (PDF)      │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ FedEx API                       │
│ ├─ DHL API                         │
│ ├─ UPS API                         │
│ ├─ Colissimo API                   │
│ ├─ PostgreSQL (shipments, tracking)│
│ ├─ S3 (label storage)              │
│ └─ Notification Service            │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - shipment.created                  │
│ - shipment.tracking_updated         │
│ - shipment.delivered                │
│ - return.initiated                  │
│ - return.received                   │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
shipments:
  - id (UUID, PK)
  - order_id (UUID, FK)
  - tracking_number (VARCHAR, UNIQUE)
  - carrier (VARCHAR)
  - status (ENUM: pending, picked_up, in_transit, out_for_delivery, delivered, failed)
  - weight (DECIMAL(8,3)) -- kg
  - dimensions (JSONB) -- {width, height, length}
  - insurance (BOOLEAN)
  - cost (DECIMAL(12,2))
  - estimated_delivery (TIMESTAMP)
  - actual_delivery (TIMESTAMP)
  - label_url (VARCHAR)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

tracking_events:
  - id (UUID, PK)
  - shipment_id (UUID, FK)
  - timestamp (TIMESTAMP)
  - status (VARCHAR)
  - location (VARCHAR)
  - latitude (DECIMAL(10,8))
  - longitude (DECIMAL(11,8))
  - message (TEXT)

return_shipments:
  - id (UUID, PK)
  - order_return_id (UUID, FK)
  - carrier (VARCHAR)
  - tracking_number (VARCHAR)
  - status (ENUM: pending, in_transit, received, inspected)
  - condition (ENUM: as_new, used, defective)
  - created_at (TIMESTAMP)
```

#### **2.2.8 Review Service**

```
┌─────────────────────────────────────┐
│       REVIEW SERVICE (3009)         │
├─────────────────────────────────────┤
│ Controllers:                        │
│ - GET /products/{id}/reviews        │
│ - POST /products/{id}/reviews       │
│ - POST /reviews/{id}/respond        │
│ - POST /reviews/{id}/helpful        │
│ - POST /reviews/{id}/report         │
│ - GET /sellers/{id}/reviews         │
├─────────────────────────────────────┤
│ Services:                           │
│ - ReviewService (CRUD)              │
│ - ModerationService                 │
│ - SentimentAnalysisService (NLP)    │
│ - RatingService (aggregation)       │
│ - VerificationService               │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ ├─ PostgreSQL (reviews, responses) │
│ ├─ Order Service (verification)    │
│ ├─ NLP Library (sentiment)         │
│ ├─ S3 (review images)              │
│ ├─ Admin Service (moderation)      │
│ └─ Redis (rating cache)            │
├─────────────────────────────────────┤
│ Event Publishing:                   │
│ - review.submitted                  │
│ - review.published                  │
│ - review.rejected                   │
│ - review.moderated                  │
│ - response.added                    │
│ - rating.updated                    │
└─────────────────────────────────────┘

Database Schema (PostgreSQL):
reviews:
  - id (UUID, PK)
  - product_id (UUID, FK)
  - buyer_id (UUID, FK)
  - order_id (UUID, FK)
  - rating (INTEGER) -- 1-5
  - title (VARCHAR)
  - content (TEXT)
  - images (VARCHAR[])
  - verified_purchase (BOOLEAN)
  - status (ENUM: submitted, approved, rejected)
  - helpful_count (INTEGER)
  - unhelpful_count (INTEGER)
  - sentiment (ENUM: positive, neutral, negative)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

review_responses:
  - id (UUID, PK)
  - review_id (UUID, FK)
  - seller_id (UUID, FK)
  - content (TEXT)
  - created_at (TIMESTAMP)

seller_ratings:
  - seller_id (UUID, PK, FK)
  - average_rating (DECIMAL(3,2))
  - total_reviews (INTEGER)
  - rating_breakdown (JSONB) -- {5: count, 4: count, ...}
  - product_quality (DECIMAL(3,2))
  - shipping_speed (DECIMAL(3,2))
  - communication (DECIMAL(3,2))
  - return_quality (DECIMAL(3,2))
  - updated_at (TIMESTAMP)
```

### 2.3 Communication Inter-Services

```
SYNCHRONOUS (REST/gRPC):
├─ Cart → Product Service (Get product details)
├─ Cart → Inventory Service (Check stock)
├─ Order → Cart Service (Get cart items)
├─ Order → Inventory Service (Reserve stock)
├─ Order → Payment Service (Process payment)
├─ Order → Shipping Service (Create shipment)
├─ Review → Order Service (Verify purchase)
└─ Admin → All Services (Moderation)

ASYNCHRONOUS (Message Queue - RabbitMQ):
├─ Order Service → Notification Service (order.created)
├─ Payment Service → Order Service (payment.captured)
├─ Shipping Service → Notification Service (shipment.tracking_updated)
├─ Review Service → Admin Service (review.submitted)
├─ Order Service → Analytics Service (order.completed)
├─ Product Service → Search Service (product.updated)
├─ Seller Service → Admin Service (seller.created)
└─ Inventory Service → Notification Service (inventory.low_stock)

MESSAGE BROKER TOPOLOGY:
Topic: order.events
├─ Exchange: order.fanout
└─ Queues:
   ├─ notification.order.queue
   ├─ analytics.order.queue
   ├─ inventory.order.queue
   └─ seller.order.queue

Topic: payment.events
├─ Exchange: payment.fanout
└─ Queues:
   ├─ order.payment.queue
   ├─ notification.payment.queue
   └─ analytics.payment.queue
```

---

## PARTIE 3 : DATA LAYER - ARCHITECTURE DE DONNÉES

### 3.1 Sélection des Bases de Données

| Base | Type | Cas d'Usage | Raison |
|------|------|-----------|--------|
| **PostgreSQL** | Relationnel | Users, Orders, Products, Inventory | ACID, Transactions, Relationships |
| **MongoDB** | Document | Product metadata, Reviews, Analytics | Flexible schema, Scalability |
| **Redis** | Cache/Session | Cache, Sessions, Rate limiting, Queues | Speed, TTL, Atomic ops |
| **Elasticsearch** | Search | Full-text search produits | Fast queries, Aggregations |
| **S3** | Object Storage | Images, Videos, PDFs, Labels | Scalability, CDN integration |

### 3.2 Schéma PostgreSQL Principal

```sql
-- USERS & AUTH
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  user_type ENUM('buyer', 'seller', 'admin', 'support') NOT NULL,
  status ENUM('pending', 'active', 'suspended', 'deleted') DEFAULT 'pending',
  phone_number VARCHAR(20),
  country VARCHAR(2),
  kyc_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- SELLERS
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(100) NOT NULL,
  store_slug VARCHAR(100) UNIQUE NOT NULL,
  store_description TEXT,
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  business_type ENUM('individual', 'company', 'distributor'),
  business_license VARCHAR(50) UNIQUE,
  tax_id VARCHAR(50),
  status ENUM('pending', 'active', 'suspended', 'closed') DEFAULT 'pending',
  response_time VARCHAR(50),
  monthly_volume BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_store_slug ON sellers(store_slug);

-- PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID NOT NULL,
  sku VARCHAR(100) NOT NULL,
  current_price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  quantity INTEGER NOT NULL DEFAULT 0,
  status ENUM('draft', 'pending', 'active', 'inactive', 'rejected') DEFAULT 'draft',
  visibility ENUM('public', 'private', 'scheduled') DEFAULT 'public',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(seller_id, sku)
);

CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_published_at ON products(published_at);

-- PRODUCT VARIANTS
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  attributes JSONB, -- {color: "red", size: "M"}
  price DECIMAL(12,2),
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  image_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_product_id ON product_images(product_id);

-- ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  seller_id UUID NOT NULL REFERENCES sellers(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);

-- PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3),
  method ENUM('card', 'bank_transfer', 'wallet', 'cod'),
  status ENUM('pending', 'authorized', 'captured', 'failed', 'refunded') DEFAULT 'pending',
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- SHIPMENTS
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  tracking_number VARCHAR(100) UNIQUE,
  carrier VARCHAR(50),
  status ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'),
  weight DECIMAL(8,3),
  dimensions JSONB,
  cost DECIMAL(12,2),
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  label_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  verified_purchase BOOLEAN DEFAULT TRUE,
  status ENUM('submitted', 'approved', 'rejected') DEFAULT 'submitted',
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  sentiment ENUM('positive', 'neutral', 'negative'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ADDRESSES
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50),
  full_name VARCHAR(100) NOT NULL,
  street VARCHAR(255) NOT NULL,
  building VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_user_id ON user_addresses(user_id);

-- INVENTORY
CREATE TABLE inventory (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  last_restocked_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COUPONS
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('percentage', 'fixed') NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_order_value DECIMAL(12,2),
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
```

### 3.3 Redis Architecture

```
KEY PATTERNS:

Sessions:
- session:{sessionId} → {userId, expiresAt, ...} (TTL: 7 days)

Cache Produits:
- product:{productId} → Product object (TTL: 1 hour)
- products:category:{categoryId} → List of products (TTL: 1 hour)

Panier:
- cart:{userId} → {items: [...], totals: {...}} (TTL: 30 days)
- cart:lock:{userId} → 1 (TTL: 30 seconds) -- Distributed lock

Rate Limiting:
- rate:login:{userId}:{ip} → count (TTL: 60 seconds)
- rate:api:{userId} → count (TTL: 1 second)
- rate:upload:{userId} → count (TTL: 3600 seconds)

Blacklist:
- blacklist:token:{token} → 1 (TTL: token expiration)

Stock Cache:
- stock:{productId} → quantity (TTL: 5 minutes)
- reserved:{productId} → count (TTL: 5 minutes)

Recommendations:
- recommendations:{userId} → [productIds] (TTL: 24 hours)

Leaderboard:
- leaderboard:sellers → sorted set (score = rating, TTL: daily)

Locks Distribués:
- lock:{resource}:{id} → {lockId} (TTL: 30 seconds)
```

### 3.4 Elasticsearch Mapping

```json
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 2,
    "analysis": {
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "stop", "snowball"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "product_analyzer",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "description": {
        "type": "text",
        "analyzer": "product_analyzer"
      },
      "category": { "type": "keyword" },
      "seller_id": { "type": "keyword" },
      "price": { "type": "scaled_float", "scaling_factor": 100 },
      "rating": { "type": "float" },
      "in_stock": { "type": "boolean" },
      "created_at": { "type": "date" },
      "view_count": { "type": "integer" },
      "sales_count": { "type": "integer" },
      "tags": { "type": "keyword" }
    }
  }
}
```

### 3.5 MongoDB Collections

```javascript
// Product Metadata
db.products_metadata.createIndex({
  product_id: 1,
  seller_id: 1
});

db.products_metadata.insertOne({
  product_id: "uuid",
  seller_id: "uuid",
  seo: {
    meta_title: "...",
    meta_description: "...",
    keywords: ["..."],
    slug: "..."
  },
  attributes: {
    // Flexible attributes for different product types
  },
  analytics: {
    views_last_30d: 150,
    conversions: 10,
    avg_rating: 4.5
  }
});

// Reviews
db.reviews.createIndex({
  product_id: 1,
  status: 1,
  created_at: -1
});

// User Sessions (alternative)
db.sessions.createIndex({
  user_id: 1,
  expires_at: 1
}, { expireAfterSeconds: 0 });
```

---

## PARTIE 4 : INFRASTRUCTURE ET DEVOPS

### 4.1 Architecture Kubernetes

```yaml
NAMESPACES:
├─ production
├─ staging
├─ development
└─ monitoring

CLUSTER CONFIGURATION:
├─ Control Plane Nodes: 3 (HA)
├─ Worker Nodes: 10-20 (auto-scaling)
├─ Node Pool: n1-standard-4 (4 CPU, 15GB RAM)

WORKLOADS (Deployments):
├─ API Gateway (3 replicas)
├─ Auth Service (3 replicas)
├─ Product Service (5 replicas)
├─ Order Service (5 replicas)
├─ Payment Service (5 replicas)
├─ Shipping Service (3 replicas)
├─ Notification Service (3 replicas)
├─ Admin Service (2 replicas)
├─ Analytics Service (1 replica)
└─ All other services...

STATEFUL COMPONENTS (StatefulSets):
├─ PostgreSQL (Primary + 2 Replicas)
├─ MongoDB (Replica Set)
├─ Redis (Master + Slaves)
└─ Elasticsearch Cluster

INGRESS:
├─ Main API (api.ecommerce.com)
├─ Admin Panel (admin.ecommerce.com)
├─ Seller Portal (seller.ecommerce.com)
├─ CDN Front (cdn.ecommerce.com)
└─ WebSocket (ws.ecommerce.com)

PERSISTENT VOLUMES:
├─ PostgreSQL (SSD, 500GB)
├─ MongoDB (SSD, 300GB)
├─ Elasticsearch (SSD, 200GB)
└─ Redis (SSD, 100GB)

NETWORK POLICIES:
├─ Inter-service communication restricted
├─ External API calls controlled
├─ Database access limited to needed services
└─ Default deny, explicit allow
```

### 4.2 Container Architecture

```dockerfile
# Example: Product Service Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "server.js"]
```

### 4.3 CI/CD Pipeline

```
GITHUB PUSH (Feature Branch)
    ↓
1. RUN TESTS
   ├─ Unit tests (Jest)
   ├─ Integration tests (Supertest)
   ├─ Linting (ESLint)
   └─ Code quality (SonarQube)
    ↓
2. BUILD DOCKER IMAGE
   ├─ Semantic versioning
   ├─ Push to Docker Registry
   └─ Scan for vulnerabilities (Trivy)
    ↓
3. DEPLOY TO STAGING
   ├─ Blue-green deployment
   ├─ Smoke tests
   └─ Performance baseline
    ↓
4. MANUAL APPROVAL
    ↓
5. DEPLOY TO PRODUCTION
   ├─ Blue-green deployment (zero downtime)
   ├─ Canary 10% traffic
   ├─ Monitor for errors
   ├─ Canary 50% traffic
   ├─ Canary 100% traffic
   └─ Auto-rollback if errors > threshold
    ↓
6. POST-DEPLOY
   ├─ Smoke tests
   ├─ Database migrations
   └─ Cache warming

GITHUB PULL REQUEST
    ↓
1. RUN TESTS + LINTING
2. COMMENT WITH RESULTS
3. REQUIRE APPROVAL
4. MERGE TO MAIN
```

### 4.4 Monitoring Stack

```
┌─────────────────────────────────┐
│    Application Monitoring       │
├─────────────────────────────────┤
│ Prometheus (Metrics)            │
│ - CPU, Memory, Disk             │
│ - Request latency (histograms)  │
│ - Error rates by endpoint       │
│ - Custom business metrics       │
│ - Retention: 30 days            │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Grafana (Visualization)         │
├─────────────────────────────────┤
│ - Dashboards (pre-built)        │
│ - Alerts on thresholds          │
│ - Alert routing (PagerDuty)     │
│ - Multi-team access             │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Logging Stack (ELK)             │
├─────────────────────────────────┤
│ Filebeat → Logstash → Elasticsearch
│ - Structured JSON logs          │
│ - Request tracing (trace ID)    │
│ - Error stack traces            │
│ - Retention: 90 days            │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Distributed Tracing (Jaeger)    │
├─────────────────────────────────┤
│ - Request flow across services  │
│ - Latency breakdown             │
│ - Dependency visualization      │
│ - Retention: 7 days             │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Error Tracking (Sentry)         │
├─────────────────────────────────┤
│ - Exception tracking            │
│ - Stack traces                  │
│ - User context                  │
│ - Release tracking              │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│ Uptime Monitoring (StatusPage)  │
├─────────────────────────────────┤
│ - API health checks             │
│ - Database reachability         │
│ - External integrations         │
│ - Public status page            │
└─────────────────────────────────┘
```

---

## PARTIE 5 : SÉCURITÉ - IMPLÉMENTATION DÉTAILLÉE

### 5.1 Authentification et Autorisation

```
LOGIN FLOW:
1. User POST /auth/login (email, password)
2. Hash password avec bcrypt.compare()
3. Si match:
   - Créer access token (JWT, 15 min)
   - Créer refresh token (JWT, 7 jours)
   - Stocker refresh token en Redis
   - Retourner tokens
4. Si non-match:
   - Incrémenter rate limit counter
   - Si 5+ attempts: blocage 1h
   - Retourner 401 Unauthorized

2FA FLOW (si enabled):
1. User login → Check 2FA enabled
2. Send OTP SMS ou TOTP prompt
3. User entre code
4. Valider avec Twilio (SMS) ou speakeasy (TOTP)
5. Si valide: Procéder avec token issuance
6. Si invalide: Rate limit (3 tentatives)

JWT STRUCTURE:
{
  "sub": "user-id",
  "iss": "ecommerce-api",
  "iat": 1234567890,
  "exp": 1234568890,
  "permissions": ["read:products", "create:orders"],
  "userType": "buyer"
}

TOKEN REFRESH:
1. User POST /auth/refresh-token (refreshToken)
2. Valider signature JWT
3. Vérifier token en Redis (pas blacklisté)
4. Vérifier expiration
5. Si valid: Émettre nouveau access token
6. Rotation: Optionnellement émettre nouveau refresh token
```

### 5.2 Payment Security (PCI-DSS)

```
PAYMENT FLOW SÉCURISÉ:
1. CLIENT SIDE:
   - User saisit card details
   - Jamais envoyer au backend
   - Utiliser Stripe.js pour tokenization
   - Envoyer token seulement

2. BACKEND:
   - Recevoir token sécurisé
   - Créer PaymentIntent via Stripe API
   - Envoyer payment method + amount
   - Stripe effectue 3D Secure si requis

3. 3D SECURE:
   - Si 3D requis: Stripe retourne URI
   - Redirect user à page verification
   - User rentre code OTP/biometrique
   - Return token au backend
   - Procéder avec payment

4. FRAUD DETECTION:
   - ML model scoring chaque transaction
   - Features: géolocalisation, device, montant, vitesse
   - Si score > seuil: 2FA ou manual review
   - Log toutes flagged transactions
   - Dashboard admin pour review

5. DATA PROTECTION:
   - Jamais stocker: Full card number, CVV
   - Stocker: Token uniquement
   - Encryption: TLS in transit
   - At rest: Encrypted in DB (KMS)
   - Audit: Tous accès à données paiement
```

### 5.3 Infrastructure Security

```
NETWORK SECURITY:
├─ WAF (Web Application Firewall)
│  ├─ SQL Injection rules
│  ├─ XSS rules
│  ├─ Rate limiting
│  └─ Geographic IP blocking
├─ DDoS Protection (Cloudflare)
│  ├─ Auto-mitigation
│  ├─ Captcha challenges
│  └─ IP reputation scoring
└─ VPN/Private Endpoints
   ├─ Database accessible only via VPN
   ├─ Bastion host pour SSH

SECRETS MANAGEMENT:
├─ HashiCorp Vault
│  ├─ Database credentials
│  ├─ API keys (Stripe, SendGrid, etc)
│  ├─ Encryption keys (KMS)
│  └─ Rotation auto (90 days)
├─ Encrypted Environment Variables
│  └─ AWS Secrets Manager

SSL/TLS:
├─ TLS 1.2+ everywhere
├─ Certificate: Wildcard or SAN
├─ Auto-renewal (Let's Encrypt)
├─ HSTS header (1 year)
└─ Certificate pinning (optionnel)

DEPENDENCY SECURITY:
├─ npm audit avant deploy
├─ Snyk scanning
├─ Renovate pour auto-updates (critical)
├─ Lock files versionnés
└─ Supply chain attestation (SLSA)
```

---

## PARTIE 6 : DEPLOYMENT ET SCALING

### 6.1 Multi-Region Deployment

```
REGIONS:
├─ EU (Primary: Frankfurt)
│  └─ Latency: < 50ms para EU users
├─ US (Secondary: us-east-1)
│  └─ Latency: < 30ms pour US users
├─ APAC (Tertiary: Singapore)
│  └─ Latency: < 40ms pour APAC users
└─ CDN: Global (Cloudflare)
   └─ ~200 edge locations

REPLICATION STRATEGY:
├─ Database:
│  ├─ Primary: Frankfurt
│  ├─ Read replicas: US, APAC
│  ├─ Continuous replication (< 1s lag)
│  └─ Manual failover si primary down
├─ Cache (Redis):
│  ├─ Local clusters per region
│  ├─ No cross-region replication
│  └─ User redirected si region down
├─ Search (Elasticsearch):
│  ├─ Cluster per region
│  ├─ Nightly sync via S3
│  └─ Eventual consistency OK
└─ S3 (Images/Videos):
   ├─ Single bucket eu-west-1
   ├─ Replicated to us-east-1, ap-southeast-1
   └─ CloudFront distribution global

TRAFFIC ROUTING:
├─ GeoDNS (Route53)
│  └─ Resolve to nearest region
├─ Load balancing:
│  ├─ Kubernetes ingress per region
│  ├─ Service to service via service mesh (Istio)
│  └─ Circuit breaking, retries, timeouts
└─ User session stickiness:
   └─ First region choice sticky, fallback elsewhere
```

### 6.2 Auto-Scaling Policies

```
KUBERNETES HPA (Horizontal Pod Autoscaling):
├─ Product Service:
│  ├─ Min replicas: 5
│  ├─ Max replicas: 20
│  ├─ CPU target: 70%
│  ├─ Memory target: 80%
│  └─ Scale-up: 30 sec, Scale-down: 300 sec
├─ Order Service:
│  ├─ Min replicas: 5
│  ├─ Max replicas: 25
│  └─ Custom metric: orders_queued (target: 100)
├─ Payment Service:
│  ├─ Min replicas: 5
│  ├─ Max replicas: 30
│  └─ Custom metric: payment_latency_p99 (target: 500ms)
└─ Notification Service:
   ├─ Min replicas: 3
   ├─ Max replicas: 15
   └─ Custom metric: queue_depth (target: 1000)

DATABASE SCALING:
├─ Vertical:
│  ├─ Primary: vm-standard-4 (4 CPU, 15GB RAM)
│  ├─ Upgrade si: CPU > 80% pour 30 min
│  └─ Max: vm-standard-16 (16 CPU, 60GB RAM)
├─ Horizontal:
│  ├─ Read replicas: +1 si replication lag > 5 sec
│  ├─ Max read replicas: 10
│  └─ Sharding: Par seller_id si DB > 500GB
└─ Storage:
   └─ Auto-expansion: PostgreSQL auto-increases disk

CACHE SCALING:
├─ Redis:
│  ├─ Memory target: < 80%
│  ├─ Cluster mode: > 100GB data
│  └─ Eviction: LRU if memory full
└─ Elasticsearch:
   ├─ Shards per index: 5
   ├─ Replicas: 2
   └─ Add nodes si heap usage > 80%

LOAD TESTING (Pre-scaling trigger):
├─ Weekly synthetic load: 5K concurrent users
├─ Black Friday prep: 50K concurrent users
├─ Scale up 48h before expected spike
└─ Scale down 24h after traffic normalizes
```

### 6.3 Disaster Recovery

```
RTO/RPO TARGETS:
├─ RTO (Recovery Time Objective): 1 hour
├─ RPO (Recovery Point Objective): 15 minutes
└─ Database: RTO 5 min, RPO 1 min (HA)

BACKUP STRATEGY:
├─ PostgreSQL:
│  ├─ Continuous WAL archiving
│  ├─ Hourly snapshots (7 days retention)
│  ├─ Daily full backups (30 days)
│  ├─ Cross-region replication
│  └─ Test restore monthly
├─ MongoDB:
│  ├─ Hourly snapshots
│  ├─ Daily backups (30 days)
│  └─ Cross-region S3 copy
├─ Redis:
│  ├─ RDB snapshots hourly
│  ├─ AOF (Append-Only File) enabled
│  └─ Replication to standby
└─ Elasticsearch:
   ├─ Snapshots (daily) to S3
   ├─ 30 days retention
   └─ Cross-region copy

FAILOVER PROCEDURES:
├─ Automatic (RTO < 30 sec):
│  ├─ Kubernetes pod failures → auto-restart
│  ├─ Node failures → pod rescheduling
│  ├─ Database replica → promotion (requires manual trigger)
│  └─ Cache loss → rebuild from DB
├─ Manual (RTO 5-60 min):
│  ├─ Primary region unavailable → failover to secondary
│  ├─ Database restore from backup
│  ├─ DNS update (GeoDNS)
│  └─ Runbook: ~30 steps, automated where possible
└─ Testing:
   ├─ Quarterly disaster recovery drill
   ├─ Failover to secondary region
   ├─ Full data validation
   ├─ Failback procedure tested
   └─ Timeline documented
```

---

## PARTIE 7 : INTÉGRATIONS EXTERNES

### 7.1 Payment Integrations

```
┌─────────────────────────────────────┐
│    PAYMENT GATEWAY INTEGRATION      │
├─────────────────────────────────────┤
│ PRIMARY: Stripe                     │
├─────────────────────────────────────┤
│ Endpoints:                          │
│ - Create PaymentIntent              │
│ - Confirm Payment                   │
│ - Create/Manage Cards               │
│ - Refunds                           │
│ - Disputes                          │
│                                     │
│ Webhooks:                           │
│ - payment_intent.succeeded          │
│ - payment_intent.payment_failed     │
│ - charge.refunded                   │
│ - charge.dispute.created            │
│                                     │
│ Fallback: PayPal                    │
│ - If Stripe unavailable             │
│ - Create order, return approval URL │
│ - Execute payment on return         │
│                                     │
│ Local Methods:                      │
│ - Bank transfer (SEPA, ACH)         │
│ - Cash on delivery (COD)            │
│ - Digital wallets (Apple Pay, GPay) │
└─────────────────────────────────────┘

3D SECURE FLOW:
1. Stripe detects 3D requirement
2. Returns client_secret
3. Frontend uses Stripe.js confirmCardPayment()
4. User redirected to bank auth
5. Returns to success/failure page
6. Backend verifies payment status
7. Order confirmed if succeeded

FRAUD SCORING:
├─ Stripe Radar (rules + ML)
├─ Custom model trained on:
│  ├─ Velocity (orders per user per day)
│  ├─ Device fingerprinting
│  ├─ Geolocation changes
│  ├─ Amount anomaly
│  └─ User age (new account more likely fraud)
├─ Risk levels:
│  ├─ Low (< 0.3): Auto-approve
│  ├─ Medium (0.3-0.7): 2FA for card > $500
│  └─ High (> 0.7): Manual review, block if patterns match
└─ Monitoring:
   └─ Dashboard: Chargeback rate, false positive rate
```

### 7.2 Shipping Integrations

```
┌──────────────────────────────────────┐
│      SHIPPING INTEGRATIONS           │
├──────────────────────────────────────┤
│ CARRIERS:                            │
├──────────────────────────────────────┤
│ 1. FedEx                             │
│    - REST API for rates/labels       │
│    - Webhook for tracking updates    │
│    - Test account available          │
│    - Credentials: API key + password │
│                                      │
│ 2. DHL                               │
│    - Similar API structure           │
│    - International strength          │
│    - Customs declaration support     │
│                                      │
│ 3. UPS                               │
│    - OAuth authentication            │
│    - Pickup scheduling API           │
│    - Tracking webhooks               │
│                                      │
│ 4. Colissimo (La Poste)              │
│    - France domestic strength        │
│    - SOAP API (legacy)               │
│    - REST API (new)                  │
│                                      │
│ 5. DHL eCommerce (cheaper option)    │
│    - Parcel solutions                │
│    - Returns integration             │
└──────────────────────────────────────┘

LABEL GENERATION:
1. Order created, seller confirms
2. Shipping Service queries FedEx/DHL APIs
3. Receive label binary (PDF/PNG)
4. Store on S3, generate signed URL
5. Seller downloads, prints physical label
6. Hand to driver or drop-off
7. Carrier scans, tracking starts
8. Webhook received with tracking number
9. Update order, notify customer

TRACKING WEBHOOK:
1. Carrier sends: trackingNumber, status, location
2. Backend updates order_items status
3. Event: shipment.tracking_updated
4. Notification Service sends email to customer
5. Frontend shows real-time tracking map
6. On delivery: order status → delivered, ask for review

RETURN LOGISTICS:
1. Customer initiates return in order details
2. Shipping Service creates return label (pre-paid)
3. Customer receives label (email + print)
4. Drops off at carrier location
5. Tracking updates reflected in return status
6. Delivery to seller warehouse
7. Seller confirms receipt, inspects, approves refund
8. Money returned to customer within 5-7 days
```

### 7.3 Communication Integrations

```
┌──────────────────────────────────────┐
│   COMMUNICATION INTEGRATIONS         │
├──────────────────────────────────────┤
│ EMAIL: SendGrid                      │
│ - Template management                │
│ - Transactional email                │
│ - Bounce/complaint handling          │
│ - Webhooks for delivery/open         │
│ - Rate: 100K/month free              │
│                                      │
│ SMS: Twilio                          │
│ - 2FA codes                          │
│ - Order status updates               │
│ - Delivery alerts                    │
│ - Fallback via AWS SNS               │
│                                      │
│ PUSH: Firebase Cloud Messaging (FCM) │
│ - Web push notifications             │
│ - Mobile app notifications           │
│ - Rich media support                 │
│ - Topic-based broadcasting           │
│                                      │
│ CHAT: Socket.io (in-app)             │
│ - Real-time messaging                │
│ - Presence detection                 │
│ - File uploads in chat               │
│ - History stored in MongoDB          │
└──────────────────────────────────────┘

NOTIFICATION TEMPLATES:
├─ Order confirmation
├─ Order shipped
├─ Delivery estimated
├─ Delivery completed
├─ Review reminder
├─ Return approved
├─ Refund initiated
├─ Account security alert
├─ Product back in stock
└─ Promotional emails (if opt-in)
```

---

## PARTIE 8 : STACK TECHNIQUE DÉTAILLÉ

### 8.1 Frontend Stack

```
WEB APPLICATION:
├─ Framework: React 18
├─ State management:
│  ├─ Redux Toolkit (global state)
│  ├─ React Query (server state, caching)
│  └─ Context API (UI state)
├─ Styling:
│  ├─ Tailwind CSS (utility-first)
│  ├─ CSS Modules (scoped styles)
│  └─ Emotion (dynamic styles)
├─ UI Components:
│  ├─ Material-UI (base components)
│  ├─ React Hook Form (forms)
│  ├─ React Table (data tables)
│  └─ Recharts (charting)
├─ Routing: React Router v6
├─ Build: Vite (fast development)
├─ Testing:
│  ├─ Vitest (unit tests)
│  ├─ React Testing Library (component tests)
│  └─ Cypress (E2E tests)
├─ Code quality:
│  ├─ ESLint
│  ├─ Prettier
│  └─ TypeScript (type safety)
└─ Performance:
   ├─ Code splitting
   ├─ Lazy loading
   ├─ Image optimization (next/image equivalent)
   └─ Bundle analysis

MOBILE APP:
├─ Framework: React Native
├─ Navigation: React Navigation
├─ State: Redux Toolkit
├─ HTTP client: Axios
├─ Storage: AsyncStorage
├─ Push notifications: Firebase FCM
├─ Build:
│  ├─ iOS: Xcode + CocoaPods
│  ├─ Android: Android Studio + Gradle
│  └─ CI/CD: EAS Build (Expo)
```

### 8.2 Backend Stack

```
API SERVERS:
├─ Runtime: Node.js 18 LTS
├─ Framework: Express.js
├─ Language: TypeScript
├─ API Style: REST + WebSocket
├─ Authentication: Passport.js
├─ Validation: Joi + class-validator
├─ Logging: Winston + Morgan
├─ Error handling: Custom error classes
└─ Testing:
   ├─ Jest (unit tests)
   ├─ Supertest (API tests)
   └─ Docker Compose (integration tests)

ASYNC JOBS:
├─ Queue: Bull + Redis
├─ Jobs:
│  ├─ Send emails
│  ├─ Generate reports
│  ├─ Process refunds
│  ├─ Sync inventory
│  ├─ Index search
│  └─ Cleanup temp data
├─ Retries: Exponential backoff
└─ Monitoring: Bull Board (UI)

MESSAGE QUEUE:
├─ Broker: RabbitMQ
├─ Client library: amqplib
├─ Pattern: Event-driven
├─ DLX: Dead Letter Exchange for errors
└─ Monitoring: RabbitMQ Management UI

CRON JOBS:
├─ Library: node-cron
├─ Jobs:
│  ├─ Daily: Generate invoices
│  ├─ Hourly: Backup database
│  ├─ Weekly: Generate reports
│  └─ Monthly: Cleanup old data
└─ Fallback: Kubernetes CronJob

SEARCH:
├─ Library: @elastic/elasticsearch
├─ Indexing: Bulk indexing from PostgreSQL
├─ Sync: Real-time via message queue
└─ Geo-search: Geo_distance queries
```

### 8.3 Database Stack

```
PRIMARY:
├─ PostgreSQL 14+
├─ Connection pooling: PgBouncer (100-500 connections)
├─ Replication: Streaming WAL
├─ Backup: pg_basebackup + WAL archiving
├─ Monitoring: pg_stat_statements
└─ Extensions:
   ├─ uuid-ossp
   ├─ PostGIS (optional, for geo)
   ├─ pg_trgm (full-text search)
   └─ jsonb operators

CACHE:
├─ Redis 7+
├─ Memory: 64GB (eval for your scale)
├─ Persistence: RDB + AOF
├─ Replication: Master-Slave
├─ Monitoring: redis-cli INFO
└─ Libraries:
   ├─ ioredis (Node.js client)
   └─ redis-commander (monitoring)

SEARCH:
├─ Elasticsearch 8.x
├─ Cluster: 3+ nodes (minimum)
├─ JVM heap: 4GB per node
├─ Monitoring: Kibana
└─ Library: @elastic/elasticsearch

DOCUMENT DB:
├─ MongoDB 5.0+
├─ Replica set: 3 nodes
├─ Sharding: By seller_id (Y2)
├─ Compression: WiredTiger
├─ Backup: Atlas automatic backups
└─ Library: mongoose
```

---

## PARTIE 9 : MATRICE COMPLÈTE D'ARCHITECTURE

### 9.1 Composants par Domaine Fonctionnel

| Domaine | Services | DB | Cache | Queue | External |
|---------|----------|-----|-------|-------|----------|
| **Auth** | AuthService | PostgreSQL | Redis sessions | - | Twilio (2FA) |
| **User** | UserService | PostgreSQL | Redis profile | - | - |
| **Product** | ProductService, SearchService | PostgreSQL, MongoDB | Redis, ES | RabbitMQ | ImageMagick |
| **Inventory** | InventoryService | PostgreSQL | Redis stock | RabbitMQ | - |
| **Cart** | CartService | PostgreSQL, Redis | Redis cart | - | - |
| **Order** | OrderService | PostgreSQL | - | RabbitMQ | - |
| **Payment** | PaymentService | PostgreSQL | Redis idempotency | RabbitMQ | Stripe, PayPal |
| **Shipping** | ShippingService | PostgreSQL | - | RabbitMQ | FedEx, DHL, UPS |
| **Review** | ReviewService | PostgreSQL, MongoDB | Redis ratings | RabbitMQ | NLP service |
| **Messaging** | MessagingService | MongoDB | - | Socket.io | - |
| **Notification** | NotificationService | MongoDB | - | Bull queue | SendGrid, Twilio, FCM |
| **Search** | SearchService | - | - | RabbitMQ | Elasticsearch |
| **Admin** | AdminService | PostgreSQL | - | - | - |
| **Analytics** | AnalyticsService | BigQuery | - | RabbitMQ | - |

### 9.2 Critères de Sélection Technologique

```
Pourquoi Express.js?
├─ Léger et flexible
├─ Écosystème npm riche
├─ TypeScript support excellent
├─ Middleware pattern adapté
└─ Équipe Node.js familiaire

Pourquoi PostgreSQL?
├─ ACID guarantees (critiques pour finance)
├─ JSON support (flexible)
├─ Scalabilité read (replicas)
├─ Coût (open source)
└─ Relationships (orders, items, variants)

Pourquoi Redis?
├─ Sub-millisecond latency
├─ Perfect pour sessions
├─ Pub/sub pour messaging
└─ Distributed locks

Pourquoi Elasticsearch?
├─ Full-text search performant
├─ Faceting/aggregations
├─ Geo-search capability
└─ Real-time indexing

Pourquoi RabbitMQ?
├─ Reliable message delivery
├─ Dead letter queues
├─ Delayed messages
└─ Durable queues
```

---

## PARTIE 10 : NETWORK & CDN ARCHITECTURE

### 10.1 Content Delivery Network

```
┌─────────────────────────────────┐
│     CLOUDFLARE CDN              │
├─────────────────────────────────┤
│ Features:                       │
│ ├─ 200+ edge locations         │
│ ├─ DDoS protection             │
│ ├─ WAF (Web App Firewall)      │
│ ├─ Image optimization          │
│ ├─ Automatic minification      │
│ ├─ HTTP/2 + HTTP/3            │
│ └─ Cache rules                │
│                                │
│ Routing Rules:                │
│ ├─ /api/* → API Gateway      │
│ ├─ /images/* → S3 (cached)   │
│ ├─ /static/* → Bucket (1y)   │
│ ├─ /admin/* → Admin panel    │
│ └─ /* → Frontend (SPA)       │
│                                │
│ Cache Configuration:           │
│ ├─ JS/CSS: 30 days            │
│ ├─ Images: 1 year             │
│ ├─ API: No cache (validation) │
│ └─ HTML: 5 minutes            │
└─────────────────────────────────┘

S3 BUCKET STRUCTURE:
s3://ecommerce-prod/
├─ products/
│  └─ {productId}/
│     ├─ original/
│     ├─ large-1200x1200/
│     ├─ medium-600x600/
│     ├─ thumb-200x200/
│     └─ webp variants
├─ videos/
│  └─ {productId}/
│     ├─ original.mp4
│     ├─ hd-1080p.mp4
│     ├─ mobile-720p.mp4
│     └─ thumbnail.jpg
├─ shipping-labels/
│  └─ {orderId}/
│     └─ label.pdf
├─ invoices/
│  └─ {orderId}/
│     └─ invoice.pdf
└─ backups/
   ├─ daily/
   ├─ weekly/
   └─ monthly/

OBJECT LIFECYCLE:
├─ Invoices: Keep 7 years (regulatory)
├─ Shipping labels: Delete after 1 year
├─ Product images: Keep indefinitely
├─ Backups: 
│  ├─ Daily: 7 days
│  ├─ Weekly: 4 weeks
│  ├─ Monthly: 1 year
│  └─ Cross-region: 1 year
└─ Analytics logs: 90 days
```

---

## RÉSUMÉ ARCHITECTURE GLOBALE

### Stack Récapitulé

```
FRONTEND:
- React 18 (Web)
- React Native (Mobile)
- Tailwind CSS
- Redux + React Query

BACKEND:
- Node.js + Express (15 microservices)
- TypeScript
- Bull + RabbitMQ (async jobs)
- Socket.io (WebSocket)

DATA:
- PostgreSQL (relational)
- MongoDB (documents)
- Redis (cache + sessions)
- Elasticsearch (search)

INFRASTRUCTURE:
- Kubernetes (orchestration)
- 3 regions (EU, US, APAC)
- Auto-scaling (HPA)
- Multi-AZ HA

INTEGRATIONS:
- Stripe (payments)
- FedEx/DHL (shipping)
- SendGrid (email)
- Twilio (SMS/2FA)
- Firebase FCM (push)

OPERATIONS:
- Prometheus + Grafana (monitoring)
- ELK Stack (logging)
- Jaeger (tracing)
- Sentry (errors)

SECURITY:
- TLS 1.2+ everywhere
- JWT + 2FA
- PCI-DSS L1
- WAF + DDoS protection
```

---

*Architecture Complète et Détaillée - Version 1.0*
*Prête pour présentation et implémentation*