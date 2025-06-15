# Auth and Profiles Starter Kit

This is a Magic Link Authentication and User Profiles Starter Kit.

For email / password authentication and getting started with Supabase, definitely check out the "Next.js and Supabase Starter Kit" [https://demo-nextjs-with-supabase.vercel.app/](https://demo-nextjs-with-supabase.vercel.app/).

## Tech Stack

- **Next.js 15** with App Router
- **Supabase** for authentication and database
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for design system and accessibility
- **@supabase/ssr** for secure cookie management

## Features

### Magic Link Authentication

- Login with email verification (users enter email and receive secure login link)
- Clicking the link authenticates users via the callback route
- Secure cookie management via @supabase/ssr
- Automatic token refresh via middleware - sessions stay valid
- Application auth state is managed globally via React Context

### User Profile Management

- View/edit profile information
- Generate random emoji avatars, default to letter avatar

### Modern UI

- Responsive and accessible UI
- Layout with shadcn/ui sidebar
- Toast notifications to provide user messages
- Light/Dark mode theme switcher

### Secure Database Layer

- Row Level Security (RLS) policies ensure user only access their own profile
- Server-side functions for safe data fetching
- Client-side functions for user interactions
- Proper TypeScript interfaces and error handling

### Application Test Suites

- Database Tests: Real Supabase instance with RLS validation
- Unit Tests: Core business logic
- Integration Tests: Component workflows and database operations
- E2E Tests: Cross-browser testing

## Demo

You can view a working demo at [https://auth-profiles.vercel.app/](https://auth-profiles.vercel.app/)

Check out docs/ screenshots for reference.

### File Structure

```
lib/supabase/          # DB client config
├── client.ts          # Client-side Supabase config
└── server.ts          # Server-side Supabase config

contexts/
└── auth-context.tsx   # Global auth state management

components/
├── layout/
│   ├── authenticated-layout.tsx  # Layout with sidebar for auth users
│   └── header.tsx                # Header with theme toggle
├── theme-provider.tsx            # Theme context provider
└── theme-toggle.tsx              # Light/dark mode toggle button

sql/                   # Database setup scripts (numbered execution order)
├── 1-create-tables.sql
├── 2-add-functions.sql
└── 3-enable-rls-policies.sql

__tests__/             # Multi-layer testing
├── lib/               # Unit tests
├── integration/       # Integration tests
└── database/          # Real database tests

e2e/                   # End-to-end tests
├── auth-happy-path.spec.ts     # Practical auth testing
├── smoke.spec.ts               # Essential cross-browser tests
├── auth-flow.spec.ts           # Authentication workflows
├── profile-management.spec.ts  # Profile features
├── avatar-workflow.spec.ts     # Avatar functionality
├── error-scenarios.spec.ts     # Edge cases and error handling
└── utils/test-helpers.ts       # Reusable test utilities

```

### Environment Setup

- `.env.local` - Development environment variables
- `.env.test` - Database test environment variables
- Add Redirect URL `http://localhost:3000/**` in Supabase Auth settings

### Clone and run locally

```bash
# Clone and install
pnpm install

# Set up local environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# From Supbase SQL editor:
# Execute SQL files in sql/ folder

# Update Supabase Auth:
# Add Redirect URL http://localhost:3000/**

# Start development server
npm run dev
```
