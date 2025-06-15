// Server-side profile functions only

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getProfile(user.id);
}
