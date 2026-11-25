"use client";

import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api/api-auth";
import { getUnreadCount } from "@/lib/api/api-notification";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/worker", label: "Home" },
  { href: "/worker/incidents", label: "Incidents" },
  { href: "/worker/notifications", label: "Notifications" },
];

export function WorkerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    getUnreadCount()
      .then((result) => {
        if (!ignore) {
          setUnreadCount(result.unreadCount);
        }
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function handleNavigate() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="font-medium">CampusTrack</p>
          <p className="text-muted-foreground">Worker</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    href={item.href}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    onPress={handleNavigate}
                  >
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.href === "/worker/notifications" && unreadCount > 0 && (
                    <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onPress={handleLogout}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOutIcon aria-hidden="true" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
