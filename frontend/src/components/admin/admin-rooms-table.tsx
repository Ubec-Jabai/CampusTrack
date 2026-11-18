"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RoomResponseDto } from "@/types/room";

interface RoomsTableProps {
  rooms: RoomResponseDto[];
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

export function RoomsTable({ rooms }: RoomsTableProps) {
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
          <TableRow id={room.id}>
            <TableCell>{room.roomNumber}</TableCell>
            <TableCell>{room.building.name}</TableCell>
            <TableCell>{formatEnum(room.roomType)}</TableCell>
            <TableCell>{room.capacity}</TableCell>
            <TableCell>{formatEnum(room.criticality)}</TableCell>
            <TableCell>{formatCreatedAt(room.createdAt)}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
