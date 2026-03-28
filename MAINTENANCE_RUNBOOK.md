# Operations & Maintenance Runbook

## Quick Reference

**Incident Severity Levels:**
- **P1 (Critical)**: Service down, data loss risk, security breach
- **P2 (High)**: Major feature not working, significant degradation  
- **P3 (Medium)**: Minor feature broken, workaround available
- **P4 (Low)**: UI glitch, documentation issue

**On-Call Escalation:**
- Level 1: Application Support (0-15 min)
- Level 2: DevOps/Backend Team (15-30 min)
- Level 3: Lead Engineer (30+ min)

---

## Database Troubleshooting

### Issue: High Database Latency

**Symptoms:** Slow API responses, timeouts

**Diagnosis:**

```bash
# 1. Check database connection
psql -h $DB_HOST -U $DB_USER -d printchain -c "SELECT 1;"

# 2. Check active connections
psql -x -c "SELECT * FROM pg_stat_activity WHERE datname = 'printchain';"

# 3. Check slow queries
psql -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 4. Check table sizes
psql -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

**Resolution:**

```bash
# Kill stuck connections (carefully!)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'printchain' AND pid != pg_backend_pid();

# Analyze and vacuum
VACUUM ANALYZE;

# Reindex if necessary
REINDEX DATABASE printchain;

# Check connection pool limits
# Edit docker-compose.prod.yml and increase connection_limit if needed
```

### Issue: Database Won't Start

**Symptoms:** "Connection refused", database container crashes

**Diagnosis:**

```bash
# Check container logs
docker logs printchain-postgres-1

# Check disk space
docker exec printchain-postgres-1 df -h

# Check PostgreSQL logs
docker exec printchain-postgres-1 tail -f /var/log/postgresql/postgresql.log
```

**Resolution:**

```bash
# Clean up old data
docker volume prune

# Restart database
docker-compose down postgres
docker-compose up -d postgres

# Restore from backup if needed
pg_restore -h localhost -U postgres -d printchain /path/to/backup.sql
```

---

## Redis Cache Issues

### Issue: Cache Not Working

**Symptoms:** High database load, repeated queries

**Diagnosis:**

```bash
# Check Redis connection
redis-cli -h $REDIS_HOST ping

# Check memory usage
redis-cli info memory

# Check key count
redis-cli dbsize

# List all keys (careful in production!)
redis-cli keys '*' | head -20
```

**Resolution:**

```bash
# Flush old cache
redis-cli FLUSHALL

# Check for memory leaks
redis-cli --bigkeys

# Restart Redis service
docker-compose restart redis

# Monitor in real-time
redis-cli monitor
```

---

## Payment Processing Issues

### Issue: Stripe Payment Failed

**Symptoms:** "Payment failed" error, order stuck

**Diagnosis:**

```bash
# Check Stripe logs
curl -u sk_test_xxx: https://api.stripe.com/v1/events?limit=10

# Check database for payment record
SELECT * FROM payments WHERE stripe_payment_intent_id = 'pi_xxx';

# Check order status
SELECT id, status, totalAmount FROM orders WHERE id = 'order-xxx';
```

**Resolution:**

```typescript
// Retry payment processing
const payment = await prisma.payment.findUnique({ where: { id: 'payment-1' } })
const intent = await stripe.paymentIntents.retrieve(payment.metadata.stripePiId)

if (intent.status === 'failed') {
  // Process refund
  await stripe.refunds.create({ payment_intent: intent.id })
  
  // Notify customer
  await emailService.sendPaymentFailed(order.customerId)
}
```

### Issue: Webhook Not Triggering

**Symptoms:** Payment succeeds but order not confirmed

**Diagnosis:**

```bash
# Check webhook endpoint
curl -X POST https://api.example.com/webhook/stripe \
  -H "content-type: application/json" \
  -d '{"type":"payment_intent.succeeded"}'

# Check Stripe webhook logs
# https://dashboard.stripe.com/webhooks

# Check application logs
grep "webhook" /var/log/app.log
```

**Resolution:**

```bash
# Resend webhook from Stripe dashboard
# Or manually process payment:
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "content-type: application/json" \
  -d '{"type":"payment_intent.succeeded", "data":{"object":{"metadata":{"orderId":"order-1"}}}}'
```

---

## Blockchain/Smart Contract Issues

### Issue: Design Registration Failed

**Symptoms:** Design created but not on blockchain

**Diagnosis:**

```bash
# Check transaction status
ethers -n monad_testnet --tx 0xabcd1234...

# Check contract state
hardhat console --network monad_testnet
> const registry = await ethers.getContractAt('PrintChainRegistry', '0x...')
> await registry.getDesign(1)
```

**Resolution:**

```bash
# Retry registration
const registry = new ethers.Contract(contractAddress, abi, provider)
const tx = await registry.registerDesign(ipfsHash, designerId)
await tx.wait()

# If contract is paused, unpause it:
const adminRegistry = registry.connect(adminSigner)
await adminRegistry.unpause()
```

---

## API & Backend Issues

### Issue: API Timeout/500 Errors

**Symptoms:** "Request timeout", 500 error responses

**Diagnosis:**

```bash
# Check API health
curl http://localhost:3001/health/live
curl http://localhost:3001/health/ready

# Check logs
docker logs printchain-backend-1 | tail -100

# Check resource usage
docker stats printchain-backend-1
```

**Resolution:**

```bash
# Restart backend service
docker-compose restart backend

# Check environment variables
docker exec printchain-backend-1 env | grep DATABASE_URL

# Check migrations are applied
npm run db:migrate -- deploy

# Scale up if needed (Kubernetes)
kubectl scale deployment printchain-backend --replicas=3
```

### Issue: High Memory Usage

**Symptoms:** Out of memory error, service crashes

**Diagnosis:**

```bash
# Check heap usage
docker exec printchain-backend-1 node --eval "console.log(process.memoryUsage())"

# Profile memory
node --prof app.js
node --prof-process processor.log > profile.txt

# Check for leaks
npm install clinic
clinic doctor -- node app.js
```

**Resolution:**

```bash
# Increase memory limit
docker-compose.prod.yml:
  backend:
    mem_limit: 1g  # Increase from 512m

# Optimize code
# - Remove circular dependencies
# - Implement proper caching
# - Clear unused objects

# Monitor with Clinic
npx clinic doctor -- npm run start
```

---

## Frontend Issues

### Issue: White Screen of Death

**Symptoms:** Blank page, no content

**Diagnosis:**

```bash
# Check browser console errors
# Open DevTools → Console → Check for JavaScript errors

# Check network tab
# Look for failed API requests

# Check Next.js build
npm run build

# Verify source maps
ls -la .next/static
```

**Resolution:**

```bash
# Clear browser cache
# Cmd+Shift+Delete (Chrome) or Ctrl+Shift+Delete (Firefox)

# Rebuild application
npm run build
npm run start

# Check for deployment issues
vercel logs --follow

# Rollback if needed
vercel rollback
```

### Issue: Design Editor Not Loading

**Symptoms:** Canvas is blank, Fabric.js not initialized

**Diagnosis:**

```javascript
// In browser console
console.log(window.fabric)
console.log(document.querySelector('[data-testid="fabric-canvas"]'))
```

**Resolution:**

```bash
# Clear service worker cache
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()))

# Check Canvas element exists
# Hard refresh: Cmd+Shift+R or Ctrl+F5

# Check Fabric.js bundle loaded
# DevTools → Network → Filter "fabric"
```

---

## Deployment Issues

### Issue: Deployment Fails

**Symptoms:** GitHub Actions failure, deployment blocked

**Diagnosis:**

```bash
# Check GitHub Actions logs
# https://github.com/monadIzmir/OnChainFit/actions

# Check deployment status
vercel deployments

# Check build logs locally
npm run build 2>&1 | tail -50
```

**Resolution:**

```bash
# Fix TypeScript errors
npm run type-check

# Fix linting errors
npm run lint -- --fix

# Run tests locally
npm run test

# If CI passes locally but fails on GitHub:
# - Check Node version in Actions
# - Clear GitHub Actions cache
# - Check secrets are set
```

### Issue: Secret Missing During Deployment

**Symptoms:** "Secret not found", deployment fails

**Resolution:**

```bash
# Set secret in GitHub
# GitHub Settings → Secrets and variables → Actions

# Or via GitHub CLI
gh secret set SECRET_NAME --body "secret_value"

# Verify it's set
gh secret list

# Re-run deployment
# GitHub Actions → Select failed job → Rerun
```

---

## Performance Degradation

### Issue: Slow Page Load

**Symptoms:** Pages take >3 seconds to load

**Diagnosis:**

```javascript
// In browser console
// Check Core Web Vitals
console.table({
  FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  LCP: performance.getEntriesByType('largest-contentful-paint').pop()?.renderTime,
  CLS: performance.getEntriesByType('layout-shift').reduce((s,e) => s + e.value, 0),
})

// Check slow resources
performance.getEntriesByType('resource')
  .filter(r => r.duration > 1000)
  .forEach(r => console.log(r.name, r.duration.toFixed(2), 'ms'))
```

**Resolution:**

1. Optimize images
   ```bash
   npx next-image-export-optimizer
   ```

2. Code split heavy components
   ```typescript
   const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false })
   ```

3. Cache API responses
   ```typescript
   useQuery({ queryKey: [...], staleTime: 300000 })
   ```

4. Analyze bundle
   ```bash
   npm run build -- --analyze
   ```

---

## Security Incidents

### Issue: SQL Injection Suspected

**Response:**

1. Isolate affected services (take offline if critical)
2. Check logs for unusual queries
3. Re-examine recent changes
4. Run security audit: `npm audit`
5. Verify Prisma escapes all inputs
6. Rotate database credentials
7. Notify security team

### Issue: Unauthorized Access

**Response:**

1. Check authentication logs
2. Review access control rules
3. Check JWT token validation
4. Verify role-based access enforcement
5. Audit recent permission changes
6. Reset user sessions if necessary

---

## Maintenance Tasks

### Daily (Automated)

```bash
# Backup database (cron: 0 2 * * *)
pg_dump printchain | gzip > /backups/printchain-$(date +%Y%m%d).sql.gz

# Monitor health checks (cron: */5 * * * *)
curl -f http://localhost:3001/health/live || alert
```

### Weekly

```bash
# Review error logs
grep ERROR /var/log/app.log | tail -100

# Check dependency updates
npm outdated

# Review database slow queries
psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Monthly

```bash
# Security audit
npm audit
npm audit fix

# Performance review
# Check Lighthouse scores
# Review Web Vitals
# Check APM traces

# Database maintenance
VACUUM ANALYZE;
REINDEX DATABASE printchain;

# Backup verification
pg_restore --list /backups/printchain-$(date -d 'last month' +%Y%m%d).sql.gz
```

### Quarterly

```bash
# Dependency updates
npm update

# Security scan
npm audit
gh secret list

# Disaster recovery drill
# Test backup restore process
# Verify failover procedures
```

---

## Useful Commands

```bash
# Database
psql -h $DB_HOST -U $DB_USER -d printchain
pg_dump printchain > backup.sql
pg_restore -d printchain < backup.sql

# Redis
redis-cli ping
redis-cli monitor
redis-cli flushall

# Docker
docker-compose ps
docker-compose logs -f backend
docker-compose restart postgres

# Git
git log --oneline -10
git diff prod main
git revert <commit>

# Performance
npm run test:coverage
npm run build -- --analyze
npm run lighthouse

# Deployment
npm run deploy:staging
npm run deploy:production
vercel rollback
```

---

## Contact & Escalation

**On-Call Schedule:** [Link to calendar]
**Incident Channel:** #incidents (Slack)
**Status Page:** https://status.example.com

**Team:**
- Backend Lead: @backend-lead
- Frontend Lead: @frontend-lead  
- DevOps: @devops-lead
- Product Manager: @product-manager
