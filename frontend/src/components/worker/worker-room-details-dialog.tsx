"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RoomResponseDto } from "@/types/room";

interface WorkerRoomDetailsDialogProps {
  trigger: ReactNode;
  room: RoomResponseDto;
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function WorkerRoomDetailsDialog({
  trigger,
  room,
}: WorkerRoomDetailsDialogProps) {
  return (
    <DialogTrigger>
      {trigger}
      <Dialog className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Room {room.roomNumber}</DialogTitle>
          <DialogDescription>Room details.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Building</dt>
            <dd>{room.building.name}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Capacity</dt>
            <dd>{room.capacity}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{formatEnum(room.roomType)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Criticality</dt>
            <dd>{formatEnum(room.criticality)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatCreatedAt(room.createdAt)}</dd>
          </div>
        </dl>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
