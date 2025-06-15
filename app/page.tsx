import { LoginForm } from "@/components/auth/login-form";
import { Dashboard } from "@/components/dashboard";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <LoginForm />
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <Dashboard />
    </AuthenticatedLayout>
  );
}
