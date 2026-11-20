"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
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
import type { IncidentResponseDto } from "@/types/incident";

interface IncidentPhotoDialogProps {
  trigger: ReactNode;
  incident: IncidentResponseDto;
}

export function IncidentPhotoDialog({
  trigger,
  incident,
}: IncidentPhotoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLink, setImageLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (!open) {
      setIsPreviewOpen(false);
      setImageLink(null);
      setError(null);
      return;
    }

    setImageLink(null);
    setError(null);
    setIsLoading(true);

    getIncidentPhoto(incident.id)
      .then((photo) => setImageLink(photo.link))
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error ? cause.message : "Failed to load the photo."
        )
      )
      .finally(() => setIsLoading(false));
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog
        className="sm:max-w-2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={isPreviewOpen}
      >
        <DialogHeader>
          <DialogTitle>Incident photo</DialogTitle>
          <DialogDescription>
            Photo attached to incident {incident.incidentNumber}.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <DialogClose variant="outline">Close</DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}
