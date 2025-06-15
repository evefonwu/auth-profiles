import { Page, expect } from '@playwright/test'

/**
 * E2E Test Helper Functions
 * 
 * This file contains reusable helper functions for E2E tests
 * to reduce code duplication and improve test maintainability.
 */

// Test user data for consistent testing
export const TEST_USER = {
  email: 'test@example.com',
  fullName: 'E2E Test User',
  avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=E2ETestUser'
}

// Page selectors - centralized for easy maintenance
export const SELECTORS = {
  // Login page
  emailInput: 'input[type="email"]',
  loginButton: 'button[type="submit"]',
  loginForm: 'form',
  
  // Navigation
  profileLink: 'a[href="/profile"]',
  homeLink: 'a[href="/"]',
  
  // Profile page
  editProfileButton: 'text=Edit Profile',
  fullNameInput: 'input[name="full_name"], input#full_name',
  avatarUrlInput: 'input[name="avatar_url"], input#avatar_url',
  generateAvatarButton: 'text=Random avatar',
  clearAvatarButton: 'text=Clear Avatar',
  cancelButton: 'text=Cancel',
  saveChangesButton: 'text=Save Changes',
  
  // Profile display
  profileName: '[data-testid="profile-name"]',
  profileEmail: '[data-testid="profile-email"]',
  profileAvatar: '[data-testid="profile-avatar"]',
  avatarFallback: '[data-slot="avatar-fallback"]',
  
  // Toast notifications
  successToast: '.sonner-toast[data-type="success"]',
  errorToast: '.sonner-toast[data-type="error"]',
  
  // Loading states
  loadingSpinner: '[data-testid="loading"]',
  savingButton: 'button:has-text("Saving...")',
}

// Navigation helpers
export class NavigationHelpers {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto('/')
  }

  async goToProfile() {
    await this.page.goto('/profile')
  }

  async clickProfileLink() {
    await this.page.click(SELECTORS.profileLink)
  }

  async clickHomeLink() {
    await this.page.click(SELECTORS.homeLink)
  }
}

// Authentication helpers
export class AuthHelpers {
  constructor(private page: Page) {}

  async enterEmail(email: string = TEST_USER.email) {
    await this.page.fill(SELECTORS.emailInput, email)
  }

  async submitLoginForm() {
    await this.page.click(SELECTORS.loginButton)
  }

  async waitForLoginRedirect() {
    // Wait for redirect after successful login
    await this.page.waitForURL(/\/(dashboard|profile)/)
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if we're on a protected route or see profile link
    const url = this.page.url()
    return url.includes('/profile') || url.includes('/dashboard') || 
           await this.page.locator(SELECTORS.profileLink).isVisible()
  }

  async logout() {
    // Navigate to logout endpoint or click logout button
    await this.page.goto('/auth/logout')
  }

  // Mock authentication for testing protected routes
  async mockAuthentication() {
    const mockUser = {
      id: 'mock-user-id',
      email: TEST_USER.email,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_metadata: {
        full_name: TEST_USER.fullName
      },
      aud: 'authenticated',
      role: 'authenticated'
    }

    // Mock all Supabase auth endpoints that could be called
    await this.page.route('**/auth/v1/user**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser)
      })
    })

    // Mock token verification/refresh endpoint
    await this.page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser
        })
      })
    })

    // Mock session endpoint
    await this.page.route('**/auth/v1/session**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser
        })
      })
    })

    // Mock any JWT verification calls
    await this.page.route('**/auth/v1/verify**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser)
      })
    })

    // Mock profile API calls
    await this.page.route('**/rest/v1/profiles**', async (route) => {
      const method = route.request().method()
      
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            id: 'mock-user-id',
            email: TEST_USER.email,
            full_name: TEST_USER.fullName,
            avatar_url: TEST_USER.avatarUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
        })
      } else if (method === 'PATCH' || method === 'PUT') {
        // Mock profile update
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-user-id',
            email: TEST_USER.email,
            full_name: TEST_USER.fullName,
            avatar_url: TEST_USER.avatarUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        })
      } else {
        await route.continue()
      }
    })

  }

  // Helper for tests that need authentication
  // Note: Following practical approach from supabase-e2e-guide.md
  // Complex SSR auth mocking is not implemented - tests use graceful fallbacks
  async authenticateUser() {
    // Set up basic API route mocking for client-side scenarios
    await this.mockAuthentication()
    
    // Navigate to home page to establish context
    await this.page.goto('/')
    
    // Note: Actual authentication testing is handled by auth-happy-path.spec.ts
    // Profile tests check authentication state and provide graceful fallbacks
  }
}

// Profile helpers
export class ProfileHelpers {
  constructor(private page: Page) {}

  async editProfile() {
    await this.page.click(SELECTORS.editProfileButton)
  }

  async fillFullName(name: string) {
    await this.page.fill(SELECTORS.fullNameInput, name)
  }

  async fillAvatarUrl(url: string) {
    await this.page.fill(SELECTORS.avatarUrlInput, url)
  }

  async generateAvatar() {
    await this.page.click(SELECTORS.generateAvatarButton)
  }

  async clearAvatar() {
    await this.page.click(SELECTORS.clearAvatarButton)
  }

  async saveChanges() {
    await this.page.click(SELECTORS.saveChangesButton)
  }

  async cancelChanges() {
    await this.page.click(SELECTORS.cancelButton)
  }


  async waitForSaveSuccess() {
    await this.page.waitForSelector(SELECTORS.successToast, { timeout: 10000 })
  }

  async waitForSaveError() {
    await this.page.waitForSelector(SELECTORS.errorToast, { timeout: 10000 })
  }

  async getDisplayedName(): Promise<string> {
    return await this.page.textContent(SELECTORS.profileName) || ''
  }

  async getDisplayedEmail(): Promise<string> {
    return await this.page.textContent(SELECTORS.profileEmail) || ''
  }

  async getAvatarSrc(): Promise<string> {
    const avatar = this.page.locator(`${SELECTORS.profileAvatar} img`)
    return await avatar.getAttribute('src') || ''
  }

  async getAvatarFallback(): Promise<string> {
    return await this.page.textContent(SELECTORS.avatarFallback) || ''
  }
}

// Assertion helpers
export class AssertionHelpers {
  constructor(private page: Page) {}

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL(/\/(login|auth|$)/)
    await expect(this.page.locator(SELECTORS.emailInput)).toBeVisible()
  }

  async expectToBeOnProfilePage() {
    await expect(this.page).toHaveURL(/\/profile/)
  }

  async expectToBeOnDashboard() {
    await expect(this.page).toHaveURL(/\/(dashboard|$)/)
  }

  async expectSuccessToast(message?: string) {
    const toast = this.page.locator(SELECTORS.successToast)
    await expect(toast).toBeVisible()
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectErrorToast(message?: string) {
    const toast = this.page.locator(SELECTORS.errorToast)
    await expect(toast).toBeVisible()
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectProfileData(data: Partial<typeof TEST_USER>) {
    if (data.fullName) {
      const name = await this.page.textContent(SELECTORS.profileName)
      expect(name).toContain(data.fullName)
    }
    if (data.email) {
      const email = await this.page.textContent(SELECTORS.profileEmail)
      expect(email).toContain(data.email)
    }
  }

  async expectLoadingState() {
    const loading = this.page.locator(SELECTORS.loadingSpinner)
    await expect(loading).toBeVisible()
  }

  async expectNoLoadingState() {
    const loading = this.page.locator(SELECTORS.loadingSpinner)
    await expect(loading).not.toBeVisible()
  }
}

// Wait helpers for common async operations
export class WaitHelpers {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('domcontentloaded')
  }

  async waitForApiRequest(urlPattern: string | RegExp) {
    await this.page.waitForRequest(urlPattern)
  }

  async waitForApiResponse(urlPattern: string | RegExp) {
    await this.page.waitForResponse(urlPattern)
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout })
  }

  async waitForElementHidden(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout })
  }
}

// Comprehensive test helper class that combines all helpers
export class TestHelpers {
  public nav: NavigationHelpers
  public auth: AuthHelpers
  public profile: ProfileHelpers
  public assert: AssertionHelpers
  public wait: WaitHelpers

  constructor(private page: Page) {
    this.nav = new NavigationHelpers(page)
    this.auth = new AuthHelpers(page)
    this.profile = new ProfileHelpers(page)
    this.assert = new AssertionHelpers(page)
    this.wait = new WaitHelpers(page)
  }

  // Convenience method to get page
  getPage(): Page {
    return this.page
  }

  // Common test setup
  async setup() {
    // Set viewport for consistent testing
    await this.page.setViewportSize({ width: 1280, height: 720 })
    
    // Set up request/response logging for debugging
    this.page.on('request', (request) => {
      if (request.url().includes('/api/') || request.url().includes('supabase')) {
        console.log(`→ ${request.method()} ${request.url()}`)
      }
    })

    this.page.on('response', (response) => {
      if (response.url().includes('/api/') || response.url().includes('supabase')) {
        console.log(`← ${response.status()} ${response.url()}`)
      }
    })
  }

  // Common cleanup
  async cleanup() {
    // Clear any storage or cookies if needed
    await this.page.context().clearCookies()
    
    // Only clear storage if we have a page context
    try {
      await this.page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
    } catch (error) {
      // Ignore localStorage access errors during cleanup
      console.log('Storage cleanup skipped:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

// Utility functions for test data generation
export function generateTestEmail(): string {
  return `test-${Date.now()}@example.com`
}

export function generateTestName(): string {
  return `Test User ${Date.now()}`
}

export function generateRandomAvatarUrl(): string {
  const randomSeed = Math.random().toString(36).substring(2, 15)
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`
}