// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'customer@example.com')
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.click('button:has-text("Login")')
    await page.waitForURL('/customer/dashboard')
  })

  test('customer should be able to add design to cart', async ({ page }) => {
    // Navigate to discover page
    await page.goto('/discover')
    
    // Wait for designs to load
    await page.waitForSelector('[data-testid="design-card"]')
    
    // Click first design
    const firstDesign = page.locator('[data-testid="design-card"]').first()
    await firstDesign.click()
    
    // Add to cart
    await page.click('button:has-text("Add to Cart")')
    
    // Verify toast notification
    await expect(page.locator('text=Added to cart')).toBeVisible()
  })

  test('customer should be able to checkout with stripe', async ({ page }) => {
    // Add item to cart first
    await page.goto('/cart')
    
    // Verify cart items
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    
    // Click checkout
    await page.click('button:has-text("Checkout")')
    
    await page.waitForURL('/checkout')
    
    // Fill shipping address
    await page.fill('input[name="street"]', '123 Main St')
    await page.fill('input[name="city"]', 'New York')
    await page.fill('input[name="zipCode"]', '10001')
    
    // Select Stripe as payment method
    await page.click('label:has-text("Stripe")')
    
    // Continue to payment
    await page.click('button:has-text("Continue to Payment")')
    
    // Should redirect to payment page or Stripe form
    await expect(page).toHaveURL(/\/checkout|payment/)
  })

  test('customer should see order confirmation', async ({ page }) => {
    // Complete order (mocked payment)
    await page.goto('/checkout')
    
    // Fill and submit form
    await page.fill('input[name="street"]', '123 Main St')
    await page.fill('input[name="city"]', 'New York')
    await page.fill('input[name="zipCode"]', '10001')
    await page.click('label:has-text("Stripe")')
    await page.click('button:has-text("Complete Order")')
    
    // Should see confirmation
    await expect(page.locator('text=Order Confirmed')).toBeVisible()
    
    // Should have order number
    await expect(page.locator('[data-testid="order-number"]')).toContainText(/^ORD-/)
  })

  test('customer should see cart total updates', async ({ page }) => {
    await page.goto('/cart')
    
    // Get initial total
    const initialTotal = await page.locator('[data-testid="cart-total"]').textContent()
    
    // Increase quantity
    const quantityInput = page.locator('input[name="quantity"]').first()
    await quantityInput.fill('2')
    
    // Total should update
    const newTotal = await page.locator('[data-testid="cart-total"]').textContent()
    expect(newTotal).not.toBe(initialTotal)
  })
})
