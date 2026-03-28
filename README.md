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
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Git

### Development Kurulumu

👉 **[Detailed Quick Start Guide](QUICK_START.md)** - Adım adım rehber

**Kısa kurulum:**
```bash
git clone https://github.com/monadIzmir/OnChainFit.git
cd OnChainFit

pnpm install

# Linux/macOS
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh

# Windows
scripts\setup-env.bat

docker-compose -f docker-compose.dev.yml up -d
pnpm -F @printchain/backend run migrate:dev

pnpm dev
```

**Erişim:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Elasticsearch: localhost:9200

### Production Deployment

👉 **[Complete Deployment Guide](DEPLOYMENT_GUIDE.md)** - Cloud deployment

Hızlı deployment:
```bash
# Docker production build
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to Vercel/Railway/AWS/DigitalOcean
```

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

## 📚 Dokümantasyon

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - 5-minute local setup
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed environment configuration

### Development
- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow & code standards
- **[API Documentation](API_DOCUMENTATION.md)** - 20+ endpoints with examples
- **[Testing Guide](TESTING_GUIDE.md)** - Unit, component, E2E testing (NEW)

### Operations & Performance
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to Vercel/Railway/AWS/DigitalOcean
- **[Performance Optimization](PERFORMANCE_OPTIMIZATION.md)** - Frontend/backend optimization (NEW)
- **[Monitoring & Observability](MONITORING_OBSERVABILITY.md)** - Sentry/logging/metrics setup (NEW)
- **[Maintenance Runbook](MAINTENANCE_RUNBOOK.md)** - Operations procedures (NEW)

### Secrets & Configuration
- **[Secrets Management](SECRETS_MANAGEMENT.md)** - Environment variable setup & rotation

### Project Status
- **[Phase 12 Completion](PHASE_12_COMPLETION.md)** - Final testing & polishing summary (NEW)

## 🚀 API Endpoints

### Auth Service
```
POST   /auth/register
POST   /auth/login
POST   /auth/web3/nonce
POST   /auth/web3/verify
```

### Product Service (Brand)
```
POST   /products           Create product template
GET    /products           List all products
GET    /products/:id       Get product details
PUT    /products/:id       Update product
DELETE /products/:id       Delete product
```

### Design Service (Designer)
```
POST   /designs            Create design with Fabric.js
GET    /designs            Buy designs (public)
GET    /designs/mine       My designs
GET    /designs/:id        Design details
PUT    /designs/:id/price  Update design price
PUT    /designs/:id/publish Publish design
DELETE /designs/:id        Delete design
```

### Orders Service (Customer)
```
POST   /orders             Create order
GET    /orders/mine        My orders
GET    /orders/:id         Order details
POST   /orders/:id/cancel  Cancel order
```

### Payments Service
```
POST   /payments/stripe/intent         Create Stripe payment intent
POST   /payments/stripe/webhook        Handle Stripe webhooks
POST   /payments/monad/verify          Verify MONAD token payment
GET    /payments/:orderId              Get payment status
```

## 🧪 Test

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage raporu
pnpm test -- --coverage

# Backend specific
pnpm -F @printchain/backend run test

# Frontend specific
pnpm -F @printchain/frontend run test
```

## 🔄 CI/CD Pipelines

GitHub Actions workflows otomatik olarak tetiklenir:

- **Frontend**: `.github/workflows/frontend.yml`
  - Lint, format check, build test
  - Docker image build & push
  - Staging deployment

- **Backend**: `.github/workflows/backend.yml`
  - Lint, format check, build test
  - Database migration test
  - Docker image build & push
  - Staging deployment

- **Smart Contracts**: `.github/workflows/contracts.yml`
  - Solidity lint & format
  - Hardhat compile & test
  - Slither security analysis
  - Monad testnet deployment

## 🐳 Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Push to registry
docker tag printchain-backend:latest your-registry/printchain-backend:latest
docker push your-registry/printchain-backend:latest
```

## 🔗 Blockchain Integration

### Smart Contracts

```bash
# Compile
pnpm -F @printchain/smart-contracts run compile

# Test
pnpm -F @printchain/smart-contracts run test

# Deploy to Monad testnet
pnpm -F @printchain/smart-contracts run deploy:monad

# Verify contract
pnpm -F @printchain/smart-contracts run verify:monad
```

### Contracts

- **PrintChainRegistry.sol**: Design registration dengan IPFS hash
- **RoyaltyDistributor.sol**: Otomatik payment distribution dengan pull-payment pattern

Monad RPC: https://testnet-rpc.monad.xyz

## 📋 İş Yol Haritası

### ✅ MVP Tamamlandı (Faz 1)
- ✅ Kullanıcı authentication (Email + Web3 SIWE)
- ✅ Marka ürün şablonu yönetimi
- ✅ Tasarımcı tasarım studio (Fabric.js)
- ✅ IPFS + Cloudflare R2 storage
- ✅ Stripe ödeme entegrasyonu
- ✅ Blockchain registry (Monad Testnet)
- ✅ Role-based dashboard UI
- ✅ API documentation

### ⏳ Faz 2 - Otomasyon (Planlanan)
- Otomatik royalty distribution
- Kargo API integration
- Payout sistem
- Email notifications
- Advanced analytics
- Search optimization

### ⏳ Faz 3 - Ölçeklendirme (Planlanan)
- MONAD token ödeme
- Multi-language support
- PWA mobile app
- Social features
- Community marketplace

## 🔒 Güvenlik

- ✅ JWT Authentication + Web3 SIWE
- ✅ Rate limiting & DDoS protection
- ✅ Input validation (Zod schema)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Smart contract security (Slither analysis)
- ✅ Environment variable encryption
- ✅ Helmet.js security headers

**Security Best Practices:**
- Rotate API keys monthly
- Use managed secrets (not in .env)
- Enable HTTPS/SSL
- Regular security audits
- Follow OWASP Top 10

## 🤝 Contributing

Katkı yapmak isterseniz [Contributing Guide](CONTRIBUTING.md) okuyun.

```bash
# 1. Fork repository
git clone https://github.com/YOUR_USERNAME/OnChainFit.git
git checkout -b feature/your-feature

# 2. Make changes & test
pnpm lint
pnpm test

# 3. Create pull request
git push origin feature/your-feature
```

**Code Standards:**
- TypeScript (strict mode)
- Conventional commits
- Unit tests required
- Prettier formatting
- ESLint rules

## 📞 Destek & İletişim

- **GitHub Issues**: [Issues](https://github.com/monadIzmir/OnChainFit/issues)
- **GitHub Discussions**: [Discussions](https://github.com/monadIzmir/OnChainFit/discussions)
- **Email**: support@printchain.io
- **Discord**: [Community Server]

## 📄 Lisans

MIT License - See [LICENSE](LICENSE) file

## 🙏 Teşekkürler

- Monad team for testnet infrastructure
- Fabric.js community
- OpenZeppelin Contracts
- All contributors & supporters

---

**Status:** 🟢 MVP Complete - Production Ready

**Last Updated:** March 2026 | **Version:** 1.0.0

**Monad Testnet RPC:** https://testnet-rpc.monad.xyz
