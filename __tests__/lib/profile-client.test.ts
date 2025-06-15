/**
 * Test Cases for lib/profile-client.ts
 * 
 * updateProfile function:
 * - should successfully update profile when user is authenticated
 * - should return error when user is not authenticated
 * - should return error when database update fails
 * - should handle multiple field updates
 * 
 * getCurrentUserProfileClient function:
 * - should successfully fetch user profile when authenticated
 * - should return null when user is not authenticated
 * - should return null when database query fails
 * - should handle auth errors gracefully
 */

import { updateProfile, getCurrentUserProfileClient } from '@/lib/profile-client'
import { mockUser, mockProfile } from '../__mocks__/supabase'

// Mock Supabase client
const mockSupabaseAuth = {
  getUser: jest.fn(),
}

const mockSupabaseFrom = {
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  from: jest.fn(() => mockSupabaseFrom),
}

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('profile-client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateProfile', () => {
    it('should successfully update profile when user is authenticated', async () => {
      // Setup mocks
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseFrom.single.mockResolvedValue({
        data: { ...mockProfile, full_name: 'Updated Name' },
        error: null
      })

      const updates = { full_name: 'Updated Name' }
      const result = await updateProfile(updates)

      expect(result).toEqual({
        data: { ...mockProfile, full_name: 'Updated Name' },
        error: null
      })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseFrom.update).toHaveBeenCalledWith(updates)
      expect(mockSupabaseFrom.eq).toHaveBeenCalledWith('id', mockUser.id)
      expect(mockSupabaseFrom.select).toHaveBeenCalled()
      expect(mockSupabaseFrom.single).toHaveBeenCalled()
    })

    it('should return error when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const updates = { full_name: 'Updated Name' }
      const result = await updateProfile(updates)

      expect(result).toEqual({
        data: null,
        error: 'User not authenticated'
      })

      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should return error when database update fails', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      const dbError = { message: 'Database error' }
      mockSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: dbError
      })

      const updates = { full_name: 'Updated Name' }
      const result = await updateProfile(updates)

      expect(result).toEqual({
        data: null,
        error: 'Database error'
      })
    })

    it('should handle multiple field updates', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      const updatedProfile = {
        ...mockProfile,
        full_name: 'New Name',
        avatar_url: 'https://newavatar.com/image.jpg'
      }
      
      mockSupabaseFrom.single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      const updates = { 
        full_name: 'New Name',
        avatar_url: 'https://newavatar.com/image.jpg'
      }
      const result = await updateProfile(updates)

      expect(result).toEqual({
        data: updatedProfile,
        error: null
      })

      expect(mockSupabaseFrom.update).toHaveBeenCalledWith(updates)
    })
  })

  describe('getCurrentUserProfileClient', () => {
    it('should successfully fetch user profile when authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabaseFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await getCurrentUserProfileClient()

      expect(result).toEqual(mockProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseFrom.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseFrom.eq).toHaveBeenCalledWith('id', mockUser.id)
      expect(mockSupabaseFrom.single).toHaveBeenCalled()
    })

    it('should return null when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const result = await getCurrentUserProfileClient()

      expect(result).toBeNull()
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('should return null when database query fails', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      const dbError = { message: 'Profile not found' }
      mockSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: dbError
      })

      const result = await getCurrentUserProfileClient()

      expect(result).toBeNull()
    })

    it('should handle auth errors gracefully', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' }
      })

      const result = await getCurrentUserProfileClient()

      expect(result).toBeNull()
    })
  })
})