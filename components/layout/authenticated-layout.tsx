"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/layout/header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}