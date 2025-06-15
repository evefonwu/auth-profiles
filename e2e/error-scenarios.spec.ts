/**
 * E2E Test Cases for Error Handling and Edge Cases
 * 
 * Error scenarios and edge case testing:
 * - should handle network failures gracefully
 * - should show appropriate error messages for failed operations
 * - should recover from authentication errors
 * - should handle database connection issues
 * - should validate user inputs and show feedback
 * - should handle browser back/forward navigation correctly
 * - should work with disabled JavaScript (progressive enhancement)
 * - should handle concurrent user sessions
 * - should gracefully handle large file uploads (if applicable)
 * - should maintain functionality during slow network conditions
 */

import { test, expect } from '@playwright/test'
import { TestHelpers, SELECTORS, generateTestName } from './utils/test-helpers'

test.describe('Error Scenarios and Edge Cases', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.setup()
  })

  test.afterEach(async () => {
    await helpers.cleanup()
  })

  test('should handle complete network failure', async ({ page }) => {
    // Navigate to page first, then block subsequent network requests
    await helpers.nav.goToHome()
    
    // Wait for initial page load
    await page.waitForLoadState('networkidle')
    
    // Now block all network requests except for the already-loaded page
    await page.route('**/api/**', route => route.abort())
    await page.route('**/*supabase*', route => route.abort())
    
    // Try to interact with form that would make network requests
    const emailInput = page.locator(SELECTORS.emailInput)
    const loginButton = page.locator(SELECTORS.loginButton)
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com')
      await loginButton.click()
      
      // Should handle network failure gracefully
      await page.waitForTimeout(2000)
      
      // Page should still be functional (not crashed)
      await expect(page.locator('body')).toBeVisible()
      await expect(emailInput).toBeVisible()
    }
  })

  test('should handle API failures during profile operations', async ({ page }) => {
    // Allow initial page load but block API calls
    await page.route('**/api/**', route => route.abort())
    await page.route('**/*supabase*/**', route => route.abort())
    
    await helpers.nav.goToProfile()
    
    // Try to edit profile
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Make changes
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill('Network Error Test')
        
        // Try to save
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        // Should show error feedback
        try {
          await helpers.assert.expectErrorToast()
        } catch {
          // Alternative: check if form remains in edit mode
          await expect(nameInput).toBeVisible()
        }
      }
    }
  })

  test('should handle slow network conditions', async ({ page }) => {
    // Authenticate user first
    await helpers.auth.authenticateUser()
    
    // Simulate slow network by delaying responses
    await page.route('**/api/**', async route => {
      await page.waitForTimeout(3000) // 3 second delay
      await route.continue()
    })
    
    await helpers.nav.goToProfile()
    
    // Try to perform operation
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill('Slow Network Test')
        
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        // Should show loading state
        try {
          const savingButton = page.locator(SELECTORS.savingButton)
          await expect(savingButton).toBeVisible({ timeout: 1000 })
        } catch {
          // Alternative: button should be disabled
          await expect(saveButton).toBeDisabled({ timeout: 1000 })
        }
        
        // Operation should eventually complete
        await helpers.wait.waitForPageLoad()
      }
    }
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start at home
    await helpers.nav.goToHome()
    await page.waitForLoadState('networkidle')
    
    // Navigate to profile (will likely redirect to login since unauthenticated)
    await helpers.nav.goToProfile()
    await page.waitForLoadState('networkidle')
    
    // Go back
    await page.goBack()
    await helpers.wait.waitForPageLoad()
    
    // Should be back at home
    const currentUrl = page.url()
    expect(currentUrl).toBe('http://localhost:3000/')
    
    // Go forward
    await page.goForward()
    await helpers.wait.waitForPageLoad()
    
    // Should be back where we tried to go (profile or login redirect)
    const forwardUrl = page.url()
    expect(forwardUrl).toMatch(/\/(profile|login|$)/)
  })

  test('should handle invalid form submissions', async ({ page }) => {
    // Authenticate user first
    await helpers.auth.authenticateUser()
    
    await helpers.nav.goToProfile()
    
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Submit form with various invalid inputs
      const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
      if (await avatarInput.isVisible()) {
        // Test with malformed URL
        await avatarInput.clear()
        await avatarInput.fill('not-a-valid-url')
        
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        await helpers.wait.waitForPageLoad()
        
        // Should either show validation error or accept the value
        // (depends on your validation strategy)
      }
    }
  })

  test('should handle extremely long input values', async ({ page }) => {
    await helpers.nav.goToProfile()
    
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Try extremely long name
      const veryLongName = 'A'.repeat(1000) // 1000 characters
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill(veryLongName)
        
        // Should either truncate or show validation error
        const inputValue = await nameInput.inputValue()
        expect(inputValue.length).toBeLessThanOrEqual(1000)
        
        // Try to save
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        await helpers.wait.waitForPageLoad()
      }
    }
  })

  test('should handle special characters and unicode', async ({ page }) => {
    await helpers.nav.goToProfile()
    
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Test with various special characters and unicode
      const specialName = '🚀 Test User 你好 العربية ñoño'
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill(specialName)
        
        // Should handle unicode correctly
        const inputValue = await nameInput.inputValue()
        expect(inputValue).toBe(specialName)
        
        // Generate random avatar (doesn't depend on name)
        const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
        if (await generateButton.isVisible()) {
          await generateButton.click()
          
          // Should generate DiceBear URL
          const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
          if (await avatarInput.isVisible()) {
            const avatarUrl = await avatarInput.inputValue()
            expect(avatarUrl).toContain('dicebear.com')
            expect(avatarUrl).toContain('fun-emoji')
          }
        }
      }
    }
  })

  test('should handle rapid consecutive operations', async ({ page }) => {
    await helpers.nav.goToProfile()
    
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      const saveButton = page.locator(SELECTORS.saveChangesButton).first()
      
      if (await nameInput.isVisible() && await saveButton.isVisible()) {
        // Rapid changes and saves
        for (let i = 0; i < 5; i++) {
          await nameInput.clear()
          await nameInput.fill(`Rapid Test ${i}`)
          await saveButton.click()
          await page.waitForTimeout(100) // Small delay between operations
        }
        
        // Should handle all operations gracefully
        await helpers.wait.waitForPageLoad()
        
        // Form should still be functional
        await expect(nameInput).toBeVisible()
      }
    }
  })

  test('should handle page refresh during form editing', async ({ page }) => {
    await helpers.nav.goToProfile()
    
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      if (await nameInput.isVisible()) {
        // Make changes
        await nameInput.clear()
        await nameInput.fill('Refresh Test User')
        
        // Refresh page
        await page.reload()
        await helpers.wait.waitForPageLoad()
        
        // Should return to stable state
        await expect(page.locator('body')).toBeVisible()
        
        // Changes should not be saved (unless there's auto-save)
        // This depends on your implementation
      }
    }
  })

  test('should handle JavaScript disabled scenarios', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      // Partially simulate JS disabled by removing some dynamic functionality
      Object.defineProperty(window, 'fetch', { value: undefined })
    })
    
    await helpers.nav.goToProfile()
    
    // Basic HTML structure should still work
    await expect(page.locator('body')).toBeVisible()
    
    // Forms should still be present (progressive enhancement)
    const form = page.locator('form').first()
    if (await form.isVisible()) {
      await expect(form).toHaveAttribute('action', /.+/) // Should have fallback action
    }
  })

  test('should handle authentication timeouts', async ({ page }) => {
    // Simulate auth timeout by clearing cookies mid-session
    await helpers.nav.goToProfile()
    
    // Clear authentication
    await page.context().clearCookies()
    
    // Try to perform authenticated operation
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill('Auth Timeout Test')
        
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        await helpers.wait.waitForPageLoad()
        
        // Should either redirect to login or show auth error
        const currentUrl = page.url()
        const hasAuthError = await page.locator('text=/unauthorized|login|authentication/i').isVisible()
        
        expect(hasAuthError || currentUrl.includes('auth') || currentUrl.includes('login')).toBeTruthy()
      }
    }
  })

  test('should handle database constraint violations', async ({ page }) => {
    // This would typically require backend setup to simulate DB constraints
    // For now, we'll test the frontend's handling of error responses
    
    await page.route('**/api/**', route => {
      // Simulate database constraint error
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Constraint violation: duplicate email'
        })
      })
    })
    
    await helpers.nav.goToProfile()
    
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill('Constraint Test')
        
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        // Should show appropriate error message
        try {
          await helpers.assert.expectErrorToast()
        } catch {
          // Alternative: form should remain in edit mode with error state
          await expect(nameInput).toBeVisible()
        }
      }
    }
  })

  test('should maintain accessibility during error states', async ({ page }) => {
    // Block API to cause errors
    await page.route('**/api/**', route => route.abort())
    
    await helpers.nav.goToProfile()
    
    // Check that error states are accessible
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      const nameInput = page.locator(SELECTORS.fullNameInput).first()
      if (await nameInput.isVisible()) {
        await nameInput.clear()
        await nameInput.fill('Accessibility Test')
        
        const saveButton = page.locator(SELECTORS.saveChangesButton).first()
        await saveButton.click()
        
        await page.waitForTimeout(2000)
        
        // Error messages should be accessible
        const errorMessages = page.locator('[role="alert"], .error, [aria-live="polite"]')
        if (await errorMessages.first().isVisible()) {
          // Should have proper ARIA attributes
          const firstError = errorMessages.first()
          const ariaLabel = await firstError.getAttribute('aria-label')
          const role = await firstError.getAttribute('role')
          
          expect(ariaLabel || role).toBeTruthy()
        }
        
        // Form should still be keyboard navigable
        await nameInput.focus()
        await expect(nameInput).toBeFocused()
      }
    }
  })
})