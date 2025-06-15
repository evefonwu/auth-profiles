"use client";

// Client-side profile functions only

import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileUpdate } from "@/lib/types/database";

export async function updateProfile(
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getCurrentUserProfileClient(): Promise<Profile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}
