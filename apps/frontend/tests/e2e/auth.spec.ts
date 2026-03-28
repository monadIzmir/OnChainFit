// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth tokens
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())
  })

  test('user should be able to register as customer', async ({ page }) => {
    await page.goto('/register')
    
    // Fill registration form
    await page.fill('input[name="email"]', `customer${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePassword123!')
    
    // Select customer role
    await page.click('label:has-text("Customer")')
    
    // Submit form
    await page.click('button:has-text("Register")')
    
    // Wait for redirect to dashboard
    await page.waitForURL('/customer/dashboard')
    expect(page.url()).toContain('/customer/dashboard')
  })

  test('user should be able to register as brand', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="email"]', `brand${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePassword123!')
    
    // Select brand role
    await page.click('label:has-text("Brand")')
    
    await page.click('button:has-text("Register")')
    await page.waitForURL('/brand/dashboard')
    expect(page.url()).toContain('/brand/dashboard')
  })

  test('user should be able to login', async ({ page }) => {
    // Assuming user already registered
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'SecurePassword123!')
    
    await page.click('button:has-text("Login")')
    
    // Should redirect to appropriate dashboard
    await page.waitForURL(/\/(customer|brand|designer)\/dashboard/)
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    
    await page.click('button:has-text("Login")')
    
    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })
})
