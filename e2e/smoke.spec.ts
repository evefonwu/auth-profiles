/**
 * Smoke Tests - Essential Cross-Browser Functionality
 * 
 * Critical tests that run on ALL browsers to ensure basic functionality:
 * - should load the home page successfully
 * - should have proper page title and meta tags
 * - should render basic UI elements without errors
 * - should display login form for unauthenticated users
 * - should be responsive across viewports
 * - should handle basic form interactions
 */

import { test, expect } from '@playwright/test'
import { TestHelpers, SELECTORS } from './utils/test-helpers'

test.describe('Smoke Tests', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Page should load
    await expect(page).toHaveURL(/\/$|\/login|\/auth/)
    
    // Should have basic HTML structure
    await expect(page.locator('html')).toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper page title', async ({ page }) => {
    await page.goto('/')
    
    // Should have a meaningful title
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('should render without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should not have critical JavaScript errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('Extension') &&
      !error.includes('chrome-extension')
    )
    
    expect(criticalErrors).toEqual([])
  })

  test('should display login form for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    
    // Should show login form elements
    await expect(page.locator(SELECTORS.emailInput)).toBeVisible()
    await expect(page.locator(SELECTORS.loginButton)).toBeVisible()
    
    // Should have proper form labels and title
    await expect(page.locator('text=Email')).toBeVisible()
    await expect(page.locator('text=Welcome to Auth Profiles Starter Kit')).toBeVisible()
  })

  test('should handle basic form interactions', async ({ page }) => {
    await page.goto('/')
    
    // Should be able to type in email field
    const emailInput = page.locator(SELECTORS.emailInput)
    await emailInput.fill('test@example.com')
    
    const inputValue = await emailInput.inputValue()
    expect(inputValue).toBe('test@example.com')
    
    // Login button should be clickable
    const loginButton = page.locator(SELECTORS.loginButton)
    await expect(loginButton).toBeEnabled()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()
    
    // Should not have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth
    })
    
    expect(hasHorizontalScroll).toBe(false)
    
    // Essential elements should still be visible on mobile
    await expect(page.locator(SELECTORS.emailInput)).toBeVisible()
    await expect(page.locator(SELECTORS.loginButton)).toBeVisible()
  })

  test('should navigate between pages without errors', async ({ page }) => {
    await page.goto('/')
    
    // Should load home page
    await expect(page.locator('body')).toBeVisible()
    
    // Try navigating to profile (should redirect to login)
    await page.goto('/profile')
    
    // Should redirect back to login
    await expect(page.locator(SELECTORS.emailInput)).toBeVisible()
    
    // No JavaScript errors should occur during navigation
    const errors: string[] = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })
    
    await page.waitForTimeout(1000) // Wait for any potential errors
    expect(errors.length).toBe(0)
  })
})