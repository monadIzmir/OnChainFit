# PrintChain - CLAUDE.md

## Proje Özeti

**PrintChain** Web3 destekli print-on-demand e-ticaret platformu. Markalar, tasarımcılar ve müşterileri Monad Testnet üzerinde birleştiren monorepo.

- **Backend:** Fastify + Prisma + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + React Query + Zustand
- **Blockchain:** Monad Testnet, ethers.js, PrintChainRegistry + RoyaltyDistributor sözleşmeleri
- **Depolama:** Pinata IPFS + Cloudflare R2
- **Ödeme:** Stripe + MONAD token

---

## Geliştirme Komutları

```bash
# Tüm uygulamaları başlat (root'ta)
pnpm dev

# Sadece backend
cd apps/backend && pnpm dev

# Sadece frontend
cd apps/frontend && pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Veritabanı migrate
pnpm db:migrate
# veya
cd apps/backend && npx prisma migrate dev

# Veritabanı seed
cd apps/backend && npx prisma db seed

# Prisma Studio
cd apps/backend && npx prisma studio

# Smart contract deploy (Monad Testnet)
pnpm contracts:deploy
# veya
cd packages/smart-contracts && npx hardhat run scripts/deploy.ts --network monad_testnet

# Docker (local development)
docker-compose -f docker-compose.dev.yml up -d

# Docker (production)
docker-compose -f docker-compose.prod.yml up -d
```

---

## Proje Yapısı

```
OnChainFit/
├── apps/
│   ├── backend/                    # Fastify API (port: 3001)
│   │   └── src/
│   │       ├── app.ts              # Fastify app kurulumu, tüm route'lar burada register edilir
│   │       ├── index.ts            # Entry point
│   │       ├── config/env.ts       # Zod ile env doğrulama
│   │       ├── routes/             # Route handler'ları
│   │       │   ├── auth.routes.ts
│   │       │   ├── design.routes.ts
│   │       │   ├── order.routes.ts
│   │       │   ├── payment.routes.ts
│   │       │   └── product.routes.ts
│   │       ├── services/           # İş mantığı
│   │       │   ├── auth.service.ts
│   │       │   ├── design.service.ts
│   │       │   ├── order.service.ts
│   │       │   ├── payment.service.ts
│   │       │   └── product.service.ts
│   │       ├── lib/
│   │       │   ├── blockchain/registry.ts   # ethers.js + PrintChainRegistry
│   │       │   ├── payment/stripe.ts        # Stripe SDK wrapper
│   │       │   ├── storage/ipfs.ts          # Pinata IPFS
│   │       │   ├── storage/r2.ts            # Cloudflare R2 (sharp ile WebP)
│   │       │   ├── logger.ts                # Pino logger
│   │       │   └── responses.ts             # successResponse / errorResponse
│   │       ├── middleware/auth.ts   # JWT doğrulama middleware
│   │       └── prisma/
│   │           ├── schema.prisma
│   │           └── seed.ts
│   │
│   └── frontend/                   # Next.js 14 (port: 3000)
│       └── src/
│           ├── app/
│           │   ├── layout.tsx               # Root layout (QueryProvider içerir)
│           │   ├── page.tsx                 # Landing page
│           │   ├── (auth)/                  # Auth grup layout
│           │   │   ├── login/page.tsx
│           │   │   └── register/page.tsx
│           │   ├── (dashboard)/             # Korumalı dashboard
│           │   │   ├── brand/products/
│           │   │   ├── brand/analytics/
│           │   │   ├── designer/dashboard/
│           │   │   ├── designer/studio/     # Fabric.js canvas editörü
│           │   │   ├── designer/earnings/
│           │   │   └── customer/orders/
│           │   ├── discover/page.tsx        # Tasarım marketplace
│           │   ├── cart/page.tsx            # Sepet (Zustand)
│           │   ├── checkout/page.tsx        # Stripe Elements + MONAD
│           │   └── order-confirmation/[orderId]/
│           ├── components/
│           │   ├── Header.tsx               # Nav + auth state + rol bazlı linkler
│           │   └── DesignCanvas.tsx         # Fabric.js editör
│           ├── hooks/
│           │   ├── useAuth.ts               # Auth state + login/register
│           │   └── useApi.ts                # React Query hooks
│           ├── lib/
│           │   ├── query-provider.tsx       # React Query client
│           │   └── api.ts                   # Fetch wrapper (JWT header)
│           └── stores/
│               └── cart.store.ts            # Zustand sepet (localStorage persist)
│
├── packages/
│   └── smart-contracts/
│       ├── contracts/
│       │   ├── PrintChainRegistry.sol
│       │   └── RoyaltyDistributor.sol
│       └── scripts/deploy.ts
│
├── scripts/
│   ├── setup-env.sh
│   └── setup-env.bat
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## API Rotaları

Tüm rotalar `/api/v1` prefix'i ile başlar.

| Metot  | Endpoint                        | Açıklama                              | Auth      |
|--------|---------------------------------|---------------------------------------|-----------|
| POST   | /auth/register                  | Kayıt                                 | Yok       |
| POST   | /auth/login                     | Giriş (JWT döner)                     | Yok       |
| GET    | /products                       | Ürün şablonları listesi               | Yok       |
| POST   | /products                       | Ürün şablonu oluştur                  | BRAND     |
| GET    | /designs                        | Yayınlanmış tasarımlar                | Yok       |
| POST   | /designs                        | Tasarım oluştur (IPFS + blockchain)   | DESIGNER  |
| GET    | /designs/mine                   | Kendi tasarımlarım                    | DESIGNER  |
| PUT    | /designs/:id/publish            | Tasarımı yayınla                      | DESIGNER  |
| POST   | /orders                         | Sipariş oluştur                       | CUSTOMER  |
| GET    | /orders/mine                    | Kendi siparişlerim                    | CUSTOMER  |
| POST   | /orders/:id/cancel              | Sipariş iptal                         | CUSTOMER  |
| POST   | /payments/stripe/intent         | Stripe PaymentIntent oluştur          | Auth      |
| POST   | /payments/stripe/webhook        | Stripe webhook                        | Yok       |
| POST   | /payments/monad/verify          | MONAD ödeme doğrula                   | Auth      |

---

## Veritabanı Modelleri (Prisma)

```
User → Profile, Brand/Designer/Customer (rol bazlı)
Brand → Product[]
Designer → Design[]
Product → Design[]
Design → OrderItem[]
Order → OrderItem[], Payment
OrderItem → Design (snapshot ile)
Payment → Order
```

**Sipariş FSM:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
        ↘ CANCELLED (sadece PENDING/CONFIRMED)
                                           ↘ REFUNDED
```

---

## Tasarım Yayınlama Akışı

1. `POST /designs` (multipart form: file + metadata)
2. DesignService:
   - R2'ye yükle (sharp ile WebP'ye dönüştür)
   - IPFS'e pin'le (Pinata)
   - Blockchain'e kaydet (PrintChainRegistry)
   - DB'ye DRAFT olarak kaydet
3. `PUT /designs/:id/publish` → PUBLISHED

---

## Ödeme Akışı

**Stripe:**
1. `POST /payments/stripe/intent` → `clientSecret` döner
2. Frontend: `stripe.confirmCardPayment(clientSecret)`
3. Webhook: `payment_intent.succeeded` → sipariş CONFIRMED

**MONAD:**
1. Kullanıcı Monad Testnet'te tx gönderir
2. `POST /payments/monad/verify` (txHash ile)
3. Backend format doğrular, sipariş CONFIRMED

---

## Ortam Değişkenleri

Backend için root `.env.example`, frontend için `apps/frontend/.env.example` dosyasını kopyala.

**Kritik değişkenler:**
- `DATABASE_URL` - PostgreSQL bağlantısı
- `JWT_SECRET` - min 32 karakter
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `PINATA_API_KEY` + `PINATA_SECRET_KEY`
- `CLOUDFLARE_R2_*` - R2 depolama
- `MONAD_TESTNET_RPC` + `REGISTRY_CONTRACT_ADDRESS`
- `BACKEND_SIGNER_PRIVATE_KEY` - blockchain işlemler için

---

## Kod Kuralları

- TypeScript strict mod
- Fastify route'larında Zod şema doğrulama
- `successResponse()` / `errorResponse()` wrapper'ları kullan (lib/responses.ts)
- Servis sınıfları iş mantığını içerir, route handler'ları sadece istek/yanıt yönetir
- Frontend'de API çağrıları için `useApi.ts` React Query hook'larını kullan
- Auth durumu için `useAuth.ts` kullan, doğrudan localStorage'a erişme
- Sepet yönetimi için `useCartStore` Zustand store'u kullan

---

## Port Haritası

| Servis        | Port  |
|---------------|-------|
| Frontend      | 3000  |
| Backend       | 3001  |
| PostgreSQL     | 5432  |
| Redis         | 6379  |
| Elasticsearch | 9200  |
