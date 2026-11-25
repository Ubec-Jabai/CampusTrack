"use client";

import { ImageIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { IncidentAssignDialog } from "@/components/admin/admin-incident-assign-dialog";
import { IncidentDeleteDialog } from "@/components/admin/admin-incident-delete-dialog";
import { IncidentFormDialog } from "@/components/admin/admin-incident-form-dialog";
import { IncidentPhotoDialog } from "@/components/admin/admin-incident-photo-dialog";
import { getUserDisplayName } from "@/components/admin/admin-user-select";
import { Button, LinkButton } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncidentStatus } from "@/types/incident";
import type { IncidentResponseDto } from "@/types/incident";
import type { UserProfileResponseDto } from "@/types/profile";
import type { RoomResponseDto } from "@/types/room";

interface IncidentsTableProps {
  incidents: IncidentResponseDto[];
  rooms: RoomResponseDto[];
  users: UserProfileResponseDto[];
  workers: UserProfileResponseDto[];
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

function formatEnum(value: string | null): string {
  if (value === null) {
    return "—";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const statusRowClassName: Record<IncidentStatus, string> = {
  [IncidentStatus.REPORTED]: "bg-amber-100/50",
  [IncidentStatus.INSPECTING]: "bg-yellow-100/50",
  [IncidentStatus.PENDING_REVIEW]: "bg-violet-100/50",
  [IncidentStatus.REJECTED]: "bg-red-100/50",
  [IncidentStatus.DECLINED]: "bg-gray-100/50",
  [IncidentStatus.APPROVED]: "bg-green-100/50",
  [IncidentStatus.ASSIGNED]: "bg-indigo-100/50",
  [IncidentStatus.IN_PROGRESS]: "bg-blue-100/50",
  [IncidentStatus.RESOLVED]: "bg-emerald-100/50",
};

export function IncidentsTable({
  incidents,
  rooms,
  users,
  workers,
  onReload,
  onDeleted,
}: IncidentsTableProps) {
  return (
    <Table aria-label="Incidents">
      <TableHeader>
        <TableHead id="incidentNumber" isRowHeader>
          Incident
        </TableHead>
        <TableHead id="room">Room</TableHead>
        <TableHead id="asset">Asset</TableHead>
        <TableHead id="reportedBy">Reported by</TableHead>
        <TableHead id="assigned">Assigned</TableHead>
        <TableHead id="category">Category</TableHead>
        <TableHead id="priority">Priority</TableHead>
        <TableHead id="status">Status</TableHead>
        <TableHead id="createdAt">Created</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={incidents}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            No incidents found.
          </div>
        )}
      >
        {(incident) => (
          <TableRow id={incident.id} className={statusRowClassName[incident.status]}>
            <TableCell>{incident.incidentNumber}</TableCell>
            <TableCell>
              {incident.room ? (
                <LinkButton
                  href={`/admin/rooms?roomNumber=${encodeURIComponent(
                    incident.room.roomNumber
                  )}`}
                  variant="link"
                  className="h-auto justify-start p-0"
                >
                  {incident.room.roomNumber}
                </LinkButton>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              {incident.asset ? (
                <LinkButton
                  href={`/admin/assets?assetId=${incident.asset.id}`}
                  variant="link"
                  className="h-auto justify-start p-0"
                >
                  {incident.asset.name}
                </LinkButton>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              {incident.reportedBy
                ? getUserDisplayName(incident.reportedBy)
                : "—"}
            </TableCell>
            <TableCell>
              {incident.assigned
                ? getUserDisplayName(incident.assigned)
                : "Unassigned"}
            </TableCell>
            <TableCell>{formatEnum(incident.category)}</TableCell>
            <TableCell>{formatEnum(incident.priority)}</TableCell>
            <TableCell>{formatEnum(incident.status)}</TableCell>
            <TableCell>{formatCreatedAt(incident.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <IncidentAssignDialog
                  incident={incident}
                  workers={workers}
                  onAssigned={onReload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Assign incident ${incident.incidentNumber}`}
                      isDisabled={workers.length === 0}
                    >
                      Assign
                    </Button>
                  }
                />
                {incident.photoPath !== null && (
                  <IncidentPhotoDialog
                    incident={incident}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`View photo for incident ${incident.incidentNumber}`}
                      >
                        <ImageIcon aria-hidden="true" />
                      </Button>
                    }
                  />
                )}
                <IncidentFormDialog
                  incident={incident}
                  rooms={rooms}
                  users={users}
                  onSaved={onReload}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit incident ${incident.incidentNumber}`}
                    >
                      <PencilIcon aria-hidden="true" />
                    </Button>
                  }
                />
                <IncidentDeleteDialog
                  incident={incident}
                  onDeleted={onDeleted}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete incident ${incident.incidentNumber}`}
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
