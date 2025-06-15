# Testing Strategy

This document outlines the testing approach for this application, emphasizing practical testing strategies that balance coverage with maintainability.

## Multi-Layer Testing Strategy

#### **Database Tests** (`__tests__/database/`)

- **Purpose**: Real database operations and schema validation
- **Framework**: Jest with live Supabase instance
- **Focus**: RLS policies, server functions, and data integrity
- **Environment**: Uses dedicated test Supabase project

#### **Unit Tests** (`__tests__/lib/`)

- **Purpose**: Pure function validation and business logic testing
- **Framework**: Jest
- **Focus**: Core utilities, API clients, and server functions
- **Execution**: Fast, isolated, no external dependencies

#### **Integration Tests** (`__tests__/integration/`)

- **Purpose**: Component workflows and system interactions
- **Framework**: Jest + React Testing Library
- **Focus**: Form workflows, context integrations, and component interactions
- **Coverage**: Real user interaction patterns with mocked dependencies

#### **E2E Tests** (`e2e/`)

- **Purpose**: Complete user journeys across browsers and devices
- **Framework**: Playwright
- **Strategy**: Tiered execution strategy (smoke → critical → comprehensive)
- **Focus**: Practical authentication testing without complex mocking

**📚 Detailed E2E Documentation**: See [`e2e/`](./e2e/) folder for comprehensive guides:

- [`E2E-STRATEGY.md`](./E2E-STRATEGY.md) - Testing philosophy and approach
- [`E2E-COVERAGE.md`](./E2E-COVERAGE.md) - Current status and coverage gaps
- [`E2E-COMMANDS.md`](./E2E-COMMANDS.md) - All test execution commands

## Strategic Testing Approach

### **Core Testing Principles**

**Practical Over Perfect**: Focus on testing strategies that provide maximum value with minimal maintenance overhead, following the 80/20 rule for authentication testing.

**Tiered Execution**: Right-size testing for different scenarios:

- **Smoke Tests**: Fast validation for deployments
- **Critical Tests**: Key workflows for PR validation
- **Comprehensive Tests**: Full coverage for releases

**Adaptive Testing**: Tests gracefully handle authentication state and provide meaningful fallbacks when complete auth flow isn't available.

## Test Organization

### **Directory Structure**

```
__tests__/           # Jest-based testing
├── lib/             # Unit tests (utilities, API clients)
├── integration/     # Integration tests (components, contexts)
└── database/        # Database tests (RLS, functions, schema)

e2e/                 # Playwright-based E2E testing
├── *.spec.ts        # Test specifications
├── utils/           # Shared test utilities
└── *.md             # E2E documentation and guides
```

### **Test Categories**

- **Unit Tests**: Fast, isolated testing of pure functions
- **Integration Tests**: Component workflows and system interactions
- **Database Tests**: Real Supabase operations and schema validation
- **E2E Tests**: Complete user journeys across browsers

## Environment Setup

### **Required Configuration**

**Environment Files**:

- `.env.local` - Development environment variables
- `.env.test` - Real Supabase credentials for database tests

**Supabase Settings**:

- Add redirect URL: `http://localhost:3000/**`
- Execute SQL files from `sql/` folder in order

**Dependencies**:

```bash
npm install              # Install all dependencies
npx playwright install  # Install browser binaries
```

## Authentication Testing Strategy

### **Current Approach** (Practical)

- **Focus**: Critical user flows without complex SSR mocking
- **Coverage**: Login forms, validation, navigation, error handling
- **Benefits**: Simple, fast, catches majority of auth issues

### **Future Enhancement** (When Scale Justifies)

- Real Supabase test users with JWT validation
- Server-side session management testing
- Cross-device authentication scenarios

**📚 Detailed Auth Strategy**: See [`E2E-STRATEGY.md`](./E2E-STRATEGY.md#authentication-testing-approach) for comprehensive authentication testing approach.

## Testing Best Practices

### **When to Use Each Test Type**

| Test Type       | Use For                                                    | Avoid For                                |
| --------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Unit**        | Pure functions, utilities, business logic                  | UI interactions, external APIs           |
| **Integration** | Component workflows, form flows, context interactions      | Cross-browser issues, full user journeys |
| **Database**    | RLS policies, functions, schema validation                 | UI testing, authentication flows         |
| **E2E**         | User journeys, cross-browser compatibility, critical flows | Unit logic, isolated component testing   |

### **Test Quality Guidelines**

1. **Descriptive names** that explain expected behavior
2. **Single responsibility** - test one thing at a time
3. **Appropriate waiting** for async operations
4. **Real data** for E2E, mocked data for unit/integration
5. **Clear failure messages** for efficient debugging

## Troubleshooting

### **Quick Fixes**

```bash
# Jest issues
npx jest --clearCache && npm test

# E2E issues
npx playwright install && npm run test:smoke:fast

# View detailed reports
npx playwright show-report  # E2E test results
npm run test:coverage       # Jest coverage report
```

### **Common Issues**

- **Jest Tests**: Clear cache, check mocks, verify file paths
- **E2E Tests**: Update browsers, check selectors, verify timeouts
- **Database Tests**: Validate `.env.test` credentials, check RLS policies

### **Debugging Tools**

- **Jest**: `screen.debug()`, verbose output, isolated test runs
- **Playwright**: `page.pause()`, headed mode, trace viewer
- **General**: Console logging (remove before commit)

## Current Implementation Status

### **✅ Fully Working**

- Unit tests with comprehensive coverage
- Integration tests for key workflows
- Database tests with real Supabase validation
- E2E smoke tests across all browsers
- E2E critical tests for key user journeys

### **⚠️ Partial Coverage**

- E2E authenticated feature testing (graceful fallbacks implemented)
- Profile management workflows (skips when auth unavailable)

**📚 Detailed Status**: See [`E2E-COVERAGE.md`](./E2E-COVERAGE.md) for complete implementation status and coverage gaps.

## Contributing

### **Adding New Features**

1. **Start with unit tests** for core business logic
2. **Add integration tests** for component workflows
3. **Include E2E tests** for user-facing features
4. **Update documentation** when changing strategies

### **Maintaining Quality**

- Keep unit test coverage > 90% for core business logic
- Ensure E2E tests provide graceful fallbacks
- Follow established patterns and helper utilities
- Update test documentation alongside code changes

---

This testing strategy provides comprehensive coverage while maintaining practical execution times and clear maintenance paths for scaling the application.
