# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Package management
pnpm install          # Install dependencies (preferred)
npm install           # Alternative package manager

# Development
npm run dev           # Start development server (Next.js)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint

# Testing
npm test              # Run all Jest tests (unit + integration + database)
npm run test:watch    # Watch mode for Jest tests
npm run test:coverage # Generate test coverage report

# E2E Testing (Playwright)
npm run test:e2e           # Full E2E test suite
npm run test:smoke         # Essential functionality, all browsers
npm run test:critical      # Key user journeys

# Test execution by scope
npm run test:deployment    # For deployments (smoke tests)
npm run test:pr           # For pull requests (critical tests)
npm run test:release      # For releases (full suite)

# Debugging E2E tests
npm run test:e2e:ui       # Interactive test runner
npm run test:e2e:headed   # Run with browser visible
npm run test:e2e:debug    # Debug mode with paused execution
```

## Architecture Overview

### Authentication System

- **Magic Link Authentication**: Email-based login with Supabase
- **Global State**: React Context (`contexts/auth-context.tsx`) manages user session
- **Middleware**: Automatic token refresh via `middleware.ts`
- **Security**: Server-side session validation with `@supabase/ssr`

### Database Layer

- **Supabase Integration**: PostgreSQL with Row Level Security (RLS)
- **Type Safety**: TypeScript interfaces in `lib/types/database.ts`
- **Server Functions**: `lib/profile-server.ts` for secure data operations
- **Client Functions**: `lib/profile-client.ts` for user interactions

### Component Architecture

- **Layout System**: `components/layout/authenticated-layout.tsx` with responsive sidebar
- **Theme System**: Dark/light mode via `next-themes` and `components/theme-provider.tsx`
- **UI Components**: shadcn/ui components in `components/ui/`
- **Profile Management**: `components/profile/` for user profile features

### File Structure Patterns

```
lib/supabase/          # Database configuration
├── client.ts          # Client-side Supabase config
└── server.ts          # Server-side Supabase config

contexts/              # React Context providers
├── auth-context.tsx   # Authentication state management
└── profile-context.tsx # Profile data management

components/
├── layout/            # Layout components with sidebar
├── auth/              # Authentication components
├── profile/           # Profile management components
└── ui/                # shadcn/ui design system components

sql/                   # Database setup scripts (execute in order)
├── 1-create-tables.sql
├── 2-add-functions.sql
└── 3-enable-rls-policies.sql
```

## Testing Strategy

### Multi-Layer Testing Approach

1. **Database Tests** (`__tests__/database/`): Real Supabase operations with RLS validation
2. **Unit Tests** (`__tests__/lib/`): Pure functions and business logic
3. **Integration Tests** (`__tests__/integration/`): Component workflows and interactions
4. **E2E Tests** (`e2e/`): Cross-browser user journeys with Playwright

### Authentication Testing

- **Current Approach**: Practical testing focusing on forms, validation, and navigation
- **Graceful Fallbacks**: Tests adapt when full auth flow isn't available
- **Coverage**: Login forms, error handling, protected route navigation

### Environment Setup

- `.env.local`: Development environment variables
- `.env.test`: Real Supabase credentials for database tests
- Supabase Auth: Add redirect URL `http://localhost:3000/**`

## Development Guidelines

### Code Patterns

- **Supabase Client**: Use `createClient()` from `lib/supabase/client.ts` for client-side operations
- **Supabase Server**: Use `createClient()` from `lib/supabase/server.ts` for server-side operations
- **Authentication**: Access user state via `useAuth()` hook from `contexts/auth-context.tsx`
- **Profile Data**: Server operations in `lib/profile-server.ts`, client operations in `lib/profile-client.ts`

### Component Conventions

- Use shadcn/ui components from `components/ui/`
- Follow responsive design patterns established in existing components
- Implement proper TypeScript interfaces for props and data structures
- Use Tailwind CSS for styling with consistent design tokens

### Database Operations

- **Security**: All operations must respect RLS policies
- **Server-side**: Use server functions for data fetching and mutations
- **Client-side**: Handle user interactions and optimistic updates
- **Type Safety**: Use interfaces from `lib/types/database.ts`

## Key Integration Points

### Supabase SSR Integration

- Middleware handles automatic token refresh
- Server components use server-side Supabase client
- Client components use client-side Supabase client
- Proper cookie management between client and server

### Theme System Integration

- `components/theme-provider.tsx` wraps the app
- `components/theme-toggle.tsx` provides user control
- All components support light/dark mode via CSS variables

### Testing Integration

- Database tests require real Supabase project with test data
- E2E tests use practical authentication approach
- Unit/integration tests use mocked dependencies
- Coverage reports available via `npm run test:coverage`
