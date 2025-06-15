"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/profile": "Profile Settings",
};

export function Header() {
  const pathname = usePathname();

  const getPageTitle = () => {
    return PAGE_TITLES[pathname] || "Dashboard";
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-border">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="text-sm font-medium text-foreground">
          {getPageTitle()}
        </div>
      </div>
      <div className="ml-auto px-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
