# SETUP_GUIDE.md

# PrintChain Setup Guide

Bu rehber, PrintChain projesini yerel ortamında kurmanız ve çalıştırmanız için adım adım talimatlar sunar.

## 📋 Ön Koşullar

- Node.js 22+ ([indir](https://nodejs.org/))
- Docker & Docker Compose ([indir](https://www.docker.com/))
- Git
- Solidity bilgisi (opsiyonel)
- MetaMask veya uyumlu Web3 cüzdanı

## 🚀 Adım 1: Repository Kurulumu

```bash
# Repository'yi klonla
git clone https://github.com/monadIzmir/OnChainFit.git
cd OnChainFit

# Bağımlılıkları yükle (root level, tüm workspace'ler için)
npm install
```

## 🐳 Adım 2: Docker Altyapısı Başlat

```bash
# PostgreSQL, Redis, Elasticsearch başlat
docker-compose up -d

# Kontrol et
docker-compose ps
```

Çıktı:
```
CONTAINER ID   IMAGE                    STATUS
...            postgres:16-alpine       Up 2 minutes
...            redis:7-alpine           Up 2 minutes
...            elasticsearch:8.11.0     Up 2 minutes
```

## 🗄️ Adım 3: Database Migrasyonu

```bash
# Backend klasörüne git
cd apps/backend

# Prisma migrations çalıştır
npm run db:migrate

# (Opsiyonel) Seed data yükle
npm run db:seed

cd ../..
```

## 📦 Adım 4: Environment Dosyalarını Ayarla

```bash
# .env.local dosyasını oluştur (root'ta)
cp .env.example .env.local

# .env.local dosyasını edit et ve değerleri doldur:
# - JWT_SECRET (minimum 32 karakter)
# - BACKEND_SIGNER_PRIVATE_KEY (Monad testnet signer)
# - Stripe / Cloudflare R2 / Pinata credentials
```

## 🧱 Adım 5: Smart Contracts Deploy Et

```bash
cd packages/smart-contracts

# Hardhat nodes'unu test et
npm run compile

# Monad testnet'te deploy et
npm run deploy

# Output:
# ✅ PrintChainRegistry deployed at: 0x...
# ✅ RoyaltyDistributor deployed at: 0x...

# Kontrat adreslerini .env.local'e kopyala:
# REGISTRY_CONTRACT_ADDRESS=0x...
# DISTRIBUTOR_CONTRACT_ADDRESS=0x...

cd ../..
```

Monad Testnet Faucet'ten token isteyin:
- https://testnet-faucet.monad.xyz/

## 🎯 Adım 6: Backend Sunucusunu Başlat

```bash
cd apps/backend

# Development modunda çalıştır (watch mode)
npm run dev

# Output:
# 🚀 Server running at http://localhost:4000
```

Farklı terminalden API test et:
```bash
curl http://localhost:4000/health
# Response: { "status": "ok" }
```

## 🎨 Adım 7: Frontend Sunucusunu Başlat

Yeni terminalden:

```bash
cd apps/frontend

# Development modunda başlat
npm run dev

# Output:
# ▲ Next.js 14.1.0
# - Local:        http://localhost:3000
```

Tarayıcı: **http://localhost:3000**

## 🧪 Adım 8: Testleri Çalıştır

### Backend Testleri
```bash
cd apps/backend
npm run test
```

### Smart Contract Testleri
```bash
cd packages/smart-contracts
npm run test
```

### Frontend Testleri
```bash
cd apps/frontend
npm run test
npm run test:e2e  # Playwright E2E tests
```

## 📍 Endpoint'ler

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/auth/register` | Kayıt ol |
| POST | `/api/v1/auth/login` | Giriş yap |
| POST | `/api/v1/auth/web3/nonce` | Web3 nonce |
| POST | `/api/v1/auth/web3/verify` | SIWE doğrula |

### Products
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/products` | Ürün oluştur (BRAND) |
| GET | `/api/v1/products` | Ürün listele |
| GET | `/api/v1/products/:id` | Ürün detayı |
| PUT | `/api/v1/products/:id` | Ürün güncelle (BRAND) |
| DELETE | `/api/v1/products/:id` | Ürün sil (BRAND) |

### Designs
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/designs` | Tasarım oluştur (DESIGNER) |
| GET | `/api/v1/designs` | Tasarım listele |
| GET | `/api/v1/designs/mine` | Kendi tasarımlarım (DESIGNER) |
| PUT | `/api/v1/designs/:id/price` | Fiyat güncelle (DESIGNER) |

## 🔍 Hata Giderme

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Çözüm:
docker-compose up -d postgres
```

### Port Zaten Kullanımda
```
Error: listen EADDRINUSE :::3000

Çözüm:
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### Kontrat Deployment Hatası
```
Error: Missing MONAD_TESTNET_RPC

Çözüm:
- .env.local dosyasında MONAD_TESTNET_RPC ayarlanması gerek
- BACKEND_SIGNER_PRIVATE_KEY geçerli olmalı (0x başlamalı)
```

## 📚 Faydalı Komutlar

```bash
# Root'tan tüm workspace'leri build et
npm run build

# Linting (tüm paketler)
npm run lint

# Tüm testleri çalıştır
npm run test

# Database reset
cd apps/backend && npx prisma migrate reset

# Hardhat node'u çalıştır (fork test için)
cd packages/smart-contracts && npm run node:local
```

## 🚢 Production Deploy

### Backend (Kubernetes)
```bash
# Docker image build
docker build -t printchain-backend:latest apps/backend/

# ECR'a push (AWS example)
aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_ECR_URL
docker tag printchain-backend:latest $AWS_ECR_URL/printchain-backend:latest
docker push $AWS_ECR_URL/printchain-backend:latest
```

### Frontend (Vercel)
```bash
# Vercel CLI ile deploy
npm i -g vercel
vercel deploy apps/frontend/
```

## 📞 Destek

- GitHub Issues: [Issues](https://github.com/monadIzmir/OnChainFit/issues)
- Discussions: [Discussions](https://github.com/monadIzmir/OnChainFit/discussions)
- Email: support@printchain.io

---

**Son Güncelleme**: March 2024
