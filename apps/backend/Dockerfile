# Multi-stage build for Fastify backend
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build application
FROM base AS builder
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY src ./src
COPY tsconfig.json ./
RUN pnpm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

USER appuser

EXPOSE 3001
ENV PORT 3001

CMD ["node", "dist/app.js"]
