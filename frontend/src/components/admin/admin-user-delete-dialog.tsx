"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { deleteUser } from "@/lib/api/api-admin-users";
import type { UserProfileResponseDto } from "@/types/profile";

interface UserDeleteDialogProps {
  trigger: ReactNode;
  user: UserProfileResponseDto;
  onDeleted: () => void;
}

function getUserLabel(user: UserProfileResponseDto): string {
  const profile = user.profile;
  if (!profile) {
    return user.email;
  }

  const name = [profile.firstName, profile.lastName]
    .filter((part) => part !== "")
    .join(" ");
  return name || user.email;
}

export function UserDeleteDialog({
  trigger,
  user,
  onDeleted,
}: UserDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setError(null);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteUser(user.id);
      toast.success("User deleted.");
      setIsOpen(false);
      onDeleted();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete user."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog isDismissable={!isDeleting}>
        <DialogHeader>
          <DialogTitle>Delete user?</DialogTitle>
          <DialogDescription>
            {getUserLabel(user)} will be permanently deleted. This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <FieldError>{error}</FieldError>}
        <DialogFooter>
          <DialogClose variant="outline" isDisabled={isDeleting}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onPress={handleDelete}
            isDisabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete user"}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
