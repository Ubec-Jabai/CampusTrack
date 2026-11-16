"use client";

import { useRoleGuard } from "@/components/hooks";
import { UserRole } from "@/types/auth";

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  const { isAllowed } = useRoleGuard(UserRole.STUDENT);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
