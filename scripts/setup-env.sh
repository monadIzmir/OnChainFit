#!/bin/bash

# PrintChain Environment Setup Script
# This script sets up environment variables for local development

set -e

echo "🔧 PrintChain Environment Setup"
echo "================================"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  cat > .env.local << 'EOF'
# Database
DATABASE_URL=postgresql://printchain:printchain123@localhost:5432/printchain_db
DB_USER=printchain
DB_PASSWORD=printchain123
DB_NAME=printchain_db
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_PORT=9200

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx

# Pinata (IPFS)
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret

# Cloudflare R2
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=printchain-designs
R2_ACCOUNT_ID=your_r2_account_id

# Blockchain
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_PRIVATE_KEY=your_monad_private_key
PRINTCHAIN_REGISTRY_ADDRESS=0x
ROYALTY_DISTRIBUTOR_ADDRESS=0x

# Frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x
NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x

# Node
NODE_ENV=development
EOF
  echo "✅ .env.local created!"
fi

# Create .env.local for frontend if it doesn't exist
if [ ! -f apps/frontend/.env.local ]; then
  echo "📝 Creating apps/frontend/.env.local..."
  cat > apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x
NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x
EOF
  echo "✅ Frontend .env.local created!"
fi

# Create .env.local for backend if it doesn't exist
if [ ! -f apps/backend/.env.local ]; then
  echo "📝 Creating apps/backend/.env.local..."
  cat > apps/backend/.env.local << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://printchain:printchain123@localhost:5432/printchain_db
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
STRIPE_SECRET_KEY=sk_test_xxx
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=printchain-designs
R2_ACCOUNT_ID=your_r2_account_id
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PRINTCHAIN_REGISTRY_ADDRESS=0x
ROYALTY_DISTRIBUTOR_ADDRESS=0x
EOF
  echo "✅ Backend .env.local created!"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update the .env files with your actual credentials:"
echo "   - Stripe keys"
echo "   - Pinata API keys"
echo "   - Cloudflare R2 credentials"
echo "   - Monad private key"
echo "   - Contract addresses (after deployment)"
echo ""
echo "2. Start Docker services:"
echo "   docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "3. Install dependencies:"
echo "   pnpm install"
echo ""
echo "4. Run database migrations:"
echo "   pnpm -F @printchain/backend run migrate:dev"
echo ""
echo "5. Start development servers:"
echo "   pnpm dev"
echo ""
