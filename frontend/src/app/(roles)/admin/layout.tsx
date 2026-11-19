"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { AdminProfileProvider } from "@/components/admin/admin-profile-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useRoleGuard } from "@/components/hooks";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserRole } from "@/types/auth";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const router = useRouter();
  const { isAllowed, user } = useRoleGuard(UserRole.ADMIN);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return (
    <RouterProvider navigate={(href) => router.push(href)}>
      <AdminProfileProvider user={user}>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <header className="flex h-14 items-center gap-2 border-b px-4">
              <SidebarTrigger className="md:hidden" />
              <Separator orientation="vertical" className="h-4" />
              <p className="font-medium">Admin Panel</p>
            </header>
            <div className="flex-1 p-4 md:p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </AdminProfileProvider>
    </RouterProvider>
  );
}
