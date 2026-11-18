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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRoom, updateRoom } from "@/lib/api/api-rooms";
import type { BuildingResponseDto } from "@/types/building";
import {
  RoomCriticality,
  RoomType,
  type RoomResponseDto,
} from "@/types/room";

interface RoomFormDialogProps {
  trigger: ReactNode;
  buildings: BuildingResponseDto[];
  defaultBuildingId?: number;
  room?: RoomResponseDto;
  onSaved: () => void;
}

const ROOM_TYPE_OPTIONS: { id: RoomType; label: string }[] = [
  { id: RoomType.CLASSROOM, label: "Classroom" },
  { id: RoomType.LABORATORY, label: "Laboratory" },
  { id: RoomType.LECTURE_HALL, label: "Lecture hall" },
  { id: RoomType.OFFICE, label: "Office" },
  { id: RoomType.SERVER_ROOM, label: "Server room" },
  { id: RoomType.STORAGE, label: "Storage" },
  { id: RoomType.WORKSHOP, label: "Workshop" },
  { id: RoomType.CONFERENCE_ROOM, label: "Conference room" },
  { id: RoomType.RESTROOM, label: "Restroom" },
  { id: RoomType.OTHER, label: "Other" },
];

const CRITICALITY_OPTIONS: { id: RoomCriticality; label: string }[] = [
  { id: RoomCriticality.LOW, label: "Low" },
  { id: RoomCriticality.NORMAL, label: "Normal" },
  { id: RoomCriticality.HIGH, label: "High" },
  { id: RoomCriticality.CRITICAL, label: "Critical" },
];

function isRoomType(value: string): value is RoomType {
  return ROOM_TYPE_OPTIONS.some((option) => option.id === value);
}

function isRoomCriticality(value: string): value is RoomCriticality {
  return CRITICALITY_OPTIONS.some((option) => option.id === value);
}

export function RoomFormDialog({
  trigger,
  buildings,
  defaultBuildingId,
  room,
  onSaved,
}: RoomFormDialogProps) {
  const roomNumberId = useId();
  const capacityId = useId();
  const initialBuildingId = room?.building.id ?? defaultBuildingId ?? null;
  const [isOpen, setIsOpen] = useState(false);
  const [buildingId, setBuildingId] = useState<number | null>(initialBuildingId);
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber ?? "");
  const [capacity, setCapacity] = useState(
    room ? String(room.capacity) : ""
  );
  const [roomType, setRoomType] = useState<RoomType | null>(
    room?.roomType ?? null
  );
  const [criticality, setCriticality] = useState<RoomCriticality | null>(
    room?.criticality ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = room !== undefined;
  const submitLabel = isSubmitting
    ? "Saving..."
    : isEditing
      ? "Save changes"
      : "Create room";

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
      setBuildingId(room?.building.id ?? defaultBuildingId ?? null);
      setRoomNumber(room?.roomNumber ?? "");
      setCapacity(room ? String(room.capacity) : "");
      setRoomType(room?.roomType ?? null);
      setCriticality(room?.criticality ?? null);
      setError(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (buildingId === null) {
      setError("Building is required.");
      return;
    }

    const trimmedRoomNumber = roomNumber.trim();
    if (!trimmedRoomNumber) {
      setError("Room number is required.");
      return;
    }

    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    if (!roomType) {
      setError("Room type is required.");
      return;
    }

    if (!criticality) {
      setError("Criticality is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      buildingId,
      roomNumber: trimmedRoomNumber,
      capacity: parsedCapacity,
      roomType,
      criticality,
    };

    try {
      if (room) {
        await updateRoom(room.id, payload);
        toast.success("Room updated.");
      } else {
        await createRoom(payload);
        toast.success("Room created.");
      }

      setIsOpen(false);
      onSaved();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Failed to save room.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog isDismissable={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit room" : "New room"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this room's details."
              : "Add a new room to the campus."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel>Building</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a building"
                selectedKey={buildingId}
                onSelectionChange={(key) => {
                  if (typeof key === "number") {
                    setBuildingId(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} id={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={roomNumberId}>Room number</FieldLabel>
              <Input
                id={roomNumberId}
                name="roomNumber"
                value={roomNumber}
                maxLength={50}
                onChange={(event) => setRoomNumber(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={capacityId}>Capacity</FieldLabel>
              <Input
                id={capacityId}
                name="capacity"
                type="number"
                min={1}
                step={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>Room type</FieldLabel>
              <Select
                className="w-full"
                selectedKey={roomType}
                onSelectionChange={(key) => {
                  if (typeof key === "string" && isRoomType(key)) {
                    setRoomType(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPE_OPTIONS.map((option) => (
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
                selectedKey={criticality}
                onSelectionChange={(key) => {
                  if (typeof key === "string" && isRoomCriticality(key)) {
                    setCriticality(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRITICALITY_OPTIONS.map((option) => (
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
