"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserProfileResponseDto } from "@/types/profile";

const AdminProfileContext = createContext<UserProfileResponseDto | null>(null);

interface AdminProfileProviderProps {
  user: UserProfileResponseDto | null;
  children: ReactNode;
}

export function AdminProfileProvider({
  user,
  children,
}: AdminProfileProviderProps) {
  return (
    <AdminProfileContext.Provider value={user}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile(): UserProfileResponseDto | null {
  return useContext(AdminProfileContext);
}
