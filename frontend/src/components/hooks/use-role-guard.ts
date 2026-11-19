"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";
import { roleHome } from "@/lib/auth/role-home";
import { UserRole } from "@/types/auth";
import type { UserProfileResponseDto } from "@/types/profile";

export interface UseRoleGuardReturn {
  isAllowed: boolean;
  user: UserProfileResponseDto | null;
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

  return {
    isAllowed: !isLoading && user?.userRole === role,
    user,
  };
}
