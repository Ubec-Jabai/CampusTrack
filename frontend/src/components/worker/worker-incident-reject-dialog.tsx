"use client";

import { useId, useState, type ReactNode } from "react";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { updateIncident } from "@/lib/api/api-incidents";
import {
  IncidentStatus,
  type IncidentResponseDto,
} from "@/types/incident";

interface WorkerIncidentRejectDialogProps {
  trigger: ReactNode;
  incident: IncidentResponseDto;
  onUpdated: () => void;
}

export function WorkerIncidentRejectDialog({
  trigger,
  incident,
  onUpdated,
}: WorkerIncidentRejectDialogProps) {
  const reasonId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setReason("");
      setError(null);
    }
  }

  async function handleReject() {
    const trimmedReason = reason.trim();

    if (trimmedReason.length === 0) {
      setError("Reason is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateIncident(incident.id, {
        status: IncidentStatus.REJECTED,
        rejectionReason: trimmedReason,
      });
      toast.success("Incident rejected.");
      setIsOpen(false);
      onUpdated();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to reject incident."
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
          <DialogTitle>Reject incident</DialogTitle>
          <DialogDescription>
            Reject incident {incident.incidentNumber}. The reason is shown to
            the reporter.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor={reasonId}>Reason</FieldLabel>
            <Textarea
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              required
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <DialogFooter>
            <DialogClose variant="outline" isDisabled={isSubmitting}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onPress={handleReject}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </Dialog>
    </DialogTrigger>
  );
}
