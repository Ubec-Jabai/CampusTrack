"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { AssetFormDialog } from "@/components/admin/admin-asset-form-dialog";
import { RoomDeleteDialog } from "@/components/admin/admin-room-delete-dialog";
import { RoomFormDialog } from "@/components/admin/admin-room-form-dialog";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BuildingResponseDto } from "@/types/building";
import { RoomCriticality } from "@/types/room";
import type { RoomResponseDto } from "@/types/room";

interface RoomsTableProps {
  rooms: RoomResponseDto[];
  buildings: BuildingResponseDto[];
  onReload: () => void;
  onDeleted: () => void;
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

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const criticalityRowClassName: Record<RoomCriticality, string> = {
  [RoomCriticality.LOW]: "bg-green-100/50",
  [RoomCriticality.NORMAL]: "bg-blue-100/50",
  [RoomCriticality.HIGH]: "bg-amber-100/50",
  [RoomCriticality.CRITICAL]: "bg-red-100/50",
};

export function RoomsTable({
  rooms,
  buildings,
  onReload,
  onDeleted,
}: RoomsTableProps) {
  return (
    <Table aria-label="Rooms">
      <TableHeader>
        <TableHead id="roomNumber" isRowHeader>
          Room
        </TableHead>
        <TableHead id="building">Building</TableHead>
        <TableHead id="roomType">Type</TableHead>
        <TableHead id="capacity">Capacity</TableHead>
        <TableHead id="criticality">Criticality</TableHead>
        <TableHead id="createdAt">Created</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={rooms}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            No rooms found.
          </div>
        )}
      >
        {(room) => (
          <TableRow
            id={room.id}
            className={criticalityRowClassName[room.criticality]}
          >
            <TableCell>
              <AssetFormDialog
                rooms={rooms}
                defaultRoomId={room.id}
                onSaved={onReload}
                trigger={
                  <Button
                    variant="link"
                    className="h-auto justify-start p-0"
                    aria-label={`Add asset to room ${room.roomNumber}`}
                  >
                    {room.roomNumber}
                  </Button>
                }
              />
            </TableCell>
            <TableCell>
              <LinkButton
                href={`/admin/buildings?name=${encodeURIComponent(
                  room.building.name
                )}`}
                variant="link"
                className="h-auto justify-start p-0"
              >
                {room.building.name}
              </LinkButton>
            </TableCell>
            <TableCell>{formatEnum(room.roomType)}</TableCell>
            <TableCell>{room.capacity}</TableCell>
            <TableCell>{formatEnum(room.criticality)}</TableCell>
            <TableCell>{formatCreatedAt(room.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <RoomFormDialog
                  room={room}
                  buildings={buildings}
                  onSaved={onReload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit room ${room.roomNumber}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <RoomDeleteDialog
                  room={room}
                  onDeleted={onDeleted}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete room ${room.roomNumber}`}
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  }
                />
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
