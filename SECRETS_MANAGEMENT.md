# Environment Variables & Secrets Management

Complete guide for managing environment variables and secrets in PrintChain.

## Development Environment

### Setup Script

**Linux/macOS:**
```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

**Windows:**
```batch
scripts\setup-env.bat
```

This creates `.env` files with placeholder values.

### Root `.env.local`

Location: `/.env.local`

```env
# Server Configuration
NODE_ENV=development
LOG_LEVEL=debug
PORT=3001

# Database
DATABASE_URL=postgresql://printchain:printchain123@localhost:5432/printchain_db
DB_USER=printchain
DB_PASSWORD=printchain123
DB_NAME=printchain_db
DB_PORT=5432

# Cache
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# Search
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_PORT=9200

# Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=dev-refresh-secret-key

# Payment Processing
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# IPFS Storage (Pinata)
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret
PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# CDN Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=printchain-dev
R2_ACCOUNT_ID=your_account_id
R2_PUBLIC_URL=https://r2.example.com

# Blockchain
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_PRIVATE_KEY=0xyour_private_key (dev only)
PRINTCHAIN_REGISTRY_ADDRESS=0x...
ROYALTY_DISTRIBUTOR_ADDRESS=0x...

# Email Service (optional)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@printchain.local

# Feature Flags
FEATURE_EMAIL_VERIFICATION=false
FEATURE_STRIPE_PAYMENTS=true
FEATURE_MONAD_PAYMENTS=false
```

### Backend `.env.local`

Location: `/apps/backend/.env.local`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://printchain:printchain123@localhost:5432/printchain_db
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
PINATA_API_KEY=xxx
PINATA_API_SECRET=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=printchain-dev
R2_ACCOUNT_ID=xxx
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PRINTCHAIN_REGISTRY_ADDRESS=0x...
ROYALTY_DISTRIBUTOR_ADDRESS=0x...
```

### Frontend `.env.local`

Location: `/apps/frontend/.env.local`

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxx
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_PRINTCHAIN_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS=0x...
```

## Production Environment

### Security Best Practices

✅ **DO:**
- Use managed secret services (AWS Secrets Manager, Vault)
- Rotate secrets every 90 days
- Use strong, randomly generated secrets
- Enable secret encryption at rest
- Audit secret access logs
- Use different secrets per environment
- Use environment-specific configurations

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode secrets in code
- Share secrets via email/Slack
- Use same secret across environments
- Log sensitive data
- Use weak/predictable secrets

### Production `.env`

Use environment variables via deployment platform or secrets manager:

```env
# Server
NODE_ENV=production
LOG_LEVEL=info
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@db.example.com:5432/printchain

# Cache
REDIS_URL=redis://redis.example.com:6379

# Search
ELASTICSEARCH_URL=https://elasticsearch.example.com

# Authentication
JWT_SECRET=VERY_LONG_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRY=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Pinata
PINATA_API_KEY=xxxxx
PINATA_API_SECRET=xxxxx

# Cloudflare R2
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=printchain-prod
R2_ACCOUNT_ID=xxxxx

# Blockchain
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_PRIVATE_KEY=0x... (for automated deployments only)
PRINTCHAIN_REGISTRY_ADDRESS=0x...
ROYALTY_DISTRIBUTOR_ADDRESS=0x...

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxxxx
SMTP_PASSWORD=xxxxx

# Feature Flags
FEATURE_EMAIL_VERIFICATION=true
FEATURE_STRIPE_PAYMENTS=true
FEATURE_MONAD_PAYMENTS=true
```

## Deployment Platforms

### AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name printchain/prod \
  --secret-string '{
    "DATABASE_URL": "postgresql://...",
    "JWT_SECRET": "...",
    "STRIPE_SECRET_KEY": "..."
  }'

# Retrieve secret
aws secretsmanager get-secret-value --secret-id printchain/prod

# Update secret
aws secretsmanager update-secret \
  --secret-id printchain/prod \
  --secret-string '{...}'
```

### DigitalOcean

In App Platform settings:
1. Go to Settings → Environment → Variables
2. Add secrets from GitHub:
   - Connect GitHub repository
   - Select branch
   - Add secrets on each deployment

### Vercel

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env prod <name> <value>
```

Or via dashboard:
1. Project Settings → Environment Variables
2. Add variable with scope (Development, Preview, Production)

### GitHub Actions Secrets

```bash
# Set secret
gh secret set SECRET_NAME --body "secret_value"

# List secrets
gh secret list

# Use in workflow
env:
  SECRET_NAME: ${{ secrets.SECRET_NAME }}
```

## Docker Environment Variables

### Via `.env` file

```bash
# Create .env file
echo "DATABASE_URL=postgresql://..." > .env

# Use in docker-compose
docker-compose --env-file .env up
```

### Via command line

```bash
docker run \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  printchain-backend:latest
```

### Via docker-compose

```yaml
services:
  backend:
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    env_file:
      - .env.prod
```

## Generating Secrets

### JWT Secret

```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online generator (development only)
# https://www.random.org/strings/
```

### Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy Secret Key (sk_live_...) and Publishable Key (pk_live_...)

### Pinata API Keys

1. Go to https://pinata.cloud/api-keys
2. Generate new API key
3. Copy API Key and Secret

### Cloudflare R2

1. Go to https://dash.cloudflare.com/
2. Cloudflare R2 → Settings
3. Generate new API token
4. Copy Access Key ID and Secret Access Key

## Migrating Secrets

### From .env to AWS Secrets Manager

```bash
#!/bin/bash
# load-secrets.sh

# Read .env file
export $(cat .env.prod | grep -v '#' | xargs)

# Create AWS secret
aws secretsmanager create-secret \
  --name printchain/prod \
  --secret-string "$(jq -n env | grep -E 'DATABASE_URL|JWT_SECRET|STRIPE' )"
```

### From Environment Variables to 1Password

```bash
# Export current environment
env > current-env.txt

# Upload to 1Password
op secret create --vault Private < current-env.txt

# Clean up
rm current-env.txt
```

## Audit & Monitoring

### View Secret Access Logs

```bash
# AWS CloudTrail
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=printchain/prod

# View in CloudWatch Logs
aws logs filter-log-events \
  --log-group-name /aws/secretsmanager/access \
  --filter-pattern "printchain"
```

### Rotate Secrets

```bash
#!/bin/bash
# rotate-secrets.sh

# Backup current secrets
aws secretsmanager backup-secret --secret-id printchain/prod > backup.json

# Generate new secrets
NEW_JWT_SECRET=$(openssl rand -base64 32)
NEW_STRIPE_KEY=$(...)

# Update secrets
aws secretsmanager update-secret \
  --secret-id printchain/prod \
  --secret-string "{
    \"JWT_SECRET\": \"$NEW_JWT_SECRET\",
    \"STRIPE_SECRET_KEY\": \"$NEW_STRIPE_KEY\"
  }"

# Notify team
echo "Secrets rotated. Update applications."
```

## Troubleshooting

### Secret Not Loading

```bash
# Check file exists
ls -la .env.local

# Check file permissions
chmod 600 .env.local

# Verify secret format
cat .env.local | grep SECRET_NAME

# Check Docker secret mounting
docker inspect <container> | grep Env
```

### Permission Denied

```bash
# Fix file permissions
chmod 600 .env.local

# Check user ownership
chown $USER .env.local

# Verify AWS IAM permissions
aws iam get-user-policy --user-name <user> --policy-name <policy>
```

### Secret Exposed

1. **Immediately rotate** the exposed secret
2. **Revoke** any API keys/credentials
3. **Audit logs** for unauthorized access
4. **Update** .gitignore to prevent future commits:
   ```
   .env*
   !.env.example
   secrets/
   *.pem
   ```

## References

- [Secrets Management Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Vault by HashiCorp](https://www.vaultproject.io/)
- [OWASP - Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

---

**Last Updated:** March 2026
