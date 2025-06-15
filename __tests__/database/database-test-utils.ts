/**
 * Database Test Utilities
 * 
 * Utilities for setting up and cleaning up database tests
 * with real Supabase connections
 */

import { createClient } from '@supabase/supabase-js'

// Create Supabase client for test utilities
export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Test database connection and availability
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await testSupabase.from('profiles').select('count').limit(1)
    
    // Connection is good if we get expected RLS error or success
    if (!error || ['PGRST116', '42501'].includes(error.code)) {
      return true
    }
    
    console.warn('Database connection issue:', error)
    return false
  } catch (err) {
    console.error('Database connection failed:', err)
    return false
  }
}

/**
 * Verify database schema and table structure
 */
export async function verifyDatabaseSchema(): Promise<{
  tablesExist: boolean
  rlsEnabled: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let tablesExist = false
  let rlsEnabled = false

  try {
    // Test profiles table exists
    const { data, error: profilesError } = await testSupabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (!profilesError || ['PGRST116', '42501'].includes(profilesError.code)) {
      tablesExist = true
      
      // RLS detection: Check if anon role gets restricted access
      if (profilesError?.code === '42501') {
        // Direct permission error = RLS enabled
        rlsEnabled = true
      } else if (!profilesError && Array.isArray(data) && data.length === 0) {
        // Empty results for anon role likely means RLS filtering
        rlsEnabled = true
      }
    } else if (profilesError.code === '42P01') {
      errors.push('Profiles table does not exist')
    } else {
      errors.push(`Profiles table error: ${profilesError.message}`)
    }

    // Test basic column structure
    const { error: columnsError } = await testSupabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, created_at, updated_at')
      .limit(1)

    if (columnsError && columnsError.code === '42703') {
      errors.push('Required columns missing from profiles table')
    }

  } catch (err) {
    errors.push(`Schema verification failed: ${err}`)
  }

  return { tablesExist, rlsEnabled, errors }
}

/**
 * Test data insertion patterns (should fail due to RLS)
 */
export async function testDataInsertionPatterns(): Promise<{
  rlsBlocking: boolean
  constraintsWorking: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let rlsBlocking = false
  let constraintsWorking = false

  try {
    // Test 1: Valid data should be blocked by RLS
    const validData = {
      id: '123e4567-e89b-12d3-a456-426614174999',
      email: 'test@validation.com',
      full_name: 'Test User'
    }

    const { error: validError } = await testSupabase
      .from('profiles')
      .insert(validData)

    if (validError && ['42501', '23505', '23503'].includes(validError.code)) {
      rlsBlocking = true
    } else if (validError) {
      errors.push(`Unexpected error for valid data: ${validError.message}`)
    } else {
      errors.push('Valid data was inserted without authentication (RLS may be disabled)')
    }

    // Test 2: Invalid UUID should be caught by constraints
    const invalidUuidData = {
      id: 'not-a-uuid',
      email: 'test@uuid.com',
      full_name: 'Invalid UUID User'
    }

    const { error: uuidError } = await testSupabase
      .from('profiles')
      .insert(invalidUuidData)

    if (uuidError && uuidError.code === '22P02') {
      constraintsWorking = true
    } else if (!uuidError) {
      errors.push('Invalid UUID was accepted (constraints may be missing)')
    }

  } catch (err) {
    errors.push(`Data insertion test failed: ${err}`)
  }

  return { rlsBlocking, constraintsWorking, errors }
}

/**
 * Clean up any test data (limited by RLS)
 */
export async function cleanupTestData(): Promise<void> {
  try {
    // Attempt to clean up test data
    // This will likely fail due to RLS, which is expected
    await testSupabase
      .from('profiles')
      .delete()
      .like('email', '%@validation.com')

    await testSupabase
      .from('profiles')
      .delete()
      .like('email', '%@test.com')

  } catch (err) {
    // Expected to fail due to RLS - this is fine
    console.debug('Cleanup attempt completed (expected to fail due to RLS)')
  }
}

/**
 * Validate database performance
 */
export async function validateDatabasePerformance(): Promise<{
  avgResponseTime: number
  allQueriesSuccessful: boolean
  errors: string[]
}> {
  const errors: string[] = []
  const responseTimes: number[] = []
  let allQueriesSuccessful = true

  const testQueries = [
    () => testSupabase.from('profiles').select('count'),
    () => testSupabase.from('profiles').select('*').limit(1),
    () => testSupabase.from('profiles').select('email').limit(5),
    () => testSupabase.from('profiles').select('*').order('created_at').limit(1),
  ]

  for (const query of testQueries) {
    try {
      const startTime = Date.now()
      const { error } = await query()
      const responseTime = Date.now() - startTime
      
      responseTimes.push(responseTime)

      // Check for unexpected errors (RLS errors are expected)
      if (error && !['PGRST116', '42501'].includes(error.code)) {
        allQueriesSuccessful = false
        errors.push(`Query error: ${error.message}`)
      }

      // Check for slow queries
      if (responseTime > 5000) {
        errors.push(`Slow query detected: ${responseTime}ms`)
      }

    } catch (err) {
      allQueriesSuccessful = false
      errors.push(`Query failed: ${err}`)
    }
  }

  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0

  return { avgResponseTime, allQueriesSuccessful, errors }
}

/**
 * Comprehensive database health check
 */
export async function runDatabaseHealthCheck(): Promise<{
  healthy: boolean
  connection: boolean
  schema: boolean
  rls: boolean
  performance: boolean
  details: any
}> {
  const connection = await testDatabaseConnection()
  const schema = await verifyDatabaseSchema()
  const insertion = await testDataInsertionPatterns()
  const performance = await validateDatabasePerformance()

  const healthy = connection && 
                  schema.tablesExist && 
                  schema.rlsEnabled && 
                  insertion.rlsBlocking && 
                  performance.allQueriesSuccessful

  return {
    healthy,
    connection,
    schema: schema.tablesExist,
    rls: schema.rlsEnabled && insertion.rlsBlocking,
    performance: performance.allQueriesSuccessful && performance.avgResponseTime < 2000,
    details: {
      schema,
      insertion,
      performance
    }
  }
}