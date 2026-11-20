"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { WorkerSidebar } from "@/components/worker/worker-sidebar";
import { useRoleGuard } from "@/components/hooks";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserRole } from "@/types/auth";

export default function WorkerLayout({ children }: LayoutProps<"/worker">) {
  const router = useRouter();
  const { isAllowed } = useRoleGuard(UserRole.WORKER);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return (
    <RouterProvider navigate={(href) => router.push(href)}>
      <SidebarProvider>
        <WorkerSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="h-4" />
            <p className="font-medium">Worker Panel</p>
          </header>
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RouterProvider>
  );
}
