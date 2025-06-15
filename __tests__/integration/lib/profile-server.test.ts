/**
 * Integration Test Cases for lib/profile-server.ts
 * 
 * getProfile function integration:
 * - should successfully fetch profile by userId from database
 * - should return null when profile not found
 * - should handle database connection errors
 * - should handle malformed userId input
 * 
 * getCurrentUserProfile function integration:
 * - should successfully fetch current user profile when authenticated
 * - should return null when no user authenticated
 * - should return null when user has no profile
 * - should handle auth service errors
 * - should properly integrate with getProfile function
 */

import { getProfile, getCurrentUserProfile } from '@/lib/profile-server'
import { mockUser, mockProfile } from '../../__mocks__/supabase'

// Mock server Supabase client
const mockServerSupabaseAuth = {
  getUser: jest.fn()
}

const mockServerSupabaseFrom = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn()
}

const mockServerSupabaseClient = {
  auth: mockServerSupabaseAuth,
  from: jest.fn(() => mockServerSupabaseFrom)
}

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => Promise.resolve(mockServerSupabaseClient)
}))

describe('Profile Server Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfile function integration', () => {
    it('should successfully fetch profile by userId from database', async () => {
      // Mock successful database response
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await getProfile(mockUser.id)

      expect(result).toEqual(mockProfile)
      expect(mockServerSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockServerSupabaseFrom.select).toHaveBeenCalledWith('*')
      expect(mockServerSupabaseFrom.eq).toHaveBeenCalledWith('id', mockUser.id)
      expect(mockServerSupabaseFrom.single).toHaveBeenCalled()
    })

    it('should return null when profile not found', async () => {
      // Mock profile not found error
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Profile not found' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getProfile('non-existent-id')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile:', 
        expect.objectContaining({ message: 'Profile not found' })
      )

      consoleSpy.mockRestore()
    })

    it('should handle database connection errors', async () => {
      // Mock database connection error
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { code: '08000', message: 'Connection timeout' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getProfile(mockUser.id)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile:',
        expect.objectContaining({ message: 'Connection timeout' })
      )

      consoleSpy.mockRestore()
    })

    it('should handle malformed userId input', async () => {
      // Mock successful response for any input (database handles validation)
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { code: '22P02', message: 'Invalid UUID format' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getProfile('invalid-uuid')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile:',
        expect.objectContaining({ message: 'Invalid UUID format' })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getCurrentUserProfile function integration', () => {
    it('should successfully fetch current user profile when authenticated', async () => {
      // Mock authenticated user
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock successful profile fetch
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await getCurrentUserProfile()

      expect(result).toEqual(mockProfile)
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
      expect(mockServerSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockServerSupabaseFrom.eq).toHaveBeenCalledWith('id', mockUser.id)
    })

    it('should return null when no user authenticated', async () => {
      // Mock no authenticated user
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
      // Should not attempt to fetch profile
      expect(mockServerSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should return null when user has no profile', async () => {
      // Mock authenticated user
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock no profile found
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Profile not found' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
      expect(mockServerSupabaseClient.from).toHaveBeenCalledWith('profiles')

      consoleSpy.mockRestore()
    })

    it('should handle auth service errors', async () => {
      // Mock auth service error
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth service unavailable' }
      })

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
      // Should not attempt to fetch profile when auth fails
      expect(mockServerSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should properly integrate with getProfile function', async () => {
      // This test ensures the function composition works correctly
      const testUserId = 'test-user-123'
      const testUser = { ...mockUser, id: testUserId }
      const testProfile = { ...mockProfile, id: testUserId }

      // Mock authenticated user with different ID
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      })

      // Mock profile fetch for the specific user
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: testProfile,
        error: null
      })

      const result = await getCurrentUserProfile()

      expect(result).toEqual(testProfile)
      // Verify the correct user ID was passed to getProfile
      expect(mockServerSupabaseFrom.eq).toHaveBeenCalledWith('id', testUserId)
    })
  })

  describe('Server client integration', () => {
    it('should use server Supabase client for all operations', async () => {
      // Mock authenticated user
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      await getCurrentUserProfile()

      // Verify server client methods were called
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
      expect(mockServerSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle createServerSupabaseClient async nature', async () => {
      // This test ensures we handle the Promise-based client creation
      const result = await getProfile(mockUser.id)

      // The test passes if no errors are thrown from await
      expect(typeof result).toBe('object') // null or profile object
    })
  })
})