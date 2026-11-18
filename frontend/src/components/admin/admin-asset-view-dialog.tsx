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
import type { AssetResponseDto } from "@/types/asset";
import type { RoomResponseDto } from "@/types/room";

interface AssetViewDialogProps {
  trigger: ReactNode;
  asset: AssetResponseDto;
  rooms: RoomResponseDto[];
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AssetViewDialog({
  trigger,
  asset,
  rooms,
}: AssetViewDialogProps) {
  const room = asset.room;
  const matchingRoom = room
    ? rooms.find((item) => item.id === room.id)
    : undefined;
  const roomLabel = !room
    ? "Unassigned"
    : matchingRoom
      ? `${matchingRoom.building.name} — ${room.roomNumber}`
      : room.roomNumber;

  return (
    <DialogTrigger>
      {trigger}
      <Dialog className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
          <DialogDescription>Asset details and identifiers.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Room</dt>
            <dd>{roomLabel}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Category</dt>
            <dd>{formatEnum(asset.category)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{formatEnum(asset.status)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Condition</dt>
            <dd>{formatEnum(asset.condition)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Criticality</dt>
            <dd>{formatEnum(asset.criticality)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Brand</dt>
            <dd>{asset.brand || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Model</dt>
            <dd>{asset.model || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Serial number</dt>
            <dd>{asset.serialNumber || "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Created</dt>
            <dd>
              {new Date(asset.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
        </dl>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
