"use client";

import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { AssetDeleteDialog } from "@/components/admin/admin-asset-delete-dialog";
import { AssetFormDialog } from "@/components/admin/admin-asset-form-dialog";
import { AssetViewDialog } from "@/components/admin/admin-asset-view-dialog";
import { IncidentFormDialog } from "@/components/admin/admin-incident-form-dialog";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AssetResponseDto } from "@/types/asset";
import type { UserProfileResponseDto } from "@/types/profile";
import type { RoomResponseDto } from "@/types/room";

interface AssetsTableProps {
  assets: AssetResponseDto[];
  rooms: RoomResponseDto[];
  users: UserProfileResponseDto[];
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

export function AssetsTable({
  assets,
  rooms,
  users,
  onReload,
  onDeleted,
}: AssetsTableProps) {
  return (
    <Table aria-label="Assets">
      <TableHeader>
        <TableHead id="name" isRowHeader>
          Name
        </TableHead>
        <TableHead id="room">Room</TableHead>
        <TableHead id="category">Category</TableHead>
        <TableHead id="status">Status</TableHead>
        <TableHead id="createdAt">Created</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={assets}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            No assets found.
          </div>
        )}
      >
        {(asset) => (
          <TableRow id={asset.id}>
            <TableCell>
              <IncidentFormDialog
                rooms={rooms}
                users={users}
                defaultRoomId={asset.room?.id ?? asset.roomId ?? null}
                defaultAssetId={asset.id}
                onSaved={onReload}
                trigger={
                  <Button
                    variant="link"
                    className="h-auto justify-start p-0"
                    isDisabled={users.length === 0}
                    aria-label={`Report incident for ${asset.name}`}
                  >
                    {asset.name}
                  </Button>
                }
              />
            </TableCell>
            <TableCell>
              {asset.room ? (
                <LinkButton
                  href={`/admin/rooms?roomNumber=${encodeURIComponent(
                    asset.room.roomNumber
                  )}`}
                  variant="link"
                  className="h-auto justify-start p-0"
                >
                  {asset.room.roomNumber}
                </LinkButton>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>{formatEnum(asset.category)}</TableCell>
            <TableCell>{formatEnum(asset.status)}</TableCell>
            <TableCell>{formatCreatedAt(asset.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <AssetViewDialog
                  asset={asset}
                  rooms={rooms}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`View asset ${asset.name}`}
                    >
                      <EyeIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <AssetFormDialog
                  asset={asset}
                  rooms={rooms}
                  onSaved={onReload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit asset ${asset.name}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <AssetDeleteDialog
                  asset={asset}
                  onDeleted={onDeleted}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete asset ${asset.name}`}
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
