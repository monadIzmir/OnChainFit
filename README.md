# PrintChain

> Print-on-Demand platform met blockchain-powered royalty distribution. Markalar, tasarımcılar ve müşterileri bir araya getiren Web3 tabanlı e-ticaret platformu.

## 🎯 Proje Özeti

PrintChain, Koton, LCWaikiki gibi **markaların boş ürün şablonlarını** platforma yüklediği, **bağımsız tasarımcıların** bu ürünler üzerine tasarım oluşturup fiyat belirlediği, **müşterilerin** satın aldığı ve tüm gelir dağılımının **Monad Testnet akıllı kontratları** üzerinden otomatik yönetildiği bir platform.

### 👥 Kullanıcı Rolleri

- **🏷️ Marka (ROLE_BRAND)**: Ürün şablonu yükleme, taban fiyat belirleme, analitik
- **🎨 Tasarımcı (ROLE_DESIGNER)**: Tasarım oluşturma, fiyat belirleme, otomatik payout
- **🛒 Müşteri (ROLE_CUSTOMER)**: Ürün keşfetme, satın alma, sipariş takibi

## 🛠 Teknoloji Stack

### Frontend
- **Next.js 14** (App Router, RSC)
- **TypeScript** (strict mode)
- **Tailwind CSS + shadcn/ui**
- **Zustand + React Query**
- **Fabric.js** (Canvas mock-up editor)
- **wagmi v2 + viem** (Web3)

### Backend
- **Fastify** (microservice architecture)
- **TypeScript**
- **Prisma** (PostgreSQL ORM)
- **Redis** (cache, session, rate limit)
- **BullMQ** (job queue)
- **Elasticsearch** (search)

### Blockchain
- **Solidity ^0.8.24**
- **Hardhat** + Hardhat-deploy
- **OpenZeppelin Contracts**
- **Monad Testnet** (EVM compatible)

## 🚀 Hızlı Başlangıç

### Ön Koşullar
- Node.js 22+
- Docker & Docker Compose
- Git

### Kurulum

1. **Repository klonlama**
```bash
git clone https://github.com/monadIzmir/OnChainFit.git
cd OnChainFit
```

2. **Bağımlılıkları yükleme**
```bash
npm install
# veya pnpm install
```

3. **Çevresel değişkenleri ayarlama**
```bash
cp .env.example .env.local
# .env.local dosyasını edit edin
```

4. **Altyapı başlatma (Docker)**
```bash
docker-compose up -d
```

5. **Database migration**
```bash
npm run db:migrate
```

6. **Development server başlatma**
```bash
npm run dev
```

Erişim:
- Frontend: http://localhost:3000
- API: http://localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: localhost:9200

## 📁 Proje Yapısı

```
PrintChain/
├── apps/
│   ├── frontend/          # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── ...
│   └── backend/           # Fastify microservices
│       ├── src/
│       │   ├── services/  # Auth, Product, Design, Order, Payment, Shipping, Payout
│       │   ├── routes/
│       │   ├── hooks/
│       │   └── lib/
│       └── ...
├── packages/
│   ├── smart-contracts/   # Solidity contracts
│   │   ├── contracts/
│   │   │   ├── PrintChainRegistry.sol
│   │   │   └── RoyaltyDistributor.sol
│   │   ├── test/
│   │   ├── scripts/
│   │   └── hardhat.config.ts
│   └── types/             # Shared TypeScript types
├── docker-compose.yml
├── turbo.json
└── package.json
```

## 🔗 Akıllı Kontratlar

### Monad Testnet Deployment

```bash
# Hardhat config test et
npm run contracts:deploy

# Output:
# ✅ PrintChainRegistry deployed at: 0x...
# ✅ RoyaltyDistributor deployed at: 0x...
```

Kontrat adreslerini `.env.local` dosyasına kopyalayın.

## 📚 API Dokumentasyon

### Auth Service
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/web3/nonce
POST   /api/v1/auth/web3/verify
```

### Product Service
```
POST   /api/v1/products           [BRAND]
GET    /api/v1/products           [PUBLIC]
GET    /api/v1/products/:id       [PUBLIC]
```

### Design Service
```
POST   /api/v1/designs            [DESIGNER]
GET    /api/v1/designs            [PUBLIC]
GET    /api/v1/designs/mine       [DESIGNER]
PUT    /api/v1/designs/:id/price  [DESIGNER]
```

Detaylı dokumentasyon için [API Docs](./docs/API.md) bakınız.

## 🧪 Test

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage raporu
npm run test -- --coverage
```

## 📋 Geliştirme Yol Haritası

- ✅ **Faz 1 - MVP** (2 ay)
  - Kullanıcı authentication
  - Marka ürün yönetimi
  - Temel mock-up editörü
  - Stripe ödeme entegrasyonu
  
- ⏳ **Faz 2 - Otomasyon** (1.5 ay)
  - RoyaltyDistributor akıllı kontrat
  - IPFS entegrasyonu
  - Kargo API integration
  - Otomatik payout

- ⏳ **Faz 3 - Ölçeklendirme** (2 ay)
  - MONAD token ödeme
  - Gelişmiş arama
  - Analitik dashboard
  - PWA support

## 🔒 Güvenlik

- JWT + Web3 SIWE authentication
- Rate limiting (Kong Gateway)
- Input validation (Zod)
- File upload scanning
- Smart contract audit (Slither)
- GDPR compliance

## 📞 Destek

- GitHub Issues: [Issues](https://github.com/monadIzmir/OnChainFit/issues)
- Discussions: [Discussions](https://github.com/monadIzmir/OnChainFit/discussions)

## 📝 Lisans

MIT

---

**Monad Testnet RPC**: https://testnet-rpc.monad.xyz
