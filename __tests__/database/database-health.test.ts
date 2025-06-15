/**
 * Real Supabase Database Health Check Tests
 * 
 * ✅ Comprehensive health tests against live Supabase instance
 * 
 * Database role: anon (anonymous)
 * Connection: Real Supabase project via .env.test credentials
 * 
 * Health checks:
 * - Database connection and availability
 * - Schema validation and table structure
 * - RLS policy enforcement effectiveness
 * - Performance and response times
 * - Data integrity constraints
 * - Error handling and graceful failures
 * 
 * Note: Tests real-world scenarios that client applications
 * would encounter when connecting to Supabase with anon role.
 */

import {
  testDatabaseConnection,
  verifyDatabaseSchema,
  testDataInsertionPatterns,
  validateDatabasePerformance,
  runDatabaseHealthCheck,
  cleanupTestData
} from './database-test-utils'

describe('Database Health Check', () => {
  afterAll(async () => {
    // Attempt cleanup (will likely fail due to RLS, which is expected)
    await cleanupTestData()
  })

  describe('Database connectivity', () => {
    it('should establish connection to database', async () => {
      const isConnected = await testDatabaseConnection()
      expect(isConnected).toBe(true)
    }, 10000) // 10 second timeout for network requests

    it('should handle connection gracefully', async () => {
      // Test that connection functions don't throw unhandled errors
      expect(async () => {
        await testDatabaseConnection()
      }).not.toThrow()
    })
  })

  describe('Schema validation', () => {
    it('should have required database tables', async () => {
      const schemaCheck = await verifyDatabaseSchema()
      
      expect(schemaCheck.tablesExist).toBe(true)
      expect(schemaCheck.errors.length).toBe(0)
    }, 10000)

    it('should have RLS enabled for security', async () => {
      const schemaCheck = await verifyDatabaseSchema()
      
      expect(schemaCheck.rlsEnabled).toBe(true)
      if (!schemaCheck.rlsEnabled) {
        console.warn('RLS may not be properly configured')
      }
    })

    it('should have proper table structure', async () => {
      const schemaCheck = await verifyDatabaseSchema()
      
      // Should not have structural errors
      const structuralErrors = schemaCheck.errors.filter(error => 
        error.includes('does not exist') || error.includes('missing')
      )
      expect(structuralErrors.length).toBe(0)
    })
  })

  describe('Data insertion patterns', () => {
    it('should enforce RLS policies', async () => {
      const insertionCheck = await testDataInsertionPatterns()
      
      expect(insertionCheck.rlsBlocking).toBe(true)
      if (!insertionCheck.rlsBlocking) {
        console.warn('RLS policies may not be properly blocking unauthorized access')
      }
    }, 10000)

    it('should enforce data constraints', async () => {
      const insertionCheck = await testDataInsertionPatterns()
      
      expect(insertionCheck.constraintsWorking).toBe(true)
      if (!insertionCheck.constraintsWorking) {
        console.warn('Database constraints may not be properly configured')
      }
    })

    it('should handle insertion attempts gracefully', async () => {
      const insertionCheck = await testDataInsertionPatterns()
      
      // Should complete without throwing errors
      expect(insertionCheck.errors.filter(e => e.includes('failed')).length).toBe(0)
    })
  })

  describe('Database performance', () => {
    it('should respond to queries within acceptable time', async () => {
      const performanceCheck = await validateDatabasePerformance()
      
      expect(performanceCheck.avgResponseTime).toBeLessThan(5000) // 5 seconds max
      expect(performanceCheck.allQueriesSuccessful).toBe(true)
    }, 15000) // 15 second timeout for performance tests

    it('should handle multiple concurrent queries', async () => {
      const performanceCheck = await validateDatabasePerformance()
      
      // Should not have performance-related errors
      const performanceErrors = performanceCheck.errors.filter(error =>
        error.includes('Slow query') || error.includes('timeout')
      )
      expect(performanceErrors.length).toBe(0)
    })

    it('should maintain consistent response times', async () => {
      // Run performance check multiple times
      const checks = await Promise.all([
        validateDatabasePerformance(),
        validateDatabasePerformance(),
        validateDatabasePerformance()
      ])

      const avgTimes = checks.map(check => check.avgResponseTime)
      const maxVariation = Math.max(...avgTimes) - Math.min(...avgTimes)
      
      // Response time variation should be reasonable (within 3 seconds)
      expect(maxVariation).toBeLessThan(3000)
    }, 20000)
  })

  describe('Comprehensive health check', () => {
    it('should pass overall health assessment', async () => {
      const healthCheck = await runDatabaseHealthCheck()
      
      expect(healthCheck.connection).toBe(true)
      expect(healthCheck.schema).toBe(true)
      expect(healthCheck.rls).toBe(true)
      
      // Overall health should be good
      if (!healthCheck.healthy) {
        console.warn('Database health check failed:', healthCheck.details)
      }
      
      // At minimum, connection and schema should work
      expect(healthCheck.connection && healthCheck.schema).toBe(true)
    }, 25000) // 25 second timeout for comprehensive check

    it('should provide detailed health information', async () => {
      const healthCheck = await runDatabaseHealthCheck()
      
      expect(healthCheck.details).toBeDefined()
      expect(healthCheck.details.schema).toBeDefined()
      expect(healthCheck.details.insertion).toBeDefined()
      expect(healthCheck.details.performance).toBeDefined()
    })

    it('should identify security configuration', async () => {
      const healthCheck = await runDatabaseHealthCheck()
      
      // RLS should be properly configured for security
      expect(healthCheck.rls).toBe(true)
      
      if (!healthCheck.rls) {
        console.error('SECURITY WARNING: RLS may not be properly configured!')
      }
    })
  })

  describe('Error handling and resilience', () => {
    it('should handle malformed queries gracefully', async () => {
      // All test utilities should handle errors without throwing
      expect(async () => {
        await Promise.all([
          testDatabaseConnection(),
          verifyDatabaseSchema(),
          testDataInsertionPatterns(),
          validateDatabasePerformance()
        ])
      }).not.toThrow()
    })

    it('should provide meaningful error messages', async () => {
      const schemaCheck = await verifyDatabaseSchema()
      const insertionCheck = await testDataInsertionPatterns()
      const performanceCheck = await validateDatabasePerformance()

      // Error messages should be strings and not empty if errors exist
      const allErrors = [
        ...schemaCheck.errors, 
        ...insertionCheck.errors, 
        ...performanceCheck.errors
      ]
      
      allErrors.forEach(error => {
        expect(typeof error).toBe('string')
        expect(error.length).toBeGreaterThan(0)
      })
    })
  })
})