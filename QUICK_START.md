# PrintChain Quick Start Guide

Complete guide to set up and run PrintChain locally or in production.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Setup](#docker-setup)
3. [Production Deployment](#production-deployment)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- Node.js 20+ ([download](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- Docker & Docker Compose ([download](https://www.docker.com/products/docker-desktop))
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/monadIzmir/OnChainFit.git
cd OnChainFit
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Setup Environment Variables

**Linux/macOS:**
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

**Windows:**
```bash
scripts\setup-env.bat
```

This creates `.env` files with template values. Edit them with your credentials:

**Key services to configure:**
- Stripe: Get keys from https://dashboard.stripe.com/
- Pinata: Create account at https://pinata.cloud/
- Cloudflare R2: Set up bucket at https://www.cloudflare.com/products/r2/
- Monad RPC: Use https://testnet-rpc.monad.xyz

### Step 4: Start Infrastructure

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Elasticsearch (port 9200)

**Verify services running:**
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Step 5: Initialize Database

```bash
pnpm -F @printchain/backend run migrate:dev
```

### Step 6: Start Development Servers

```bash
# Terminal 1: Backend API
pnpm -F @printchain/backend run dev

# Terminal 2: Frontend
pnpm -F @printchain/frontend run dev

# Terminal 3 (optional): Smart Contracts
pnpm -F @printchain/smart-contracts run node
```

**Access applications:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## Docker Setup

### Build Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker build -t printchain-frontend:latest ./apps/frontend
docker build -t printchain-backend:latest ./apps/backend
```

### Run Production Environment

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Save/Load Docker Images

```bash
# Save image to file
docker save printchain-backend:latest -o backend.tar

# Load image from file
docker load -i backend.tar
```

---

## Production Deployment

### Choose Deployment Platform

#### Option 1: Vercel (Frontend)

```bash
npm i -g vercel
cd apps/frontend
vercel --prod --build-env NODE_ENV=production
```

#### Option 2: Railway (Full Stack)

```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

#### Option 3: DigitalOcean (Full Stack)

1. Connect GitHub repo to DigitalOcean App Platform
2. Create app from Dockerfile
3. Configure environment variables
4. Deploy

#### Option 4: AWS (ECS/Fargate)

```bash
# Push to ECR
aws ecr create-repository --repository-name printchain

docker tag printchain-backend:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/printchain:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/printchain:latest

# Create ECS task and service
```

### Configure Domains & SSL

**Cloudflare:**
1. Add domain to Cloudflare
2. Update nameservers with your registrar
3. Enable SSL/TLS (Flexible or Full)
4. Configure DNS records

**Let's Encrypt:**
```bash
sudo certbot certonly --standalone -d api.printchain.io
sudo certbot renew --dry-run
```

### Database Setup

**Managed PostgreSQL (recommended):**
- AWS RDS PostgreSQL
- DigitalOcean Managed Database
- Azure Database for PostgreSQL

**Connection:**
```bash
# Update DATABASE_URL in .env.prod
DATABASE_URL=postgresql://user:password@dbhost:5432/printchain

# Run migrations
pnpm -F @printchain/backend run migrate:prod
```

---

## Smart Contract Deployment

### 1. Configure Monad Credentials

```env
MONAD_PRIVATE_KEY=0x...
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
```

### 2. Compile Contracts

```bash
pnpm -F @printchain/smart-contracts run compile
```

### 3. Deploy to Monad Testnet

```bash
pnpm -F @printchain/smart-contracts run deploy:monad
```

**Output includes:**
- PrintChainRegistry address
- RoyaltyDistributor address
- Deployment block number
- Verification link

### 4. Update Environment Variables

```env
PRINTCHAIN_REGISTRY_ADDRESS=0x...
ROYALTY_DISTRIBUTOR_ADDRESS=0x...
NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x...
```

### 5. Verify Contract (optional)

```bash
pnpm -F @printchain/smart-contracts run verify -- \
  --address 0x... \
  --network monad
```

---

## Environment Variables Reference

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ELASTICSEARCH_URL=http://...

# Authentication
JWT_SECRET=your-secret-key (min 32 chars)
JWT_EXPIRY=7d

# Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage (Pinata)
PINATA_API_KEY=...
PINATA_API_SECRET=...

# CDN (Cloudflare R2)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=printchain-prod
R2_ACCOUNT_ID=...

# Blockchain
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PRINTCHAIN_REGISTRY_ADDRESS=0x...
ROYALTY_DISTRIBUTOR_ADDRESS=0x...
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_BASE_URL=https://printchain.io
NEXT_PUBLIC_API_URL=https://api.printchain.io
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x...
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database
psql $DATABASE_URL -c "SELECT 1"

# Redis
redis-cli ping

# Frontend build
curl http://localhost:3000 -I | grep -i "content-type"
```

### Logs

```bash
# Docker logs
docker logs printchain_backend
docker logs -f printchain_backend --tail 100

# System logs
journalctl -u printchain-backend -f
```

### Backup Database

```bash
# Backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup_20240115.sql.gz | psql $DATABASE_URL
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Run migrations
pnpm -F @printchain/backend run migrate:prod

# Rebuild services
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Failed

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# View database logs
docker logs printchain_postgres
```

### Stripe Webhook Not Receiving

1. Get ngrok URL: `ngrok http 3001`
2. Update in Stripe dashboard: https://dashboard.stripe.com/webhooks
3. Endpoint: `https://YOUR_NGROK_URL/api/payments/stripe/webhook`

### Docker Out of Disk Space

```bash
# Cleanup old images
docker image prune -a

# Cleanup stopped containers
docker container prune

# Check disk usage
docker system df
```

### Memory Issues

```bash
# Container stats
docker stats

# Increase Docker memory limit
# Docker Desktop → Preferences → Resources → Memory
```

---

## Performance Optimization

### Frontend

```bash
# Analyze bundle size
pnpm -F @printchain/frontend run build --analyze

# Generate reports
pnpm -F @printchain/frontend build:profile
```

### Backend

```bash
# Database query analysis
EXPLAIN ANALYZE SELECT * FROM designs WHERE id = '...';

# Monitor performance
docker stats --no-stream
```

---

## Security Checklist

- [ ] Change default database password
- [ ] Set strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS/SSL
- [ ] Set CORS properly
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Use managed secrets (not in .env)
- [ ] Enable audit logging
- [ ] Backup database regularly
- [ ] Rotate API keys monthly

---

## Support & Resources

- **Documentation**: See [README.md](README.md)
- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **GitHub Issues**: https://github.com/monadIzmir/OnChainFit/issues
- **Discord**: [Community Link in README]

---

**Last Updated**: March 2026
**Version**: 1.0.0
