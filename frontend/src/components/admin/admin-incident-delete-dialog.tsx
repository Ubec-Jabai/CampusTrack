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
import { deleteIncident } from "@/lib/api/api-incidents";
import type { IncidentResponseDto } from "@/types/incident";

interface IncidentDeleteDialogProps {
  trigger: ReactNode;
  incident: IncidentResponseDto;
  onDeleted: () => void;
}

export function IncidentDeleteDialog({
  trigger,
  incident,
  onDeleted,
}: IncidentDeleteDialogProps) {
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
      await deleteIncident(incident.id);
      toast.success("Incident deleted.");
      setIsOpen(false);
      onDeleted();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to delete incident."
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
          <DialogTitle>Delete incident?</DialogTitle>
          <DialogDescription>
            Incident {incident.incidentNumber} will be permanently deleted. This
            action cannot be undone.
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
            {isDeleting ? "Deleting..." : "Delete incident"}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
