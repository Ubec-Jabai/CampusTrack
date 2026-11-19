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
import type { UserProfileResponseDto } from "@/types/profile";

interface UserSelectProps {
  users: UserProfileResponseDto[];
  selectedUserId: number | null;
  onChange: (userId: number | null) => void;
  placeholder: string;
  ariaLabel: string;
  allowClear?: boolean;
}

export function getUserDisplayName(user: UserProfileResponseDto): string {
  const profile = user.profile;
  if (!profile) {
    return user.email;
  }

  const name = [profile.firstName, profile.lastName]
    .filter((part) => part !== "")
    .join(" ");
  return name || user.email;
}

export function UserSelect({
  users,
  selectedUserId,
  onChange,
  placeholder,
  ariaLabel,
  allowClear = false,
}: UserSelectProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filteredUsers = query
    ? users.filter((user) =>
        `${getUserDisplayName(user)} ${user.email}`
          .toLowerCase()
          .includes(query)
      )
    : users;

  return (
    <Select
      className="w-full"
      placeholder={placeholder}
      selectedKey={selectedUserId ?? (allowClear ? 0 : null)}
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
          {allowClear && <SelectItem id={0}>Any user</SelectItem>}
          {filteredUsers.map((user) => (
            <SelectItem key={user.id} id={user.id}>
              {getUserDisplayName(user)}
            </SelectItem>
          ))}
          {filteredUsers.length === 0 && (
            <SelectItem id="no-users" isDisabled>
              No users found
            </SelectItem>
          )}
        </SelectList>
      </SelectPopover>
    </Select>
  );
}
