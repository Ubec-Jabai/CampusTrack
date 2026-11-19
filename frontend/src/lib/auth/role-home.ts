import { UserRole } from "@/types/auth";

export const roleHome: Record<UserRole, string> = {
  [UserRole.ADMIN]: "/admin",
  [UserRole.WORKER]: "/worker",
  [UserRole.STUDENT]: "/student",
};
