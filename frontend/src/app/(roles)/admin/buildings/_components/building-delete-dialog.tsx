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
import { deleteBuilding } from "@/lib/api/api-buildings";
import type { BuildingResponseDto } from "@/types/building";

interface BuildingDeleteDialogProps {
  trigger: ReactNode;
  building: BuildingResponseDto;
  onDeleted: () => void;
}

export function BuildingDeleteDialog({
  trigger,
  building,
  onDeleted,
}: BuildingDeleteDialogProps) {
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
      await deleteBuilding(building.id);
      toast.success("Building deleted.");
      setIsOpen(false);
      onDeleted();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete building."
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
          <DialogTitle>Delete building?</DialogTitle>
          <DialogDescription>
            {building.name} will be permanently deleted. This action cannot be
            undone.
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
            {isDeleting ? "Deleting..." : "Delete building"}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
