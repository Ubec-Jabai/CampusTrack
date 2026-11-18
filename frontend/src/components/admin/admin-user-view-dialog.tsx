"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProfileDto, UserProfileResponseDto } from "@/types/profile";

interface UserViewDialogProps {
  trigger: ReactNode;
  user: UserProfileResponseDto;
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatName(profile: ProfileDto | null): string {
  if (!profile) {
    return "—";
  }

  const name = [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.suffix,
  ]
    .filter((part) => part !== null && part !== "")
    .join(" ");

  return name || "—";
}

export function UserViewDialog({ trigger, user }: UserViewDialogProps) {
  const profile = user.profile;

  return (
    <DialogTrigger>
      {trigger}
      <Dialog className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{formatName(profile)}</DialogTitle>
          <DialogDescription>User account and profile details.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Role</dt>
            <dd>{formatEnum(user.userRole)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{profile?.phone || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Student number</dt>
            <dd>{profile?.studentNumber || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Department</dt>
            <dd>{profile?.department || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Availability</dt>
            <dd>
              {profile?.available === null || profile?.available === undefined
                ? "—"
                : profile.available
                  ? "Available"
                  : "Unavailable"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Last assigned</dt>
            <dd>
              {profile?.lastAssignedAt
                ? formatDateTime(profile.lastAssignedAt)
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
