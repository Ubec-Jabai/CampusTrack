import { UserRole } from "@/types/auth";

export interface UserOption<T extends string> {
  id: T;
  label: string;
}

export const USER_ROLE_OPTIONS: UserOption<UserRole>[] = [
  { id: UserRole.ADMIN, label: "Admin" },
  { id: UserRole.WORKER, label: "Worker" },
  { id: UserRole.STUDENT, label: "Student" },
];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLE_OPTIONS.some((option) => option.id === value);
}
