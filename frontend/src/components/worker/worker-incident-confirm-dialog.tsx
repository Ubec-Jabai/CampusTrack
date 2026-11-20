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
import { updateIncident } from "@/lib/api/api-incidents";
import {
  IncidentStatus,
  type IncidentResponseDto,
} from "@/types/incident";

interface WorkerIncidentConfirmDialogProps {
  trigger: ReactNode;
  incident: IncidentResponseDto;
  nextStatus: IncidentStatus.PENDING_REVIEW | IncidentStatus.APPROVED;
  title: string;
  description: string;
  actionLabel: string;
  onUpdated: () => void;
}

export function WorkerIncidentConfirmDialog({
  trigger,
  incident,
  nextStatus,
  title,
  description,
  actionLabel,
  onUpdated,
}: WorkerIncidentConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setError(null);
    }
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateIncident(incident.id, { status: nextStatus });
      toast.success("Incident updated.");
      setIsOpen(false);
      onUpdated();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to update incident."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog isDismissable={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <FieldError>{error}</FieldError>}
        <DialogFooter>
          <DialogClose variant="outline" isDisabled={isSubmitting}>
            Cancel
          </DialogClose>
          <Button onPress={handleConfirm} isDisabled={isSubmitting}>
            {isSubmitting ? "Saving..." : actionLabel}
          </Button>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
