@echo off
REM PrintChain Environment Setup Script for Windows
REM This script sets up environment variables for local development

echo.
echo 🔧 PrintChain Environment Setup
echo ================================
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
  echo 📝 Creating .env.local...
  (
    echo # Database
    echo DATABASE_URL=postgresql://printchain:printchain123@localhost:5432/printchain_db
    echo DB_USER=printchain
    echo DB_PASSWORD=printchain123
    echo DB_NAME=printchain_db
    echo DB_PORT=5432
    echo.
    echo # Redis
    echo REDIS_URL=redis://localhost:6379
    echo REDIS_PORT=6379
    echo.
    echo # Elasticsearch
    echo ELASTICSEARCH_URL=http://localhost:9200
    echo ELASTICSEARCH_PORT=9200
    echo.
    echo # JWT
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
    echo.
    echo # Stripe
    echo STRIPE_SECRET_KEY=sk_test_xxx
    echo NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
    echo.
    echo # Pinata ^(IPFS^)
    echo PINATA_API_KEY=your_pinata_api_key
    echo PINATA_API_SECRET=your_pinata_api_secret
    echo.
    echo # Cloudflare R2
    echo R2_ACCESS_KEY_ID=your_r2_access_key
    echo R2_SECRET_ACCESS_KEY=your_r2_secret_key
    echo R2_BUCKET_NAME=printchain-designs
    echo R2_ACCOUNT_ID=your_r2_account_id
    echo.
    echo # Blockchain
    echo MONAD_RPC_URL=https://testnet-rpc.monad.xyz
    echo MONAD_PRIVATE_KEY=your_monad_private_key
    echo PRINTCHAIN_REGISTRY_ADDRESS=0x
    echo ROYALTY_DISTRIBUTOR_ADDRESS=0x
    echo.
    echo # Frontend
    echo NEXT_PUBLIC_BASE_URL=http://localhost:3000
    echo NEXT_PUBLIC_API_URL=http://localhost:3001/api
    echo NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
    echo NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x
    echo NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x
    echo.
    echo # Node
    echo NODE_ENV=development
  ) > .env.local
  echo ✅ .env.local created!
)

REM Create frontend .env.local if it doesn't exist
if not exist apps\frontend\.env.local (
  echo 📝 Creating apps\frontend\.env.local...
  (
    echo NEXT_PUBLIC_BASE_URL=http://localhost:3000
    echo NEXT_PUBLIC_API_URL=http://localhost:3001/api
    echo NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
    echo NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
    echo NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x
    echo NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x
  ) > apps\frontend\.env.local
  echo ✅ Frontend .env.local created!
)

REM Create backend .env.local if it doesn't exist
if not exist apps\backend\.env.local (
  echo 📝 Creating apps\backend\.env.local...
  (
    echo NODE_ENV=development
    echo PORT=3001
    echo DATABASE_URL=postgresql://printchain:printchain123@localhost:5432/printchain_db
    echo REDIS_URL=redis://localhost:6379
    echo ELASTICSEARCH_URL=http://localhost:9200
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
    echo STRIPE_SECRET_KEY=sk_test_xxx
    echo PINATA_API_KEY=your_pinata_api_key
    echo PINATA_API_SECRET=your_pinata_api_secret
    echo R2_ACCESS_KEY_ID=your_r2_access_key
    echo R2_SECRET_ACCESS_KEY=your_r2_secret_key
    echo R2_BUCKET_NAME=printchain-designs
    echo R2_ACCOUNT_ID=your_r2_account_id
    echo MONAD_RPC_URL=https://testnet-rpc.monad.xyz
    echo PRINTCHAIN_REGISTRY_ADDRESS=0x
    echo ROYALTY_DISTRIBUTOR_ADDRESS=0x
  ) > apps\backend\.env.local
  echo ✅ Backend .env.local created!
)

echo.
echo 📋 Next steps:
echo 1. Update the .env files with your actual credentials:
echo    - Stripe keys
echo    - Pinata API keys
echo    - Cloudflare R2 credentials
echo    - Monad private key
echo    - Contract addresses ^(after deployment^)
echo.
echo 2. Start Docker services:
echo    docker-compose -f docker-compose.dev.yml up -d
echo.
echo 3. Install dependencies:
echo    pnpm install
echo.
echo 4. Run database migrations:
echo    pnpm -F @printchain/backend run migrate:dev
echo.
echo 5. Start development servers:
echo    pnpm dev
echo.
