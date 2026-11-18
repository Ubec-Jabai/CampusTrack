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
import { deleteRoom } from "@/lib/api/api-rooms";
import type { RoomResponseDto } from "@/types/room";

interface RoomDeleteDialogProps {
  trigger: ReactNode;
  room: RoomResponseDto;
  onDeleted: () => void;
}

export function RoomDeleteDialog({
  trigger,
  room,
  onDeleted,
}: RoomDeleteDialogProps) {
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
      await deleteRoom(room.id);
      toast.success("Room deleted.");
      setIsOpen(false);
      onDeleted();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Failed to delete room.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog isDismissable={!isDeleting}>
        <DialogHeader>
          <DialogTitle>Delete room?</DialogTitle>
          <DialogDescription>
            Room {room.roomNumber} in {room.building.name} will be permanently
            deleted. This action cannot be undone.
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
            {isDeleting ? "Deleting..." : "Delete room"}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
