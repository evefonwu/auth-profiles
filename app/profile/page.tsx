import { getCurrentUserProfile } from "@/lib/profile-server";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1>Profile Error</h1>
          <p>Unable to load your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 mt-3">
          <ProfileCard profile={profile} />
          <ProfileEditForm profile={profile} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
