// tests/e2e/design-studio.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Design Studio Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as designer
    await page.goto('/login')
    await page.fill('input[name="email"]', 'designer@example.com')
    await page.fill('input[name="password"]', 'SecurePassword123!')
    await page.click('button:has-text("Login")')
    await page.waitForURL('/designer/dashboard')
  })

  test('designer should be able to create and save design', async ({ page }) => {
    // Navigate to studio
    await page.goto('/designer/studio')
    
    // Wait for canvas to load
    await page.waitForSelector('[data-testid="fabric-canvas"]')
    
    // Add text
    await page.click('button[aria-label="Add Text"]')
    await page.fill('input[placeholder="Enter text"]', 'My Design')
    
    // Add shape
    await page.click('button[aria-label="Add Shape"]')
    await page.click('button:has-text("Circle")')
    
    // Save design
    await page.fill('input[name="title"]', 'Test Design')
    await page.fill('input[name="salePrice"]', '49.99')
    await page.click('button:has-text("Save Design")')
    
    // Should see success message
    await expect(page.locator('text=Design saved')).toBeVisible()
  })

  test('designer should be able to publish design', async ({ page }) => {
    await page.goto('/designer/dashboard')
    
    // Find draft design
    const draftDesign = page.locator('[data-testid="design-card"]:has-text("DRAFT")').first()
    await draftDesign.click()
    
    // Click publish button
    await page.click('button:has-text("Publish")')
    
    // Confirm
    await page.click('button:has-text("Confirm Publish")')
    
    // Should see published status
    await expect(page.locator('text=Published')).toBeVisible()
  })

  test('designer should be able to edit design', async ({ page }) => {
    await page.goto('/designer/dashboard')
    
    // Click edit button on design
    const editButton = page.locator('button:has-text("Edit")').first()
    await editButton.click()
    
    await page.waitForSelector('[data-testid="fabric-canvas"]')
    
    // Make changes
    await page.click('button[aria-label="Add Text"]')
    await page.fill('input[placeholder="Enter text"]', 'Updated')
    
    // Save
    await page.click('button:has-text("Save Changes")')
    
    await expect(page.locator('text=Changes saved')).toBeVisible()
  })

  test('designer should see design analytics', async ({ page }) => {
    await page.goto('/designer/dashboard')
    
    // Click on a published design
    const publishedDesign = page.locator('[data-testid="design-card"]:has-text("PUBLISHED")').first()
    await publishedDesign.click()
    
    // Should show analytics
    await expect(page.locator('[data-testid="design-views"]')).toBeVisible()
    await expect(page.locator('[data-testid="design-sales"]')).toBeVisible()
    await expect(page.locator('[data-testid="design-revenue"]')).toBeVisible()
  })
})
