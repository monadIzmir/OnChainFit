# Contributing Guide

Thank you for contributing to PrintChain! This guide helps ensure code quality and consistency.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/OnChainFit.git
cd OnChainFit
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use branch naming convention:
- `feature/` - new feature
- `fix/` - bug fix
- `docs/` - documentation
- `refactor/` - code refactoring

### 3. Install & Setup

```bash
pnpm install
./scripts/setup-env.sh
docker-compose -f docker-compose.dev.yml up -d
pnpm -F @printchain/backend run migrate:dev
```

## Code Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  role: 'BRAND' | 'DESIGNER' | 'CUSTOMER'
}

function getUserById(id: string): Promise<User> {
  // implementation
}

// ❌ Bad
function getUserById(id) {
  // no types
}
```

### Naming Conventions

- Files: `camelCase` for utility files, `PascalCase` for components
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes: `PascalCase`
- Interfaces: `PascalCase` (prefix with `I` is optional)

### Error Handling

```typescript
// ✅ Good
try {
  const result = await designService.createDesign(data)
  return { success: true, data: result }
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: error.message } }
  }
  throw error
}

// ❌ Bad
try {
  return await designService.createDesign(data)
} catch (e) {
  console.log(e)
}
```

### Comments

```typescript
// ✅ Good - explain WHY, not WHAT
// Cache design for 5 mins to avoid repeated IPFS calls
const cachedDesign = await redis.get(`design:${id}`)

// ❌ Bad - obvious from code
// Get design from redis
const cachedDesign = await redis.get(`design:${id}`)
```

## Git Workflow

### Before Submitting PR

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Rebase feature branch
git checkout feature/your-feature
git rebase main

# 3. Run tests
pnpm test

# 4. Run linter
pnpm lint

# 5. Run type check
pnpm type-check
```

### Commit Messages

Follow Conventional Commits:

```
feat(auth): add email verification
^    ^     ^
|    |     └─ description
|    └─ scope
└─ type
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

```bash
# ✅ Good
git commit -m "feat(design): add fabric.js canvas editor

- Implement design canvas with add/remove/edit shapes
- Add color picker and text tools
- Integrate with IPFS for design saving"

# ❌ Bad
git commit -m "update files"
```

## Pull Request Process

### 1. Push to Fork

```bash
git push origin feature/your-feature
```

### 2. Create Pull Request

Include:
- **Title**: Clear, descriptive, following conventional commits
- **Description**: What changed and why
- **Screenshots**: For UI changes
- **Tests**: Link to test results
- **Closes**: `Closes #123` (if fixing an issue)

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## How to Test
Steps to verify the changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tested locally
```

### 4. Code Review

Reviewers may request changes. Update your PR:

```bash
git add .
git commit -m "refactor: address review comments"
git push origin feature/your-feature
```

## Testing

### Writing Tests

```typescript
// ✅ Good test structure
describe('DesignService.createDesign', () => {
  it('should create design with valid data', async () => {
    const input = { title: 'Test', productId: '123', salePrice: 25.99 }
    const result = await designService.createDesign(input)
    
    expect(result.id).toBeDefined()
    expect(result.status).toBe('DRAFT')
  })

  it('should throw error when price below base', async () => {
    const input = { title: 'Test', productId: '123', salePrice: 5 }
    
    await expect(designService.createDesign(input))
      .rejects
      .toThrow(PriceBelowBaseError)
  })
})
```

### Run Tests

```bash
# All tests
pnpm test

# Specific file
pnpm test design.service

# Coverage
pnpm test:coverage

# Watch mode
pnpm test --watch
```

## Documentation

### Update README

Changes affecting users? Update [README.md](README.md)

### API Changes

Update [API_DOCUMENTATION.md](API_DOCUMENTATION.md) with:
- New endpoints
- Changed parameters
- Removed endpoints
- Example requests/responses

### Code Comments

For complex logic:

```typescript
/**
 * Calculates royalty distribution to designer and brand
 * @param orderTotal - Total order amount in cents
 * @param platformFeeBps - Platform fee in basis points (800 = 8%)
 * @returns { designerShare, brandShare, platformFee }
 */
function calculateRoyalties(orderTotal: number, platformFeeBps: number) {
  const platformFee = (orderTotal * platformFeeBps) / 10000
  const remaining = orderTotal - platformFee
  return {
    platformFee,
    designerShare: remaining * 0.5, // 50% to designer
    brandShare: remaining * 0.5,    // 50% to brand
  }
}
```

## Architecture Guidelines

### Backend Services

Each service should:
- Have a single responsibility
- Include error handling
- Log important operations
- Include TypeScript types
- Have unit tests

```typescript
export class DesignService {
  constructor(
    private designRepository: DesignRepository,
    private ipfsClient: IPFSClient,
    private r2Client: R2Client,
    private registryClient: RegistryClient,
  ) {}

  async createDesign(data: CreateDesignInput): Promise<Design> {
    // validation
    // IPFS upload
    // R2 preview
    // blockchain register
    // database persist
  }
}
```

### Frontend Components

Keep components:
- Small and focused
- Reusable where possible
- Well-typed with TypeScript
- Accessible (ARIA labels, semantic HTML)

```typescript
// ✅ Good component
interface DesignCardProps {
  design: Design
  onAddToCart: (designId: string) => void
}

export function DesignCard({ design, onAddToCart }: DesignCardProps) {
  return (
    <article className="design-card">
      <img src={design.previewUrl} alt={design.title} />
      <h3>{design.title}</h3>
      <button onClick={() => onAddToCart(design.id)}>
        Add to Cart
      </button>
    </article>
  )
}
```

## Performance Guidelines

### Database

```typescript
// ✅ Use indexes for frequently queried fields
const design = await prisma.design.findFirst({
  where: { id: designId },
  include: { product: true, designer: true }, // eager load
})

// ❌ Avoid N+1 queries
designs.forEach(d => {
  const product = prisma.product.findUnique(...) // bad!
})
```

### API Responses

```typescript
// ✅ Return only needed fields
return {
  id: design.id,
  title: design.title,
  price: design.salePrice,
}

// ❌ Return everything
return design // includes large nested objects
```

### Frontend

```typescript
// ✅ Use React Query for data fetching
const { data } = useQuery(['designs'], () => fetchDesigns())

// ❌ Avoid unnecessary re-renders
const [designs, setDesigns] = useState()
useEffect(() => {
  fetchDesigns().then(setDesigns)
}, []) // missing dependencies
```

## Reporting Issues

Use GitHub Issues with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, etc.)
- Error logs/screenshots

## Getting Help

- GitHub Discussions: Questions and ideas
- GitHub Issues: Bug reports and features
- Discord: Real-time community support (link in README)

## Code of Conduct

- Be respectful and constructive
- Assume good intentions
- Report inappropriate behavior

Thank you for contributing! 🎉
