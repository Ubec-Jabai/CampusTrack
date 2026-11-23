"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { getUserDisplayName } from "@/components/admin/admin-user-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getIncidentPhoto } from "@/lib/api/api-incidents";
import type { AssetResponseDto } from "@/types/asset";
import type { IncidentResponseDto } from "@/types/incident";
import type { RoomResponseDto } from "@/types/room";

interface WorkerIncidentDetailsDialogProps {
  trigger?: ReactNode;
  incident: IncidentResponseDto;
  defaultOpen?: boolean;
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

function formatDateTime(value: string | null): string {
  if (value === null) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRoom(room: RoomResponseDto | null): string {
  if (room === null) {
    return "—";
  }

  return `${room.building.name} — ${room.roomNumber}`;
}

function formatAsset(asset: AssetResponseDto | null): string {
  if (asset === null) {
    return "—";
  }

  return asset.serialNumber
    ? `${asset.name} (${asset.serialNumber})`
    : asset.name;
}

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

export function WorkerIncidentDetailsDialog({
  trigger,
  incident,
  defaultOpen = false,
}: WorkerIncidentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [imageLink, setImageLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(
    defaultOpen && incident.photoPath !== null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPortal, setPreviewPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const container = document.createElement("div");

    function main() {
      // React Aria marks everything outside the modal inert. The top-layer
      // attribute keeps the photo preview portal interactive.
      container.setAttribute("data-react-aria-top-layer", "");
      document.body.appendChild(container);
      setPreviewPortal(container);
    }

    main();

    return () => container.remove();
  }, []);

  useEffect(() => {
    if (!isOpen || incident.photoPath === null) {
      return;
    }

    let ignore = false;

    getIncidentPhoto(incident.id)
      .then((photo) => {
        if (!ignore) {
          setImageLink(photo.link);
        }
      })
      .catch((cause: unknown) => {
        if (!ignore) {
          setError(
            cause instanceof Error ? cause.message : "Failed to load the photo."
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, incident.id, incident.photoPath]);

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);
    setIsPreviewOpen(false);
    setImageLink(null);
    setError(null);
    setIsLoading(open && incident.photoPath !== null);
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={isPreviewOpen}
      >
        <DialogHeader>
          <DialogTitle>Incident {incident.incidentNumber}</DialogTitle>
          <DialogDescription>Full incident details.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">Photo</p>
          {isLoading && <p className="text-muted-foreground">Loading photo...</p>}
          {!isLoading && error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to load photo</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && imageLink && (
            <PhotoProvider
              portalContainer={previewPortal ?? undefined}
              onVisibleChange={setIsPreviewOpen}
            >
              <PhotoView src={imageLink}>
                <Image
                  src={imageLink}
                  alt={`Incident ${incident.incidentNumber} photo`}
                  width={1200}
                  height={800}
                  unoptimized
                  className="h-auto w-full cursor-zoom-in rounded-3xl object-contain"
                />
              </PhotoView>
            </PhotoProvider>
          )}
          {!isLoading && !error && !imageLink && (
            <p className="text-muted-foreground">No photo attached.</p>
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Room</dt>
            <dd>{formatRoom(incident.room)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Asset</dt>
            <dd>{formatAsset(incident.asset)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Reported by</dt>
            <dd>
              {incident.reportedBy
                ? getUserDisplayName(incident.reportedBy)
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Assigned to</dt>
            <dd>
              {incident.assigned ? getUserDisplayName(incident.assigned) : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Category</dt>
            <dd>{formatEnum(incident.category)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Priority</dt>
            <dd>{formatEnum(incident.priority)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{formatEnum(incident.status)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Safety hazard</dt>
            <dd>{formatBoolean(incident.safetyHazard)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Operational impact</dt>
            <dd>{formatBoolean(incident.operationalImpact)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDateTime(incident.createdAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Assigned at</dt>
            <dd>{formatDateTime(incident.assignedAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Evaluated at</dt>
            <dd>{formatDateTime(incident.evaluatedAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Inspected by</dt>
            <dd>
              {incident.inspectedBy
                ? getUserDisplayName(incident.inspectedBy)
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Inspected at</dt>
            <dd>{formatDateTime(incident.inspectedAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Approved at</dt>
            <dd>{formatDateTime(incident.approvedAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Resolved at</dt>
            <dd>{formatDateTime(incident.resolvedAt)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Closed at</dt>
            <dd>{formatDateTime(incident.closedAt)}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <dt className="text-muted-foreground">Description</dt>
            <dd className="whitespace-pre-wrap">{incident.description}</dd>
          </div>
          {incident.rejectionReason !== null && (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="text-muted-foreground">Rejection reason</dt>
              <dd className="whitespace-pre-wrap">
                {incident.rejectionReason}
              </dd>
            </div>
          )}
        </dl>

        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
