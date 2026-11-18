"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { RoomSelect } from "@/components/admin/admin-room-select";
import {
  ASSET_CATEGORY_OPTIONS,
  ASSET_CONDITION_OPTIONS,
  ASSET_CRITICALITY_OPTIONS,
  ASSET_STATUS_OPTIONS,
  isOptionValue,
} from "@/components/admin/admin-asset-options";
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
import { createAsset, updateAsset } from "@/lib/api/api-assets";
import {
  AssetCategory,
  AssetCondition,
  AssetCriticality,
  AssetStatus,
  type AssetResponseDto,
} from "@/types/asset";
import type { RoomResponseDto } from "@/types/room";

interface AssetFormDialogProps {
  trigger: ReactNode;
  rooms: RoomResponseDto[];
  asset?: AssetResponseDto;
  defaultRoomId?: number;
  onSaved: () => void;
}

export function AssetFormDialog({
  trigger,
  rooms,
  asset,
  defaultRoomId,
  onSaved,
}: AssetFormDialogProps) {
  const nameId = useId();
  const brandId = useId();
  const modelId = useId();
  const serialNumberId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(
    asset?.room?.id ?? defaultRoomId ?? null
  );
  const [name, setName] = useState(asset?.name ?? "");
  const [brand, setBrand] = useState(asset?.brand ?? "");
  const [model, setModel] = useState(asset?.model ?? "");
  const [serialNumber, setSerialNumber] = useState(
    asset?.serialNumber ?? ""
  );
  const [category, setCategory] = useState<AssetCategory | null>(
    asset?.category ?? null
  );
  const [status, setStatus] = useState<AssetStatus | null>(
    asset?.status ?? null
  );
  const [condition, setCondition] = useState<AssetCondition | null>(
    asset?.condition ?? null
  );
  const [criticality, setCriticality] = useState<AssetCriticality | null>(
    asset?.criticality ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = asset !== undefined;
  const submitLabel = isSubmitting
    ? "Saving..."
    : isEditing
      ? "Save changes"
      : "Create asset";

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setRoomId(asset?.room?.id ?? defaultRoomId ?? null);
      setName(asset?.name ?? "");
      setBrand(asset?.brand ?? "");
      setModel(asset?.model ?? "");
      setSerialNumber(asset?.serialNumber ?? "");
      setCategory(asset?.category ?? null);
      setStatus(asset?.status ?? null);
      setCondition(asset?.condition ?? null);
      setCriticality(asset?.criticality ?? null);
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (roomId === null) {
      setError("Room is required.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Asset name is required.");
      return;
    }

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!status) {
      setError("Status is required.");
      return;
    }

    if (!condition) {
      setError("Condition is required.");
      return;
    }

    if (!criticality) {
      setError("Criticality is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      roomId,
      name: trimmedName,
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      category,
      status,
      condition,
      criticality,
    };

    try {
      if (asset) {
        await updateAsset(asset.id, payload);
        toast.success("Asset updated.");
      } else {
        await createAsset(payload);
        toast.success("Asset created.");
      }

      setIsOpen(false);
      onSaved();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Failed to save asset.");
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
          <DialogTitle>{isEditing ? "Edit asset" : "New asset"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this asset's details."
              : "Add a new asset to a campus room."}
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
            <Field>
              <FieldLabel htmlFor={brandId}>Brand</FieldLabel>
              <Input
                id={brandId}
                name="brand"
                value={brand}
                maxLength={100}
                onChange={(event) => setBrand(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={modelId}>Model</FieldLabel>
              <Input
                id={modelId}
                name="model"
                value={model}
                maxLength={100}
                onChange={(event) => setModel(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={serialNumberId}>Serial number</FieldLabel>
              <Input
                id={serialNumberId}
                name="serialNumber"
                value={serialNumber}
                maxLength={100}
                onChange={(event) => setSerialNumber(event.target.value)}
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
                    isOptionValue(ASSET_CATEGORY_OPTIONS, key)
                  ) {
                    setCategory(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORY_OPTIONS.map((option) => (
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
                    isOptionValue(ASSET_STATUS_OPTIONS, key)
                  ) {
                    setStatus(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Condition</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a condition"
                selectedKey={condition}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isOptionValue(ASSET_CONDITION_OPTIONS, key)
                  ) {
                    setCondition(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CONDITION_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Criticality</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a criticality"
                selectedKey={criticality}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isOptionValue(ASSET_CRITICALITY_OPTIONS, key)
                  ) {
                    setCriticality(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CRITICALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
