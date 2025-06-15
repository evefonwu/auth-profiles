import { Profile } from "@/lib/types/database";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {

  const memberSince = new Date(profile.created_at);
  const lastUpdated = new Date(profile.updated_at);
  const isRecentlyUpdated = lastUpdated.getTime() !== memberSince.getTime();

  return (
    <Card className="h-fit">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium truncate">
              {profile.full_name || "No name set"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {profile.email}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground">Member Since</span>
            <span className="text-xs font-medium">
              {memberSince.toLocaleDateString()}
            </span>
          </div>
          {isRecentlyUpdated && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground">
                Last Updated
              </span>
              <span className="text-xs font-medium">
                {lastUpdated.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Profile Status
            </span>
            <div className="flex items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full ${
                  profile.full_name ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-xs font-medium">
                {profile.full_name ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
