# E2E Test Commands Reference

## Command Aliases Legend

| Alias Command             | Base Command            | Purpose                    |
| ------------------------- | ----------------------- | -------------------------- |
| `npm run test:deployment` | `npm run test:smoke`    | Fast deployment validation |
| `npm run test:pr`         | `npm run test:critical` | Pull request validation    |
| `npm run test:release`    | `npm run test:full`     | Release validation         |

**Note**: Both alias and base commands work identically. Use whichever is more intuitive for your workflow.

## Common Workflows

### 📝 Daily Development

```bash
# Quick feedback loop
npm run test:smoke          # Fast validation
npm test                    # Database and Unit/Integration

# Feature development validation
npm run test:critical      # Key workflows
```

**What This Achieves**:

- **Quick feedback**: Validates basic functionality + core logic (~35s total)
- **Feature validation**: Ensures critical workflows work (~75s total)

**When to Use**:

- ✅ After making small changes or bug fixes
- ✅ During active feature development
- ✅ Before switching branches or taking breaks

### 🔀 Pre-Commit/PR Process

```bash
# Standard PR validation
npm run test:pr            # ~45s - Critical E2E tests
npm test                   # ~30s - Jest test suite
npm run lint               # ~10s - Code quality

# Comprehensive PR validation
npm run test:critical      # ~45s - E2E workflows
npm run test:coverage      # ~35s - Coverage analysis
npm run build              # ~20s - Production build test
```

**What This Achieves**:

- **Standard**: Validates functionality + code quality (~85s total)
- **Comprehensive**: Adds coverage analysis + build verification (~100s total)

**When to Use**:

- ✅ Before committing significant changes
- ✅ In GitHub Actions for PR validation
- ✅ Before requesting code review

### 🚀 Release Process

```bash
# Pre-release validation
npm run test:release       # ~60+ min - Full test suite
npm run test:coverage      # ~35s - Coverage validation
npm run build              # ~20s - Production build

# Post-deployment verification
npm run test:deployment    # ~15s - Smoke test validation
```

**What This Achieves**:

- **Pre-release**: Comprehensive validation across all browsers
- **Post-deployment**: Quick verification that deployment succeeded

**When to Use**:

- ✅ Before major version releases
- ✅ Monthly/quarterly comprehensive validation
- ✅ After deployment to production

## Command Comparison Guide

### **What Each Command Tests**

#### **`npm run test:deployment`** (Smoke Tests)

- **Runs**: All essential functionality across all browsers
- **Focus**: Basic interactions, responsive design, core accessibility
- **Tests**: Login form rendering, email validation, navigation, error display

**When to Use**:

- ✅ Every deployment to production/staging
- ✅ CI/CD pipeline validation
- ✅ Quick verification after infrastructure changes
- ✅ Cross-browser compatibility checks

#### **`npm run test:pr`** (Critical Tests)

- **Runs**: Complete user workflows on primary browsers
- **Focus**: Authentication flows, profile management, form workflows
- **Tests**: End-to-end user journeys, data persistence, error handling

**When to Use**:

- ✅ Pull request validation before merging
- ✅ Feature branch comprehensive testing
- ✅ Pre-merge workflow validation
- ✅ Critical functionality verification

### **`npm run test:deployment` vs `npm run test:pr`**

| Aspect         | `test:deployment` (Smoke)   | `test:pr` (Critical)  |
| -------------- | --------------------------- | --------------------- |
| **Speed**      | Fast (~15s)                 | Moderate (~45s)       |
| **Coverage**   | Essential functionality     | Key user workflows    |
| **Browsers**   | All 4 browsers              | Chrome + Safari only  |
| **Frequency**  | Every deployment            | Every PR              |
| **Purpose**    | Cross-browser smoke testing | Workflow validation   |
| **Test Depth** | Shallow, broad coverage     | Deep, focused testing |

### **Complete Test Suite Options**

#### **`npm run test:release`** (Full Suite)

- **Coverage**: All tests across all browsers
- **Purpose**: Comprehensive pre-release validation
- **When**: Major releases, comprehensive regression testing

### **Development & Debugging**

```bash
npx playwright test --ui     # Interactive test runner
npx playwright test --debug  # Step-by-step debugging
npm run test:e2e:headed     # Watch tests run
```

## Quick Command Overview

### 🚀 Strategic Execution (Recommended)

```bash
# For Deployments - fastest validation
npm run test:deployment    # Smoke tests only (~15s)

# For Pull Requests - key functionality validation
npm run test:pr           # Critical user journeys (~45s)

# For Releases - comprehensive coverage
npm run test:release      # Full test suite (~60+ min)
```

## Granular Test Control

### 🎯 Smoke Tests (Cross-Browser Essentials)

```bash
# All browsers - comprehensive smoke testing
npm run test:smoke        # Chrome, Safari, Firefox, Mobile Safari (~15s)

# Single browser - fastest validation
npm run test:smoke:fast   # Chrome only (~5s)
```

**What it Tests**:

- Login form rendering and basic interactions
- Email input validation and error messages
- Responsive design across all device sizes
- Core accessibility features (keyboard navigation)
- Basic navigation and routing functionality

**Use Cases**:

- ✅ Every deployment validation (CI/CD pipelines)
- ✅ Quick functionality verification during development
- ✅ Cross-browser compatibility checks
- ✅ Infrastructure change validation
- ✅ Post-deployment smoke testing

### 🔑 Critical Tests (Key User Journeys)

```bash
# Primary browsers - key workflows
npm run test:critical     # Chrome + Safari (~45s)

# Alias for PR validation
npm run test:pr           # Same as test:critical
```

**What it Tests**:

- Complete authentication workflows end-to-end
- Profile management and editing features
- Form validation and error handling
- Avatar generation and management
- Data persistence across page refreshes
- Loading states and user feedback

**Use Cases**:

- ✅ Pull request validation before merging
- ✅ Feature branch comprehensive testing
- ✅ Pre-merge workflow validation
- ✅ Critical functionality verification on primary browsers
- ✅ Integration testing after backend changes

### 🌐 Full Test Suite (Comprehensive)

```bash
# All tests, all browsers
npm run test:full         # Complete E2E coverage (~60+ min)

# Alias for release validation
npm run test:release      # Same as test:full
```

**What it Tests**:

- All smoke tests across all browsers
- All critical workflows across all browsers
- Edge case scenarios and error handling
- Cross-browser compatibility for all features
- Performance under different browser conditions
- Accessibility across different browsers

**Use Cases**:

- ✅ Major release validation
- ✅ Comprehensive regression testing
- ✅ Full browser compatibility testing
- ✅ Pre-production verification
- ✅ Monthly/quarterly comprehensive validation
- ✅ Testing after major dependency updates

## Development & Debugging Commands

### 📊 Test Results & Reports

```bash
# View detailed HTML report
npx playwright show-report

# Custom report server
npx playwright show-report --host localhost --port 9323

# Generate trace files for debugging
npx playwright test --trace on

# Generate screenshots on failure
npx playwright test --screenshot on-failure
```

**What Each Does**:

- **HTML Report**: Interactive report with test results, screenshots, videos
- **Custom Server**: Run report on specific host/port
- **Trace Files**: Detailed execution timeline for debugging
- **Screenshots**: Automatic capture when tests fail

**When to Use**:

- ✅ Analyzing test failures in detail
- ✅ Sharing test results with team
- ✅ Debugging timing and performance issues
- ✅ Understanding test execution flow

### 🔄 Test Management

```bash
# Update browser binaries
npx playwright install

# Update specific browser
npx playwright install chromium

# Clear test cache and artifacts
rm -rf test-results/ playwright-report/

# Validate Playwright configuration
npx playwright test --list
```

**What Each Does**:

- **Install browsers**: Downloads/updates browser binaries
- **Specific browser**: Updates only one browser
- **Clear artifacts**: Removes old test results and reports
- **List tests**: Shows all available tests without running

**When to Use**:

- ✅ Setting up new development environment
- ✅ Fixing browser compatibility issues
- ✅ Cleaning up disk space
- ✅ Verifying test configuration

## Environment-Specific Commands

### 🏗️ Development Workflow

```bash
# Quick validation during development
npm run test:smoke && npm test

# Pre-commit validation
npm run test:pr && npm test && npm run lint

# Full validation before push
npm run test:critical && npm run test:coverage
```

**What Each Workflow Does**:

- **Quick validation**: Smoke test + all Jest tests
- **Pre-commit**: Critical E2E + Jest + linting
- **Pre-push**: Critical E2E + coverage analysis

**When to Use**:

- ✅ **Quick validation**: After small changes, rapid iteration
- ✅ **Pre-commit**: Before committing changes to version control
- ✅ **Pre-push**: Before pushing to remote repository

### 🚀 CI/CD Pipeline Commands

```bash
# Deployment validation (fastest)
npm run test:deployment

# PR validation (balanced)
npm run test:pr && npm test

# Release validation (comprehensive)
npm run test:release && npm run test:coverage && npm run build
```

**What Each Pipeline Does**:

- **Deployment**: Smoke tests only for fast deployment validation
- **PR validation**: Critical E2E + Jest for thorough PR review
- **Release**: Full E2E + coverage + build for release readiness

**When to Use**:

- ✅ **Deployment**: Every deployment to staging/production
- ✅ **PR validation**: GitHub Actions on pull request
- ✅ **Release**: Before major version releases

## Command Performance Reference

| Command         | Duration | Tests | Browsers | Use Case              |
| --------------- | -------- | ----- | -------- | --------------------- |
| `test:smoke`    | ~15s     | 28    | 4        | Deployment validation |
| `test:critical` | ~45s     | 46    | 2        | PR validation         |
| `test:full`     | ~60+ min | 175+  | 4        | Release validation    |
| `npm test`      | ~30s     | 129   | -        | Unit/Integration      |

## Configuration Files

### Key Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `jest.config.js` - Jest test configuration
- `package.json` - NPM scripts and dependencies
- `.env.test` - Test environment variables

---
