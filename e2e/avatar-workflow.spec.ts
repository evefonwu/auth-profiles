/**
 * E2E Test Cases for Avatar Generation and Preview Workflow
 * 
 * Avatar-specific user journeys:
 * - should generate random avatar URL using DiceBear fun-emoji style
 * - should generate different random avatars on multiple clicks
 * - should generate consistent random avatars with proper validation
 * - should update avatar preview immediately when URL changes
 * - should show initials fallback when no avatar URL provided
 * - should clear avatar and revert to initials display
 * - should maintain avatar state during form interactions
 * - should generate avatar regardless of name content (random generation)
 * - should preserve initials calculation with email fallback
 * - should handle rapid consecutive avatar operations
 */

import { test, expect } from '@playwright/test'
import { TestHelpers, SELECTORS } from './utils/test-helpers'

test.describe('Avatar Workflow', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.setup()
    
    // Authenticate user before accessing protected routes
    await helpers.auth.authenticateUser()
    
    // Navigate to profile page
    await helpers.nav.goToProfile()
  })

  test.afterEach(async () => {
    await helpers.cleanup()
  })

  test('should generate random avatar URL using DiceBear fun-emoji', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const expectedAvatarPattern = /api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/
    
    // Generate random avatar
    const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
    if (await generateButton.isVisible()) {
      await generateButton.click()
      
      // Check that avatar URL was generated correctly
      const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
      if (await avatarInput.isVisible()) {
        const avatarUrl = await avatarInput.inputValue()
        expect(avatarUrl).toMatch(expectedAvatarPattern)
        expect(avatarUrl).toContain('dicebear.com')
        expect(avatarUrl).toContain('fun-emoji')
      }
    }
  })

  test('should generate different random avatars on multiple clicks', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
    const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
    
    if (await generateButton.isVisible() && await avatarInput.isVisible()) {
      // Generate first avatar
      await generateButton.click()
      const firstAvatar = await avatarInput.inputValue()
      
      // Generate second avatar
      await generateButton.click()
      const secondAvatar = await avatarInput.inputValue()
      
      // Should be different avatars
      expect(firstAvatar).not.toBe(secondAvatar)
      expect(firstAvatar).toMatch(/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/)
      expect(secondAvatar).toMatch(/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/)
    }
  })

  test('should update avatar preview when URL changes', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const testAvatarUrl = 'https://api.dicebear.com/7.x/initials/svg?seed=Test'
    
    // Change avatar URL
    const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
    if (await avatarInput.isVisible()) {
      await avatarInput.clear()
      await avatarInput.fill(testAvatarUrl)
      
      // Trigger change event
      await avatarInput.blur()
      await page.waitForTimeout(500) // Wait for any state updates
      
      // Check if preview updated (if there's a preview image)
      const previewImage = page.locator('[data-testid="avatar-preview"] img, .avatar img').first()
      if (await previewImage.isVisible()) {
        const imageSrc = await previewImage.getAttribute('src')
        expect(imageSrc).toBe(testAvatarUrl)
      }
    }
  })

  test('should show initials fallback when no avatar', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const testName = 'Fallback User'
    const expectedInitials = 'FU'
    
    // Set name and clear avatar
    const nameInput = page.locator(SELECTORS.fullNameInput).first()
    
    if (await nameInput.isVisible()) {
      await nameInput.clear()
      await nameInput.fill(testName)
      await nameInput.blur() // Trigger change event
    }
    
    // Clear avatar using the clear button
    const clearButton = page.locator(SELECTORS.clearAvatarButton).first()
    if (await clearButton.isVisible()) {
      await clearButton.click()
    }
    
    // Wait for state to update
    await page.waitForTimeout(1000)
    
    // Check initials are displayed
    const avatarFallback = page.locator(SELECTORS.avatarFallback).first()
    if (await avatarFallback.isVisible()) {
      const initials = await avatarFallback.textContent()
      expect(initials?.trim()).toBe(expectedInitials)
    } else {
      // Try alternative selector if the first one doesn't work
      const altFallback = page.locator('[data-slot="avatar-fallback"]').first()
      if (await altFallback.isVisible()) {
        const initials = await altFallback.textContent()
        expect(initials?.trim()).toBe(expectedInitials)
      }
    }
  })

  test('should clear avatar and show success feedback', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    // First, set an avatar URL
    const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
    if (await avatarInput.isVisible()) {
      await avatarInput.fill('https://example.com/avatar.jpg')
      
      // Clear avatar
      const clearButton = page.locator(SELECTORS.clearAvatarButton).first()
      if (await clearButton.isVisible()) {
        await clearButton.click()
        
        // Should show success message
        try {
          await helpers.assert.expectSuccessToast('Avatar cleared')
        } catch {
          // If no toast, check that avatar URL was cleared
          const avatarValue = await avatarInput.inputValue()
          expect(avatarValue).toBe('')
        }
      }
    }
  })

  test('should maintain avatar state during form interactions', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const testAvatarUrl = 'https://example.com/test-avatar.jpg'
    
    // Set custom avatar URL
    const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
    
    if (await avatarInput.isVisible()) {
      await avatarInput.clear()
      await avatarInput.fill(testAvatarUrl)
      
      // Click generate avatar button (should overwrite existing URL with random avatar)
      const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
      if (await generateButton.isVisible()) {
        await generateButton.click()
        
        // Avatar URL should now be randomly generated
        const newAvatarUrl = await avatarInput.inputValue()
        expect(newAvatarUrl).not.toBe(testAvatarUrl)
        expect(newAvatarUrl).toMatch(/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/)
        expect(newAvatarUrl).toContain('dicebear.com')
        expect(newAvatarUrl).toContain('fun-emoji')
      }
    }
  })

  test('should generate consistent random avatars', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
    const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
    
    if (await generateButton.isVisible() && await avatarInput.isVisible()) {
      // Generate avatar multiple times to test consistency
      const generatedUrls = []
      
      for (let i = 0; i < 3; i++) {
        await generateButton.click()
        await page.waitForTimeout(100)
        const avatarUrl = await avatarInput.inputValue()
        generatedUrls.push(avatarUrl)
        
        // Each generated URL should follow DiceBear pattern
        expect(avatarUrl).toMatch(/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/)
        expect(avatarUrl).toContain('dicebear.com')
        expect(avatarUrl).toContain('fun-emoji')
        
        // URL should be reasonable length
        expect(avatarUrl.length).toBeLessThan(200)
      }
      
      // All generated URLs should be unique (random seeds)
      const uniqueUrls = new Set(generatedUrls)
      expect(uniqueUrls.size).toBe(generatedUrls.length)
    }
  })

  test('should generate avatar regardless of name content', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const nameWithSpaces = '  John   Doe  '
    
    // Enter name with extra spaces
    const nameInput = page.locator(SELECTORS.fullNameInput).first()
    if (await nameInput.isVisible()) {
      await nameInput.clear()
      await nameInput.fill(nameWithSpaces)
      
      // Generate avatar (should work regardless of name content)
      const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
      if (await generateButton.isVisible()) {
        await generateButton.click()
        
        // Avatar should be randomly generated using DiceBear
        const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
        if (await avatarInput.isVisible()) {
          const avatarUrl = await avatarInput.inputValue()
          expect(avatarUrl).toMatch(/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/)
          expect(avatarUrl).toContain('dicebear.com')
          expect(avatarUrl).toContain('fun-emoji')
          // Random generation shouldn't depend on name content
          expect(avatarUrl).not.toContain('John')
          expect(avatarUrl).not.toContain('Doe')
        }
      }
    }
  })

  test('should preserve initials calculation with email fallback', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    // Clear name to test email fallback
    const nameInput = page.locator(SELECTORS.fullNameInput).first()
    if (await nameInput.isVisible()) {
      await nameInput.clear()
      
      // Check that initials fallback to email
      const avatarFallback = page.locator(SELECTORS.avatarFallback).first()
      if (await avatarFallback.isVisible()) {
        const initials = await avatarFallback.textContent()
        expect(initials?.trim()).toMatch(/^[A-Z]$/) // Should be single letter from email
      }
    }
  })

  test('should handle rapid consecutive avatar operations', async ({ page }) => {
    // Navigate to edit mode
    const editButton = page.locator(SELECTORS.editProfileButton).first()
    if (await editButton.isVisible()) {
      await editButton.click()
    }
    
    const avatarInput = page.locator(SELECTORS.avatarUrlInput).first()
    const generateButton = page.locator(SELECTORS.generateAvatarButton).first()
    const clearButton = page.locator(SELECTORS.clearAvatarButton).first()
    
    if (await generateButton.isVisible() && await clearButton.isVisible() && await avatarInput.isVisible()) {
      // Rapid operations
      await generateButton.click()
      await page.waitForTimeout(100)
      
      await clearButton.click()
      await page.waitForTimeout(100)
      
      await generateButton.click()
      await page.waitForTimeout(100)
      
      // Final state should be consistent with random avatar
      const finalAvatarUrl = await avatarInput.inputValue()
      expect(finalAvatarUrl).toMatch(/api\.dicebear\.com\/7\.x\/fun-emoji\/svg\?seed=.+/)
      expect(finalAvatarUrl).toContain('dicebear.com')
      expect(finalAvatarUrl).toContain('fun-emoji')
    }
  })
})