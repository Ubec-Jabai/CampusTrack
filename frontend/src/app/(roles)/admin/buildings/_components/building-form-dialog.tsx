"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
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
import { Input } from "@/components/ui/input";
import { createBuilding, updateBuilding } from "@/lib/api/api-buildings";
import type { BuildingResponseDto } from "@/types/building";

interface BuildingFormDialogProps {
  trigger: ReactNode;
  building?: BuildingResponseDto;
  onSaved: () => void;
}

export function BuildingFormDialog({
  trigger,
  building,
  onSaved,
}: BuildingFormDialogProps) {
  const nameId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(building?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = building !== undefined;
  const submitLabel = isSubmitting
    ? "Saving..."
    : isEditing
      ? "Save changes"
      : "Create building";

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setName(building?.name ?? "");
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Building name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (building) {
        await updateBuilding(building.id, { name: trimmedName });
        toast.success("Building updated.");
      } else {
        await createBuilding({ name: trimmedName });
        toast.success("Building created.");
      }

      setIsOpen(false);
      onSaved();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to save building."
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
          <DialogTitle>{isEditing ? "Edit building" : "New building"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the name of this building."
              : "Add a new building to the campus."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor={nameId}>Name</FieldLabel>
              <Input
                id={nameId}
                name="name"
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                required
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
