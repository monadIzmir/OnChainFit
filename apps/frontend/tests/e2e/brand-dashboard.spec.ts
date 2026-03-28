// tests/e2e/brand-dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Brand Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as brand
    await page.goto('/login')
    await page.fill('input[name="email"]', 'brand@example.com')
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.click('button:has-text("Login")')
    await page.waitForURL('/brand/dashboard')
  })

  test('brand should view products', async ({ page }) => {
    await page.goto('/brand/dashboard')
    
    // Should see products list
    await expect(page.locator('[data-testid="products-section"]')).toBeVisible()
    
    // Should have at least one product card
    const productCards = page.locator('[data-testid="product-card"]')
    expect(await productCards.count()).toBeGreaterThanOrEqual(1)
  })

  test('brand should create new product', async ({ page }) => {
    await page.goto('/brand/products')
    
    // Click create new product
    await page.click('button:has-text("Create Product")')
    
    await page.waitForURL('/brand/products/new')
    
    // Fill form
    await page.fill('input[name="productName"]', 'New T-Shirt')
    await page.fill('input[name="basePrice"]', '25.99')
    await page.fill('textarea[name="description"]', 'Premium cotton t-shirt')
    
    // Select category
    await page.click('select[name="category"]')
    await page.click('option[value="APPAREL"]')
    
    // Upload template
    await page.setInputFiles('input[type="file"]', {
      name: 'template.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    })
    
    // Submit
    await page.click('button:has-text("Create Product")')
    
    // Should redirect to products list
    await page.waitForURL('/brand/products')
  })

  test('brand should view order statistics', async ({ page }) => {
    await page.goto('/brand/dashboard')
    
    // Should see analytics tiles
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-units"]')).toBeVisible()
    
    // Should see charts
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible()
  })
})
