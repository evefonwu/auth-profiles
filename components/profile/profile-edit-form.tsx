"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/profile-client";
import { useProfile } from "@/contexts/profile-context";
import { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import {
  generateRandomAvatarUrl,
  generateInitials,
  sanitizeProfileData,
} from "@/lib/profile-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url || "",
  });

  // Generate random avatar
  const handleGenerateRandomAvatar = () => {
    const avatarUrl = generateRandomAvatarUrl();
    setFormData((prev) => ({
      ...prev,
      avatar_url: avatarUrl,
    }));

    toast.success("Random avatar generated!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedData = sanitizeProfileData(formData);
      const { error } = await updateProfile(sanitizedData);

      if (error) {
        toast.error("Failed to update profile", {
          description: error,
          duration: 8000,
        });
      } else {
        toast.success("Profile updated successfully!");
        refreshProfile(); // This will trigger sidebar refresh
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", {
        description:
          "An unexpected error occurred while updating your profile.",
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = generateInitials(formData.full_name, profile.email);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-medium">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Avatar Preview
              </Label>
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/30">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    alt="profile image"
                    src={formData.avatar_url || undefined}
                  />
                  <AvatarFallback className="text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-medium">
                    {formData.full_name || "No name set"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                  className="h-9"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateRandomAvatar}
                  className="h-8 text-xs"
                >
                  Random avatar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, avatar_url: "" }));
                    toast.success("Avatar cleared");
                  }}
                  className="h-8 text-xs"
                >
                  Clear Avatar
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="h-9">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
