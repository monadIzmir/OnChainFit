# Performance Optimization Guide

## Overview

This document provides comprehensive performance optimization strategies for PrintChain across frontend, backend, and database layers.

**Current Baseline:**
- Frontend Lighthouse: 85 Performance
- Backend Response Time: <200ms (p99)
- Database Query Time: <50ms (p99)

**Targets:**
- Frontend Lighthouse: >95 Performance
- Backend Response Time: <100ms  (p99)
- Database Query Time: <25ms (p99)

## Frontend Performance

### 1. Code Splitting & Lazy Loading

```typescript
// src/app/studio/page.tsx - Dynamic import for heavy component
import dynamic from 'next/dynamic'

const DesignCanvas = dynamic(() => import('@/components/DesignCanvas'), {
  loading: () => <LoadingSkele ton className="w-full h-96" />,
  ssr: false, // Disable SSR for Fabric.js
})

export default function StudioPage() {
  return <DesignCanvas />
}
```

### 2. Image Optimization

Use Next.js Image component with automatic format conversion:

```typescript
import Image from 'next/image'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Image
      src={product.templateUrl}
      alt={product.name}
      width={300}
      height={300}
      priority={false} // Set true for above-fold images
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL={product.blurDataUrl} // Pre-computed blur hash
    />
  )
}
```

**Image Sizes Configuration:**

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { hostname: 'cdn.example.com' }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### 3. React Query Optimization

```typescript
// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes (was cacheTime)
    retry: 1,
    retryDelay: 1000,
  })
}
```

**Query Caching Strategy:**

| Resource | staleTime | gcTime | Rationale |
|----------|-----------|--------|-----------|
| Products | 10 min    | 30 min | Relatively static |
| Designs | 2 min     | 10 min | Changes frequently |
| User Profile | 5 min  | 20 min | Semi-static |
| Cart | 0 (always fresh) | 5 min | Must be current |

### 4. Bundle Size Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check which packages contribute most
npm run next-bundle-analysis

# View interactive treemap
npm run build && npm run bundle-report
```

**Next.js Bundle Configuration:**

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  swcMinify: true,
  compress: {
    level: 6,
  },
})
```

### 5. Font Optimization

```typescript
// src/app/layout.tsx
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent layout shift
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### 6. Prefetching & Preloading

```typescript
// src/components/ProductGrid.tsx
import Link from 'next/link'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          prefetch={true} // Prefetch route
        >
          <ProductCard product={product} />
        </Link>
      ))}
    </div>
  )
}
```

### 7. CSS-in-JS Optimization

Use Tailwind CSS v4 with JIT compilation:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
  // Enable CSS minification
  minify: true,
}
```

### 8. Web Vitals Monitoring

```typescript
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals() {
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
}

// src/app/layout.tsx
useEffect(() => {
  reportWebVitals()
}, [])
```

## Backend Performance

### 1. Database Query Optimization

**Add Query Indexes:**

```prisma
// prisma/schema.prisma
model Design {
  id          String    @id
  creatorId   String
  productId   String
  status      DesignStatus
  createdAt   DateTime  @default(now())
  
  @@index([creatorId, status]) // Composite index for filtering
  @@index([productId])
  @@index([createdAt])
}

model Order {
  id          String    @id
  customerId  String
  status      OrderStatus
  createdAt   DateTime
  
  @@index([customerId, status])
  @@index([createdAt])
}
```

**Optimize Queries:**

```typescript
// src/services/design.service.ts
async getPublishedDesigns(productId: string) {
  return await this.prisma.design.findMany({
    where: { productId, status: 'PUBLISHED' },
    select: { // Only select needed fields
      id: true,
      title: true,
      previewUrl: true,
      salePrice: true,
    },
    skip: 0,
    take: 20,
  })
}
```

### 2. Connection Pooling

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Connection Pool Configuration:**

```env
DATABASE_URL="postgresql://user:password@host/db?connection_limit=10&pool_timeout=10"
```

### 3. Redis Caching Strategy

```typescript
// src/services/cache.service.ts
export class CacheService {
  constructor(private redis: RedisClient) {}

  async getOrSet<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.redis.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    // Cache miss - fetch and store
    const data = await fetchFn()
    await this.redis.setex(key, ttl, JSON.stringify(data))
    return data
  }
}
```

**Caching Patterns:**

| Resource | TTL | Cache Strategy |
|----------|-----|-----------------|
| Product List | 30 min | Serve-stale + background refresh |
| Design Details | 5 min | Invalidate on update |
| User Data | 10 min | Invalidate on login/logout |
| Search Results | 2 min | Separate cache per query |

### 4. Request Compression

```typescript
// src/app.ts - Fastify setup
import compress from '@fastify/compress'

fastify.register(compress, {
  threshold: 1024, // Compress responses >1KB
})
```

### 5. Rate Limiting & Throttling

```typescript
// src/middleware/rateLimit.ts
import { RateLimitStore, RateLimitSkip, createRateLimitMiddleware } from 'fastify-rate-limit'

fastify.register(require('@fastify/rate-limit'), {
  max: 100, // Max 100 requests
  timeWindow: '15 minutes',
  cache: 10000,
})
```

### 6. Batch Processing

```typescript
// src/services/order.service.ts
async processOrderBatch(orderIds: string[]) {
  // Process multiple orders in single query
  return await this.prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { status: 'PROCESSING' },
  })
}
```

## Database Performance

### 1. Query Explain Analysis

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT d.id, d.title, COUNT(o.id) as sales
FROM designs d
LEFT JOIN order_items oi ON d.id = oi.designId
LEFT JOIN orders o ON oi.designId = o.designId
GROUP BY d.id
ORDER BY sales DESC;
```

### 2. Vacuum & Analyze

```sql
-- PostgreSQL maintenance
VACUUM ANALYZE;

-- Reindex tables
REINDEX TABLE designs;
REINDEX TABLE orders;
```

### 3. Partitioning Large Tables

```sql
-- Partition orders table by date
CREATE TABLE orders_2024 PARTITION OF orders
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## Monitoring Performance

### 1. Frontend Monitoring

```typescript
// src/lib/monitoring.ts
export async function trackPerformance() {
  const metrics = {
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcp: performance.getEntriesByType('largest-contentful-paint').pop()?.renderTime,
    fid: performance.getEntriesByType('first-input').pop()?.processingDuration,
  }

  // Send to analytics
  fetch('/api/metrics', { method: 'POST', body: JSON.stringify(metrics) })
}
```

### 2. Backend Monitoring

```typescript
// src/middleware/metrics.ts
fastify.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now()
})

fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - request.startTime
  console.log(`[${request.method}] ${request.path} - ${duration}ms`)
})
```

## Performance Checklist

- [ ] Implement code splitting
- [ ] Optimize images with WebP format
- [ ] Configure React Query caching
- [ ] Add database indexes
- [ ] Set up Redis caching
- [ ] Enable gzip compression
- [ ] Implement rate limiting
- [ ] Monitor Core Web Vitals
- [ ] Analyze bundle size
- [ ] Set up performance alerts

## Tools

- **Lighthouse**: Built-in Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org
- **Bundle Analyzer**: @next/bundle-analyzer
- **DataDog/New Relic**: APM & monitoring
- **GTmetrix**: Performance analysis
- **Sentry**: Error tracking & performance
