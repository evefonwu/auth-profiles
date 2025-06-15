"use client";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to your Dashboard
        </h1>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            This is an Authentication and Profile Management Starter Kit with
            Next.js 15 App Router and Supabase backend.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h4 className="text-base font-medium mb-2">
              Magic Link Authentication
            </h4>
            <p className="text-sm text-muted-foreground">
              Secure passwordless authentication powered by Supabase with email
              verification.
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h4 className="text-base font-medium mb-2">
              User Profile Management
            </h4>
            <p className="text-sm text-muted-foreground">
              Update your profile information and manage your account settings
              with avatar generation.
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h4 className="text-base font-medium mb-2">
              Application Test Suites
            </h4>
            <p className="text-sm text-muted-foreground">
              Application testing with database, unit, integration, and E2E test
              suites.
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h4 className="text-base font-medium mb-2">Modern UI</h4>
            <p className="text-sm text-muted-foreground">
              Responsive and accessible design with shadcn/ui sidebar, toast
              notifications for user messages, and theme switcher.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
