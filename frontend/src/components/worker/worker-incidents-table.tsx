"use client";

import { ImageIcon } from "lucide-react";
import { IncidentPhotoDialog } from "@/components/admin/admin-incident-photo-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkerIncidentConfirmDialog } from "@/components/worker/worker-incident-confirm-dialog";
import { WorkerIncidentRejectDialog } from "@/components/worker/worker-incident-reject-dialog";
import {
  IncidentStatus,
  type IncidentResponseDto,
} from "@/types/incident";

interface WorkerIncidentsTableProps {
  incidents: IncidentResponseDto[];
  onUpdated: () => void;
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

function canInspect(status: IncidentStatus): boolean {
  return (
    status === IncidentStatus.REPORTED ||
    status === IncidentStatus.ASSIGNED ||
    status === IncidentStatus.IN_PROGRESS ||
    status === IncidentStatus.INSPECTING
  );
}

function canApprove(status: IncidentStatus): boolean {
  return status === IncidentStatus.PENDING_REVIEW;
}

function canReject(status: IncidentStatus): boolean {
  return canInspect(status) || canApprove(status);
}

export function WorkerIncidentsTable({
  incidents,
  onUpdated,
}: WorkerIncidentsTableProps) {
  return (
    <Table aria-label="My incidents">
      <TableHeader>
        <TableHead id="incidentNumber" isRowHeader>
          Incident
        </TableHead>
        <TableHead id="room">Room</TableHead>
        <TableHead id="category">Category</TableHead>
        <TableHead id="priority">Priority</TableHead>
        <TableHead id="status">Status</TableHead>
        <TableHead id="reason">Reason</TableHead>
        <TableHead id="createdAt">Created</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={incidents}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            No incidents assigned to you.
          </div>
        )}
      >
        {(incident) => (
          <TableRow id={incident.id}>
            <TableCell>{incident.incidentNumber}</TableCell>
            <TableCell>{incident.room ? incident.room.roomNumber : "—"}</TableCell>
            <TableCell>{formatEnum(incident.category)}</TableCell>
            <TableCell>{formatEnum(incident.priority)}</TableCell>
            <TableCell>{formatEnum(incident.status)}</TableCell>
            <TableCell className="max-w-64 whitespace-normal">
              {incident.rejectionReason ?? "—"}
            </TableCell>
            <TableCell>{formatCreatedAt(incident.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
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
                <WorkerIncidentConfirmDialog
                  incident={incident}
                  nextStatus={IncidentStatus.PENDING_REVIEW}
                  title="Mark incident inspected"
                  description={`Confirm that incident ${incident.incidentNumber} has been inspected. It will move to Pending review.`}
                  actionLabel="Inspect"
                  onUpdated={onUpdated}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={!canInspect(incident.status)}
                    >
                      Inspect
                    </Button>
                  }
                />
                <WorkerIncidentConfirmDialog
                  incident={incident}
                  nextStatus={IncidentStatus.APPROVED}
                  title="Approve incident"
                  description={`Approve incident ${incident.incidentNumber}.`}
                  actionLabel="Approve"
                  onUpdated={onUpdated}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={!canApprove(incident.status)}
                    >
                      Approve
                    </Button>
                  }
                />
                <WorkerIncidentRejectDialog
                  incident={incident}
                  onUpdated={onUpdated}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={!canReject(incident.status)}
                    >
                      Reject
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
