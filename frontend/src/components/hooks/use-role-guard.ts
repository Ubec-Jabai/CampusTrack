"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";
import { UserRole } from "@/types/auth";

const roleHome: Record<UserRole, string> = {
  [UserRole.ADMIN]: "/admin",
  [UserRole.WORKER]: "/worker",
  [UserRole.STUDENT]: "/student",
};

export interface UseRoleGuardReturn {
  isAllowed: boolean;
}

export function useRoleGuard(role: UserRole): UseRoleGuardReturn {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.userRole !== role) {
      router.replace(roleHome[user.userRole]);
    }
  }, [isLoading, user, role, router]);

  return { isAllowed: !isLoading && user?.userRole === role };
}
