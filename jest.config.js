const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '__tests__/__mocks__/',
    'e2e/',
  ],
  // Separate test environments for different test types
  projects: [
    {
      displayName: 'unit-integration',
      testMatch: [
        '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
        '!**/__tests__/database/real-*.(test|spec).(ts|tsx|js)',
        '!**/__tests__/database/database-health.(test|spec).(ts|tsx|js)'
      ],
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { presets: ['next/babel'] }],
      },
    },
    {
      displayName: 'database',
      testMatch: [
        '**/__tests__/database/real-*.(test|spec).(ts|tsx|js)',
        '**/__tests__/database/database-health.(test|spec).(ts|tsx|js)'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.database.setup.js'],
      testTimeout: 30000, // 30 second timeout for database tests
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      extensionsToTreatAsEsm: ['.ts'],
      globals: {
        'ts-jest': {
          useESM: true
        }
      },
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { presets: ['next/babel'] }],
      },
    }
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.*',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)