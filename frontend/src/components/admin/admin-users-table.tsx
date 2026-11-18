"use client";

import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { UserDeleteDialog } from "@/components/admin/admin-user-delete-dialog";
import { UserFormDialog } from "@/components/admin/admin-user-form-dialog";
import { UserViewDialog } from "@/components/admin/admin-user-view-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserProfileResponseDto } from "@/types/profile";

interface UsersTableProps {
  users: UserProfileResponseDto[];
  onReload: () => void;
  onDeleted: () => void;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getUserName(user: UserProfileResponseDto): string {
  const profile = user.profile;
  if (!profile) {
    return user.email;
  }

  const name = [profile.firstName, profile.lastName]
    .filter((part) => part !== "")
    .join(" ");
  return name || user.email;
}

export function UsersTable({
  users,
  onReload,
  onDeleted,
}: UsersTableProps) {
  return (
    <Table aria-label="Users">
      <TableHeader>
        <TableHead id="name" isRowHeader>
          Name
        </TableHead>
        <TableHead id="email">Email</TableHead>
        <TableHead id="role">Role</TableHead>
        <TableHead id="department">Department</TableHead>
        <TableHead id="createdAt">Created</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={users}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            No users found.
          </div>
        )}
      >
        {(user) => (
          <TableRow id={user.id}>
            <TableCell>{getUserName(user)}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{formatEnum(user.userRole)}</TableCell>
            <TableCell>{user.profile?.department || "—"}</TableCell>
            <TableCell>{formatCreatedAt(user.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <UserViewDialog
                  user={user}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View ${getUserName(user)}`}
                    >
                      <EyeIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <UserFormDialog
                  user={user}
                  onSaved={onReload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${getUserName(user)}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <UserDeleteDialog
                  user={user}
                  onDeleted={onDeleted}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${getUserName(user)}`}
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  }
                />
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
