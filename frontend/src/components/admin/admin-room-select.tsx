"use client";

import { useState } from "react";
import {
  Select,
  SelectInput,
  SelectItem,
  SelectList,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomResponseDto } from "@/types/room";

interface RoomSelectProps {
  rooms: RoomResponseDto[];
  selectedRoomId: number | null;
  onChange: (roomId: number | null) => void;
  placeholder: string;
  ariaLabel: string;
  allowClear?: boolean;
}

export function RoomSelect({
  rooms,
  selectedRoomId,
  onChange,
  placeholder,
  ariaLabel,
  allowClear = false,
}: RoomSelectProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filteredRooms = query
    ? rooms.filter((room) =>
        `${room.building.name} ${room.roomNumber}`
          .toLowerCase()
          .includes(query)
      )
    : rooms;

  return (
    <Select
      className="w-full"
      placeholder={placeholder}
      selectedKey={selectedRoomId ?? (allowClear ? 0 : null)}
      onSelectionChange={(key) => {
        if (key === 0) {
          onChange(null);
        } else if (typeof key === "number") {
          onChange(key);
        }
        setSearch("");
      }}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSearch("");
        }
      }}
      aria-label={ariaLabel}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectPopover>
        <SelectInput
          value={search}
          onChange={setSearch}
          aria-label={`Search ${ariaLabel.toLowerCase()}`}
        />
        <SelectList>
          {allowClear && <SelectItem id={0}>All rooms</SelectItem>}
          {filteredRooms.map((room) => (
            <SelectItem key={room.id} id={room.id}>
              {`${room.building.name} — ${room.roomNumber}`}
            </SelectItem>
          ))}
          {filteredRooms.length === 0 && (
            <SelectItem id="no-rooms" isDisabled>
              No rooms found
            </SelectItem>
          )}
        </SelectList>
      </SelectPopover>
    </Select>
  );
}
