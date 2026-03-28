# Monitoring & Observability Guide

## Overview

Comprehensive monitoring, logging, and error tracking setup for PrintChain production environment.

**Components:**
- Error Tracking: Sentry
- Metrics & APM: DataDog or New Relic
- Logging: ELK Stack or Datadog Logs
- Health Checks: Custom endpoints

## Error Tracking with Sentry

### 1. Setup

```bash
# Install Sentry
npm install @sentry/node @sentry/tracing

# Install Next.js integration
npm install @sentry/nextjs
```

### 2. Backend Configuration

```typescript
// apps/backend/src/lib/sentry.ts
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import type { Env } from '../config/env'

export function initSentry(env: Env) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers
      }
      return event
    },
  })
}

// apps/backend/src/app.ts
import { initSentry } from './lib/sentry'

initSentry(env)

fastify.register(require('@fastify/helmet'), {
  contentSecurityPolicy: false,
})

// Add error tracking
fastify.setErrorHandler(async (error, request, reply) => {
  Sentry.captureException(error, {
    contexts: {
      fastify: {
        method: request.method,
        path: request.url,
        query: request.query,
      },
    },
  })

  reply.code(error.statusCode || 500).send({
    error: true,
    message: error.message,
    code: error.code,
  })
})
```

### 3. Frontend Configuration

```typescript
// apps/frontend/src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaySessionSampleRate: 0.1,
    replayOnErrorSampleRate: 1.0,
  })
}

// apps/frontend/src/app/layout.tsx
import { initSentry } from '@/lib/sentry'

initSentry()

export default function Layout() {
  // ... rest of layout
}
```

### 4. Custom Error Capture

```typescript
// src/hooks/useErrorHandler.ts
import * as Sentry from '@sentry/nextjs'

export function useErrorHandler() {
  return {
    captureException: (error: Error, context?: Record<string, any>) => {
      Sentry.captureException(error, { contexts: { custom: context } })
    },
    captureMessage: (message: string, level: Sentry.SeverityLevel = 'info') => {
      Sentry.captureMessage(message, level)
    },
  }
}
```

## Logging Strategy

### 1. Structured Logging (Backend)

```typescript
// src/lib/logger.ts
import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

export default logger

// Usage
logger.info({ userId: 'user-1', action: 'login' }, 'User logged in')
logger.error({ error }, 'Payment processing failed')
```

### 2. Log Aggregation

** Docker Compose logging configuration:**

```yaml
# docker-compose.prod.yml
services:
  backend:
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
        labels: 'app=backend'

  frontend:
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
        labels: 'app=frontend'
```

### 3. Application Logging

```typescript
// src/middleware/logging.ts
export async function loggingMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const start = performance.now()

  reply.addHook('onSend', async (request, reply, payload) => {
    const duration = performance.now() - start

    logger.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userId: request.user?.id,
      ip: request.ip,
    }, `${request.method} ${request.url}`)

    if (reply.statusCode >= 400) {
      logger.warn({
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
      }, 'Client error response')
    }

    return payload
  })
}
```

## Health Checks

### 1. Liveness Check

```typescript
// src/routes/health.ts
export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health/live', async (request, reply) => {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  })
}
```

### 2. Readiness Check

```typescript
// src/routes/health.ts
fastify.get('/health/ready', async (request, reply) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    elasticsearch: await checkElasticsearch(),
  }

  const allReady = Object.values(checks).every(v => v)

  return {
    ready: allReady,
    checks,
    timestamp: new Date().toISOString(),
  }
})

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

async function checkRedis() {
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}
```

### 3. Kubernetes Probes

```yaml
# kubernetes deployment.yaml
spec:
  containers:
    - name: backend
      livenessProbe:
        httpGet:
          path: /health/live
          port: 3001
        initialDelaySeconds: 30
        periodSeconds:  10
      readinessProbe:
        httpGet:
          path: /health/ready
          port: 3001
        initialDelaySeconds: 5
        periodSeconds: 5
```

## Metrics Collection

### 1. Application Metrics

```typescript
// src/lib/metrics.ts
import { Registry, Counter, Histogram } from 'prom-client'

const register = new Registry()

export const httpRequests = new Counter({
  registers: [register],
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

export const httpDuration = new Histogram({
  registers: [register],
  name: 'http_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
})

export const dbQueries = new Counter({
  registers: [register],
  name: 'db_queries_total',
  help: 'Total database queries',
  labelNames: ['operation', 'table'],
})

export const metricsRegistry = register
```

### 2. Metrics Endpoint

```typescript
// src/routes/metrics.ts
export async function metricsRoutes(fastify: FastifyInstance) {
  fastify.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', 'text/plain; version=0.0.4')
    return metricsRegistry.metrics()
  })
}
```

### 3. Track Metrics

```typescript
// src/middleware/metrics.ts
import { httpRequests, httpDuration } from '../lib/metrics'

export async function metricsMiddleware(request: FastifyRequest) {
  const start = performance.now()

  request.addHook('onResponse', (request, reply) => {
    const duration = (performance.now() - start) / 1000

    httpRequests.labels(
      request.method,
      request.route?.path || request.url,
      reply.statusCode
    ).inc()

    httpDuration.labels(
      request.method,
      request.route?.path || request.url
    ).observe(duration)
  })
}
```

## Alerting

### 1. Alert Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: High error rate detected

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_duration_seconds) > 1
        for: 5m
        annotations:
          summary: API latency is high

      - alert: DatabaseConectionDown
        expr: db_connections_active < 1
        for: 1m
        annotations:
          summary: Database connectivity issue
```

### 2. Notification Channels

```typescript
// Configure in Datadog/New Relic
{
  notifications: [
    {
      type: 'email',
      recipients: ['oncallteam@example.com'],
    },
    {
      type: 'slack',
      webhook: process.env.SLACK_WEBHOOK,
      channel: '#alerts',
    },
    {
      type: 'pagerduty',
      integrationKey: process.env.PAGERDUTY_KEY,
    },
  ],
}
```

## Performance Profiling

### 1. Node.js Profiling

```typescript
// apps/backend/src/lib/profiling.ts
import { startProfiling } from '@sentry/profiling-node'

export function initProfiling() {
  startProfiling()

  // Sample at 100Hz
  setInterval(() => {
    const profileSummary = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    }
    console.log(profileSummary)
  }, 10000)
}
```

### 2. Database Query Profiling

```typescript
// Enable in development
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Log slow queries
// src/lib/db.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log queries taking >1s
    console.warn(`Slow query: ${e.query} (${e.duration}ms)`)
  }
})
```

## Environment Setup

### .env.monitoring

```env
# Sentry
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Datadog (Optional alternative)
DATADOG_API_KEY=xxx
DATADOG_SITE=datadoghq.com

# Slack notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/yyy/zzz

# PagerDuty (Optional)
PAGERDUTY_KEY=xxx
```

## Monitoring Checklist

- [ ] Set up Sentry error tracking
- [ ] Configure structured logging
- [ ] Create health check endpoints
- [ ] Set up Prometheus metrics
- [ ] Configure alerting rules
- [ ] Enable profiling in dev
- [ ] Set up log aggregation
- [ ] Configure notification channels
- [ ] Create dashboards
- [ ] Set up on-call rotation

## Useful Links

- [Sentry Documentation](https://docs.sentry.io/)
- [Pino Logger](https://getpino.io/)
- [Prometheus Metrics](https://prometheus.io/)
- [DataDog APM](https://www.datadoghq.com/product/apm/)
- [New Relic](https://newrelic.com/)
- [ELK Stack](https://www.elastic.co/what-is/elk-stack)
