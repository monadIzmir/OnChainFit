# Deployment Guide

This guide covers deploying PrintChain to production environments.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- pnpm package manager
- Access to external services:
  - PostgreSQL 16+ (or managed service)
  - Redis 7+ (or managed service)
  - Stripe account
  - Pinata API credentials
  - Cloudflare R2 bucket
  - Monad testnet RPC access

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/monadIzmir/OnChainFit.git
cd OnChainFit
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create `.env` file in root directory:

```bash
# Copy and customize the setup script
cp scripts/setup-env.sh .
chmod +x setup-env.sh
./setup-env.sh

# Then edit .env files with your credentials
```

Key environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx

# IPFS (Pinata)
PINATA_API_KEY=xxx
PINATA_API_SECRET=xxx

# Cloudflare R2
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=printchain-prod
```

## Local Deployment

### Development Environment

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
pnpm -F @printchain/backend run migrate:dev

# Start development servers
pnpm dev
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

## Docker Deployment

### Build Docker Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Build single service
docker build -t printchain-frontend:latest ./apps/frontend
docker build -t printchain-backend:latest ./apps/backend
```

### Run with Docker Compose

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Cloud Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL https://api.printchain.io
```

### Railway (Backend + Database)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up
```

### AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr create-repository --repository-name printchain-backend
docker tag printchain-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/printchain-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/printchain-backend:latest
```

Then create ECS services with the pushed images.

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Create App Specification (`app.yaml`):

```yaml
name: printchain
services:
- name: backend
  github:
    repo: monadIzmir/OnChainFit
    branch: main
  build_command: pnpm -F @printchain/backend run build
  run_command: node dist/app.js
  envs:
  - key: DATABASE_URL
    scope: RUN_AND_BUILD_TIME
    value: ${db.connection_string}
  - key: NODE_ENV
    value: production
  http_port: 3001

- name: frontend
  github:
    repo: monadIzmir/OnChainFit
    branch: main
  build_command: pnpm -F @printchain/frontend run build
  run_command: pnpm start
  envs:
  - key: NEXT_PUBLIC_API_URL
    value: https://api.printchain.io
  http_port: 3000

databases:
- name: db
  engine: PG
  version: "16"
  production: true
```

## Database Migrations

### Run Migrations

```bash
# Development
pnpm -F @printchain/backend run migrate:dev

# Production
pnpm -F @printchain/backend run migrate:prod

# Create new migration
pnpm -F @printchain/backend run migrate:create -- --name=migration_name
```

## Smart Contract Deployment

### Deploy to Monad Testnet

```bash
# Set up deployment credentials
export MONAD_PRIVATE_KEY=0x...
export MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Compile contracts
pnpm -F @printchain/smart-contracts run compile

# Deploy
pnpm -F @printchain/smart-contracts run deploy:monad

# Verify contract
pnpm -F @printchain/smart-contracts run verify -- --address 0x...
```

Contract addresses will be saved to `.env`.

## SSL/TLS Certificates

### With Let's Encrypt (Certbot)

```bash
sudo certbot certonly --standalone -d api.printchain.io -d printchain.io

# Auto-renew
sudo certbot renew --dry-run
```

### With Cloudflare

1. Enable Flexible SSL in Cloudflare dashboard
2. Set Page Rules with HTTPS redirect

## Monitoring & Logging

### Set Up Monitoring

```bash
# Install monitoring services
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# Install log aggregation
docker run -d \
  --name loki \
  -p 3100:3100 \
  grafana/loki

# Install visualization
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

### Application Logs

```bash
# Check Docker logs
docker logs printchain_backend

# Stream logs
docker logs -f printchain_backend

# With timestamps
docker logs --timestamps printchain_backend
```

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U printchain printchain_db > backup.sql

# With compression
pg_dump -U printchain printchain_db | gzip > backup.sql.gz

# Automated daily backup
0 2 * * * pg_dump -U printchain printchain_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Restore Database

```bash
# From SQL backup
psql -U printchain printchain_db < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | psql -U printchain printchain_db
```

## Security Checklist

- [ ] Change default database credentials
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database encryption
- [ ] Use managed secrets (not in .env)
- [ ] Rotate API keys regularly
- [ ] Enable audit logging
- [ ] Set up DDoS protection
- [ ] Configure rate limiting
- [ ] Enable CSRF protection

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs printchain_backend

# Rebuild image
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database connection errors

```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### High memory usage

```bash
# Check container stats
docker stats printchain_backend

# Adjust memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 2g
    mem_reservation: 1g
```

## Support

For deployment issues:
- Check logs: `docker logs <container_name>`
- GitHub Issues: https://github.com/monadIzmir/OnChainFit/issues
- Community Discord: https://discord.gg/printchain
