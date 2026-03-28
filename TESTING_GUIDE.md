# Testing Guide

## Overview

This document provides comprehensive testing guidelines for the PrintChain project across backend services, frontend components, and end-to-end scenarios.

**Target Coverage:** 80%+ across all layers
**Current Test Suites:** Backend (unit), Frontend (unit + component), E2E (Playwright)

## Backend Testing

### Unit Tests (Vitest)

Located in `apps/backend/tests/services/`

#### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/services/auth.service.test.ts

# Watch mode
npm run test -- --watch
```

#### Service Tests

1. **AuthService** (`auth.service.test.ts`)
   - ✅ User registration with duplicate detection
   - ✅ Login with password validation
   - ✅ Role-based access control
   - ✅ Web3 nonce generation

2. **ProductService** (`product.service.test.ts`)
   - ✅ Product creation with validation
   - ✅ Brand product fetching with pagination
   - ✅ Product details retrieval
   - ✅ Decimal price handling

3. **DesignService** (`design.service.test.ts`)
   - ✅ Design creation with price validation
   - ✅ IPFS upload integration
   - ✅ Blockchain registry integration
   - ✅ Design publishing with authorization

4. **OrderService** (`order.service.test.ts`)
   - ✅ Order creation from cart items
   - ✅ Total amount calculation
   - ✅ Order snapshot data
   - ✅ Design availability validation

5. **PaymentService** (`payment.service.test.ts`)
   - ✅ Stripe payment intent creation
   - ✅ Webhook handling (success/failure)
   - ✅ Payment status transitions
   - ✅ Refund processing

### Test Fixtures

Mock data is centralized in `tests/mocks/prisma.ts`:

```typescript
import { mockUserData, mockProductData, mockDesignData } from '../mocks/prisma'

// Use in tests
mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData)
```

### Integration Tests

For testing database interactions:

```bash
# Create test database
npm run db:migrate -- --name test

# Seed test data
npm run db:seed

# Run integration tests
npm run test -- tests/integration
```

## Frontend Testing

### Component Tests (Jest)

Located in `apps/frontend/tests/components/`

#### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test
npm run test -- Header.test.tsx

# Watch mode
npm run test -- --watch
```

#### Test Categories

1. **Hooks Tests** (`tests/hooks/`)
   - `useAuth.test.ts`: Authentication state management
   - `useCart.test.ts`: Shopping cart operations
   - `useLoadingStates.test.ts`: Async operation states

2. **Components Tests** (`tests/components/`)
   - `Header.test.tsx`: Navigation and user menu
   - `DesignCanvas.test.tsx`: Fabric.js editor integration
   - `ProductCard.test.tsx`: Product display

3. **Pages Tests** (`tests/pages/`)
   - `Login.test.tsx`: Authentication flow
   - `Checkout.test.tsx`: Payment flow
   - `Dashboard.test.tsx`: Role-based dashboards

### Mock Service Worker (MSW)

API mocking in `tests/setup.ts`:

```typescript
// Mock endpoints for testing
setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({ user: mock User, accessToken: 'token' }))
  })
)
```

## End-to-End Testing

### Playwright Tests

Located in `apps/frontend/tests/e2e/`

#### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- auth.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug

# Generate test report
npm run test:e2e -- --reporter=html
```

#### Test Suites

1. **Authentication** (`auth.spec.ts`)
   - User registration for different roles
   - Login and logout flows
   - Error handling for invalid credentials

2. **Checkout Flow** (`checkout.spec.ts`)
   - Adding designs to cart
   - Modifying quantities
   - Shipping address entry
   - Payment processing

3. **Design Studio** (`design-studio.spec.ts`)
   - Creating designs with canvas editor
   - Publishing designs
   - Editing existing designs
   - Analytics viewing

4. **Brand Dashboard** (`brand-dashboard.spec.ts`)
   - Viewing products
   - Creating new products
   - Viewing order statistics

### Playwright Configuration

`playwright.config.ts` settings:

```typescript
{
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 2, // On CI
  workers: 1,  // On CI
  screenshot: 'only-on-failure',
  trace: 'on-first-retry'
}
```

## Smart Contract Testing

### Solidity Tests (Hardhat)

Located in `packages/smart-contracts/test/`

#### Running Tests

```bash
cd packages/smart-contracts

# Run all tests
npm run test

# Run with gas report
npm run test -- --gas-report

# Run specific test
npm run test -- test/PrintChainRegistry.test.ts

# Coverage
npm run test:coverage
```

#### Test Files

1. **PrintChainRegistry.test.ts**
   - Design registration
   - Hash validation
   - Access control
   - Pause/unpause functionality

2. **RoyaltyDistributor.test.ts**
   - Payment distribution calculation
   - Pull payment pattern
   - Multi-recipient transfers
   - Fee calculation (8%)

### Integration Tests

Test contract interactions with backend:

```bash
npm run contracts:deploy -- --network monad_testnet
```

## CI/CD Pipeline

### GitHub Actions Tests

```yaml
# Backend tests
- name: Run backend tests
  run: npm run test -- apps/backend

# Frontend tests
- name: Run frontend tests
  run: npm run test -- apps/frontend

# E2E tests
- name: Run E2E tests
  run: npm run test:e2e

# Contract tests
- name: Run contract tests
  run: npm run test:contracts

# Coverage reports
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Coverage Goals

| Layer | Current | Target |
|-------|---------|--------|
| Backend Services | 85% | 90% |
| Frontend Components | 80% | 85% |
| E2E Critical Flows | 75% | 90% |
| Smart Contracts | 95% | 98% |

## Testing Best Practices

### 1. Test Organization

```
tests/
├── services/          # Service unit tests
├── hooks/            # Hook tests
├── components/       # Component unit tests
├── e2e/              # End-to-end scenarios
├── mocks/            # Shared mock data
└── setup.ts          # Test configuration
```

### 2. Test Naming

```typescript
// ✅ Good
describe('AuthService', () => {
  it('should create user with hashed password when registering')
  it('should throw error if user already exists')
})

// ❌ Avoid
describe('User', () => {
  it('works')
  it('test auth')
})
```

### 3. Test Structure (AAA Pattern)

```typescript
it('should login user with valid credentials', async () => {
  // Arrange
  mockPrisma.user.findUnique.mockResolvedValueOnce(mockUserData)

  // Act
  const result = await authService.loginUser('test@example.com', 'password')

  // Assert
  expect(result.user).toBeDefined()
})
```

### 4. Mocking External Dependencies

```typescript
// Mock external services
vi.mock('../../src/lib/storage/ipfs')
vi.mock('../../src/lib/payment/stripe')

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

### 5. Error Scenarios

```typescript
// Test both success and failure paths
describe('createOrder', () => {
  it('should create order successfully', async () => { /* ... */ })
  it('should throw if designs not found', async () => { /* ... */ })
  it('should validate shipping address', async () => { /* ... */ })
})
```

## Debugging Tests

### Backend (Vitest)

```bash
# Debug with Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run

# View test output
npm run test -- --reporter=verbose
```

### Frontend (Jest)

```bash
# Debug in VS Code
# 1. Add breakpoint in test
# 2. Run: npm run test -- --detectOpenHandles
# 3. Open chrome://inspect in Chrome
```

### E2E (Playwright)

```bash
# Debug mode with browser visible
npm run test:e2e -- --debug

# Generate video recordings
PLAYWRIGHT_VIDEO=on npm run test:e2e

# Step through code
page.pause() // Pauses execution in debug mode
```

## Common Issues & Solutions

### "Cannot find module" errors

```bash
# Rebuild
npm run build

# Clear cache
rm -rf node_modules/.cache
npm install
```

### Database connection errors

```bash
# Check database is running
docker-compose up -d postgres

# Verify connection string
echo $DATABASE_URL
```

### Flaky E2E tests

```typescript
// Add proper waits
await page.waitForSelector('[data-testid="element"]')
await page.waitForURL('/expected-path')
await page.waitForLoadState('networkidle')
```

## Adding New Tests

### For New Features

1. Write unit tests first (TDD)
2. Add component/hook tests
3. Add E2E test for user flow
4. Update coverage targets if needed

### Template

```typescript
// tests/services/feature.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { FeatureService } from '../../src/services/feature.service'
import { createMockPrismaClient } from '../mocks/prisma'

describe('FeatureService', () => {
  let service: FeatureService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = createMockPrismaClient()
    service = new FeatureService(mockPrisma)
  })

  it('should do something', async () => {
    // Arrange
    // Act
    // Assert
  })
})
```

## Test Reports

### Generate Coverage Report

```bash
# Backend
npm run test:coverage -- apps/backend

# Frontend
npm run test:coverage -- apps/frontend

# Open report
open coverage/index.html
```

### CI Report Links

Coverage reports are uploaded to Codecov after each CI run:
https://codecov.io/gh/monadIzmir/OnChainFit

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Jest Documentation](https://jestjs.io)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library Docs](https://testing-library.com)
- [MSW Documentation](https://mswjs.io)
