"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { BuildingDeleteDialog } from "@/components/admin/admin-building-delete-dialog";
import { BuildingFormDialog } from "@/components/admin/admin-building-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BuildingResponseDto } from "@/types/building";

interface BuildingsTableProps {
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

export function BuildingsTable({
  buildings,
  onReload,
  onDeleted,
}: BuildingsTableProps) {
  return (
    <Table aria-label="Buildings">
      <TableHeader>
        <TableHead id="name" isRowHeader>
          Name
        </TableHead>
        <TableHead id="id">ID</TableHead>
        <TableHead id="createdAt">Created</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={buildings}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            No buildings found.
          </div>
        )}
      >
        {(building) => (
          <TableRow id={building.id}>
            <TableCell>{building.name}</TableCell>
            <TableCell>{building.id}</TableCell>
            <TableCell>{formatCreatedAt(building.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <BuildingFormDialog
                  building={building}
                  onSaved={onReload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${building.name}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <BuildingDeleteDialog
                  building={building}
                  onDeleted={onDeleted}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${building.name}`}
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
