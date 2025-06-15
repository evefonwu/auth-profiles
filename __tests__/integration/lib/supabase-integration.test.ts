/**
 * Integration Test Cases for Supabase Client/Server Integration
 * 
 * Client-Server authentication flow:
 * - should maintain consistent user state between client and server
 * - should handle session expiration and refresh cycles
 * - should properly isolate client and server operations
 * 
 * Profile operations integration:
 * - should allow client updates and server reads for same user
 * - should enforce RLS policies across client and server operations
 * - should handle concurrent client/server operations
 * 
 * Error handling integration:
 * - should handle network failures gracefully across client/server
 * - should provide consistent error messages between client and server
 * - should maintain data integrity during partial failures
 */

import { updateProfile, getCurrentUserProfileClient } from '@/lib/profile-client'
import { getProfile, getCurrentUserProfile } from '@/lib/profile-server'
import { mockUser, mockProfile } from '../../__mocks__/supabase'

// Mock both client and server Supabase instances
const mockClientSupabaseAuth = {
  getUser: jest.fn()
}

const mockClientSupabaseFrom = {
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn()
}

const mockClientSupabaseClient = {
  auth: mockClientSupabaseAuth,
  from: jest.fn(() => mockClientSupabaseFrom)
}

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

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClientSupabaseClient
}))

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => Promise.resolve(mockServerSupabaseClient)
}))

describe('Supabase Client-Server Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Client-Server authentication flow', () => {
    it('should maintain consistent user state between client and server', async () => {
      // Setup both client and server to return same user
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockClientSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      // Fetch profile from both client and server
      const [clientProfile, serverProfile] = await Promise.all([
        getCurrentUserProfileClient(),
        getCurrentUserProfile()
      ])

      expect(clientProfile).toEqual(mockProfile)
      expect(serverProfile).toEqual(mockProfile)
      
      // Both should have called getUser for the same user
      expect(mockClientSupabaseAuth.getUser).toHaveBeenCalled()
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
    })

    it('should handle session expiration and refresh cycles', async () => {
      // Simulate expired session on client
      mockClientSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Session expired' }
      })

      // Simulate valid session on server (after refresh)
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      // Client operation should fail
      const clientResult = await getCurrentUserProfileClient()
      expect(clientResult).toBeNull()

      // Server operation should succeed
      const serverResult = await getCurrentUserProfile()
      expect(serverResult).toEqual(mockProfile)
    })

    it('should properly isolate client and server operations', async () => {
      // Different configurations for client vs server
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: 'different-id' } },
        error: null
      })

      // Setup different responses
      mockClientSupabaseFrom.single.mockResolvedValue({
        data: { ...mockProfile, full_name: 'Client User' },
        error: null
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: { ...mockProfile, full_name: 'Server User' },
        error: null
      })

      const [clientProfile, serverProfile] = await Promise.all([
        getCurrentUserProfileClient(),
        getCurrentUserProfile()
      ])

      // Should get different results from different contexts
      expect(clientProfile?.full_name).toBe('Client User')
      expect(serverProfile?.full_name).toBe('Server User')
    })
  })

  describe('Profile operations integration', () => {
    it('should allow client updates and server reads for same user', async () => {
      // Setup authenticated user for both contexts
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock successful client update
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' }
      mockClientSupabaseFrom.single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      // Mock server read returning updated data
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      // Perform client update
      const updateResult = await updateProfile({ full_name: 'Updated Name' })
      expect(updateResult.error).toBeNull()
      expect(updateResult.data).toEqual(updatedProfile)

      // Verify server can read the updated data
      const serverProfile = await getCurrentUserProfile()
      expect(serverProfile).toEqual(updatedProfile)

      // Verify operations were called correctly
      expect(mockClientSupabaseFrom.update).toHaveBeenCalledWith({ full_name: 'Updated Name' })
      expect(mockServerSupabaseFrom.select).toHaveBeenCalledWith('*')
    })

    it('should enforce RLS policies across client and server operations', async () => {
      const unauthorizedUserId = 'unauthorized-user-id'
      
      // Setup client with one user
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Setup server attempting to access different user's profile
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, id: unauthorizedUserId } },
        error: null
      })

      // Mock RLS policy violation
      mockServerSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'Insufficient privileges' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Server should be denied access to unauthorized profile
      const serverResult = await getProfile(mockUser.id)
      expect(serverResult).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile:',
        expect.objectContaining({ message: 'Insufficient privileges' })
      )

      consoleSpy.mockRestore()
    })

    it('should handle concurrent client/server operations', async () => {
      // Setup same user for both contexts
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock concurrent operations
      mockClientSupabaseFrom.single.mockResolvedValue({
        data: { ...mockProfile, full_name: 'Client Update' },
        error: null
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      // Run operations concurrently
      const [clientUpdate, serverRead] = await Promise.all([
        updateProfile({ full_name: 'Client Update' }),
        getCurrentUserProfile()
      ])

      expect(clientUpdate.error).toBeNull()
      expect(serverRead).toBeTruthy()
      
      // Both operations should complete without interference
      expect(mockClientSupabaseAuth.getUser).toHaveBeenCalled()
      expect(mockServerSupabaseAuth.getUser).toHaveBeenCalled()
    })
  })

  describe('Error handling integration', () => {
    it('should handle network failures gracefully across client/server', async () => {
      // Mock network error for client
      mockClientSupabaseAuth.getUser.mockRejectedValue(
        new Error('Network error')
      )

      // Mock successful server operation
      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      // Client should handle network error
      await expect(getCurrentUserProfileClient()).rejects.toThrow('Network error')

      // Server should continue to work
      const serverResult = await getCurrentUserProfile()
      expect(serverResult).toEqual(mockProfile)
    })

    it('should provide consistent error messages between client and server', async () => {
      const dbError = { code: 'PGRST116', message: 'Record not found' }

      // Setup both to return same error
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockServerSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockClientSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: dbError
      })

      mockServerSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: dbError
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Both should handle the same error consistently
      const clientResult = await getCurrentUserProfileClient()
      const serverResult = await getCurrentUserProfile()

      expect(clientResult).toBeNull()
      expect(serverResult).toBeNull()

      consoleSpy.mockRestore()
    })

    it('should maintain data integrity during partial failures', async () => {
      // Setup authenticated user
      mockClientSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock partial update failure (update succeeds but select fails)
      mockClientSupabaseFrom.update.mockReturnValue(mockClientSupabaseFrom)
      mockClientSupabaseFrom.eq.mockReturnValue(mockClientSupabaseFrom)
      mockClientSupabaseFrom.select.mockReturnValue(mockClientSupabaseFrom)
      mockClientSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Select failed after update' }
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await updateProfile({ full_name: 'Test Update' })

      // Should return error even though update might have succeeded
      expect(result.error).toBe('Select failed after update')
      expect(result.data).toBeNull()

      consoleSpy.mockRestore()
    })
  })
})