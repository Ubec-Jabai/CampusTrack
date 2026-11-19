"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  UserSelect,
  getUserDisplayName,
} from "@/components/admin/admin-user-select";
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
import { updateIncident } from "@/lib/api/api-incidents";
import type { IncidentResponseDto } from "@/types/incident";
import type { UserProfileResponseDto } from "@/types/profile";

interface IncidentAssignDialogProps {
  trigger: ReactNode;
  incident: IncidentResponseDto;
  workers: UserProfileResponseDto[];
  onAssigned: () => void;
}

export function IncidentAssignDialog({
  trigger,
  incident,
  workers,
  onAssigned,
}: IncidentAssignDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workerId, setWorkerId] = useState<number | null>(
    incident.assignedToId ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setWorkerId(incident.assignedToId ?? null);
      setError(null);
    }
  }

  async function handleAssign() {
    if (workerId === null) {
      setError("Worker is required.");
      return;
    }

    if (workerId === incident.assignedToId) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateIncident(incident.id, { assignedToId: workerId });
      toast.success("Incident assigned.");
      setIsOpen(false);
      onAssigned();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to assign incident."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentAssignee = incident.assigned
    ? getUserDisplayName(incident.assigned)
    : "Unassigned";

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog isDismissable={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Assign incident</DialogTitle>
          <DialogDescription>
            Assign incident {incident.incidentNumber} to a worker. Current
            assignee: {currentAssignee}.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel>Worker</FieldLabel>
            <UserSelect
              users={workers}
              selectedUserId={workerId}
              onChange={setWorkerId}
              placeholder="Select a worker"
              ariaLabel="Worker"
            />
          </Field>
          {error && <FieldError>{error}</FieldError>}
          <DialogFooter>
            <DialogClose variant="outline" isDisabled={isSubmitting}>
              Cancel
            </DialogClose>
            <Button onPress={handleAssign} isDisabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </Dialog>
    </DialogTrigger>
  );
}
