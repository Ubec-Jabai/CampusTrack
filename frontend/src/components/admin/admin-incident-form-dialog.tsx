"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { RoomSelect } from "@/components/admin/admin-room-select";
import { UserSelect } from "@/components/admin/admin-user-select";
import {
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_PRIORITY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  isIncidentOptionValue,
} from "@/components/admin/admin-incident-options";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createIncident, updateIncident } from "@/lib/api/api-incidents";
import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  type IncidentResponseDto,
  type UpdateIncidentRequestDto,
} from "@/types/incident";
import type { UserProfileResponseDto } from "@/types/profile";
import type { RoomResponseDto } from "@/types/room";

interface IncidentFormDialogProps {
  trigger: ReactNode;
  rooms: RoomResponseDto[];
  users: UserProfileResponseDto[];
  incident?: IncidentResponseDto;
  onSaved: () => void;
}

const YES_NO_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

export function IncidentFormDialog({
  trigger,
  rooms,
  users,
  incident,
  onSaved,
}: IncidentFormDialogProps) {
  const incidentNumberId = useId();
  const descriptionId = useId();
  const affectedAreaId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(
    incident?.room?.id ?? incident?.roomId ?? null
  );
  const [reportedById, setReportedById] = useState<number | null>(
    incident?.reportedBy?.id ?? incident?.reportedById ?? null
  );
  const [category, setCategory] = useState<IncidentCategory | null>(
    incident?.category ?? null
  );
  const [priority, setPriority] = useState<IncidentPriority | null>(
    incident?.priority ?? null
  );
  const [status, setStatus] = useState<IncidentStatus | null>(
    incident?.status ?? null
  );
  const [incidentNumber, setIncidentNumber] = useState(
    incident?.incidentNumber ?? ""
  );
  const [description, setDescription] = useState(
    incident?.description ?? ""
  );
  const [safetyHazard, setSafetyHazard] = useState<boolean | null>(
    incident?.safetyHazard ?? null
  );
  const [operationalImpact, setOperationalImpact] = useState<boolean | null>(
    incident?.operationalImpact ?? null
  );
  const [affectedArea, setAffectedArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = incident !== undefined;
  const submitLabel = isSubmitting
    ? "Saving..."
    : isEditing
      ? "Save changes"
      : "Create incident";

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setRoomId(incident?.room?.id ?? incident?.roomId ?? null);
      setReportedById(
        incident?.reportedBy?.id ?? incident?.reportedById ?? null
      );
      setCategory(incident?.category ?? null);
      setPriority(incident?.priority ?? null);
      setStatus(incident?.status ?? null);
      setIncidentNumber(incident?.incidentNumber ?? "");
      setDescription(incident?.description ?? "");
      setSafetyHazard(incident?.safetyHazard ?? null);
      setOperationalImpact(incident?.operationalImpact ?? null);
      setAffectedArea("");
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (roomId === null) {
      setError("Room is required.");
      return;
    }

    if (reportedById === null) {
      setError("Reporter is required.");
      return;
    }

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!priority) {
      setError("Priority is required.");
      return;
    }

    if (!status) {
      setError("Status is required.");
      return;
    }

    const trimmedIncidentNumber = incidentNumber.trim();
    if (!trimmedIncidentNumber) {
      setError("Incident number is required.");
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("Description is required.");
      return;
    }

    if (safetyHazard === null) {
      setError("Safety hazard is required.");
      return;
    }

    if (operationalImpact === null) {
      setError("Operational impact is required.");
      return;
    }

    const trimmedAffectedArea = affectedArea.trim();
    const parsedAffectedArea = Number(trimmedAffectedArea);
    if (
      trimmedAffectedArea !== "" &&
      (!Number.isInteger(parsedAffectedArea) || parsedAffectedArea <= 0)
    ) {
      setError("Affected area must be a positive number.");
      return;
    }

    if (!isEditing && trimmedAffectedArea === "") {
      setError("Affected area is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (incident) {
        const payload: UpdateIncidentRequestDto = {
          roomId,
          reportedById,
          category,
          priority,
          status,
          description: trimmedDescription,
          safetyHazard,
          operationalImpact,
        };
        if (trimmedAffectedArea !== "") {
          payload.affectedArea = parsedAffectedArea;
        }
        if (trimmedIncidentNumber !== incident.incidentNumber) {
          payload.incidentNumber = trimmedIncidentNumber;
        }

        await updateIncident(incident.id, payload);
        toast.success("Incident updated.");
      } else {
        await createIncident({
          roomId,
          reportedById,
          category,
          priority,
          status,
          incidentNumber: trimmedIncidentNumber,
          description: trimmedDescription,
          safetyHazard,
          operationalImpact,
          affectedArea: parsedAffectedArea,
        });
        toast.success("Incident created.");
      }

      setIsOpen(false);
      onSaved();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to save incident."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog
        isDismissable={!isSubmitting}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit incident" : "New incident"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this incident's details."
              : "Report a new incident on campus."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel>Room</FieldLabel>
              <RoomSelect
                rooms={rooms}
                selectedRoomId={roomId}
                onChange={setRoomId}
                placeholder="Select a room"
                ariaLabel="Room"
              />
            </Field>
            <Field>
              <FieldLabel>Reported by</FieldLabel>
              <UserSelect
                users={users}
                selectedUserId={reportedById}
                onChange={setReportedById}
                placeholder="Select a reporter"
                ariaLabel="Reporter"
              />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a category"
                selectedKey={category}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isIncidentOptionValue(INCIDENT_CATEGORY_OPTIONS, key)
                  ) {
                    setCategory(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Priority</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a priority"
                selectedKey={priority}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isIncidentOptionValue(INCIDENT_PRIORITY_OPTIONS, key)
                  ) {
                    setPriority(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a status"
                selectedKey={status}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isIncidentOptionValue(INCIDENT_STATUS_OPTIONS, key)
                  ) {
                    setStatus(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={incidentNumberId}>Incident number</FieldLabel>
              <Input
                id={incidentNumberId}
                name="incidentNumber"
                value={incidentNumber}
                maxLength={50}
                onChange={(event) => setIncidentNumber(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
              <Textarea
                id={descriptionId}
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>Safety hazard</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select an option"
                selectedKey={
                  safetyHazard === null ? null : safetyHazard ? "yes" : "no"
                }
                onSelectionChange={(key) => {
                  if (key === "yes") {
                    setSafetyHazard(true);
                  } else if (key === "no") {
                    setSafetyHazard(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Operational impact</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select an option"
                selectedKey={
                  operationalImpact === null
                    ? null
                    : operationalImpact
                      ? "yes"
                      : "no"
                }
                onSelectionChange={(key) => {
                  if (key === "yes") {
                    setOperationalImpact(true);
                  } else if (key === "no") {
                    setOperationalImpact(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={affectedAreaId}>Affected area</FieldLabel>
              <Input
                id={affectedAreaId}
                name="affectedArea"
                type="number"
                min={1}
                step={1}
                value={affectedArea}
                onChange={(event) => setAffectedArea(event.target.value)}
                required={!isEditing}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <DialogFooter>
              <DialogClose variant="outline" isDisabled={isSubmitting}>
                Cancel
              </DialogClose>
              <Button type="submit" isDisabled={isSubmitting}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </Dialog>
    </DialogTrigger>
  );
}
