"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { AssetSelect } from "@/components/admin/admin-asset-select";
import { RoomSelect } from "@/components/admin/admin-room-select";
import { UserSelect } from "@/components/admin/admin-user-select";
import {
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  isIncidentOptionValue,
} from "@/components/admin/admin-incident-options";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { searchAssets } from "@/lib/api/api-assets";
import { createIncident, updateIncident } from "@/lib/api/api-incidents";
import type { AssetResponseDto } from "@/types/asset";
import {
  IncidentCategory,
  IncidentStatus,
  type IncidentResponseDto,
  type UpdateIncidentRequestDto,
} from "@/types/incident";
import type { UserProfileResponseDto } from "@/types/profile";
import type { RoomResponseDto } from "@/types/room";

interface IncidentFormDialogProps {
  trigger: ReactNode;
  rooms: RoomResponseDto[];
  users: UserProfileResponseDto[];
  incident?: IncidentResponseDto;
  onSaved: () => void;
}

const YES_NO_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

async function loadAllAssetsForRoom(
  roomId: number
): Promise<AssetResponseDto[]> {
  const assets: AssetResponseDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await searchAssets({ roomId, page, size: 50 });
    assets.push(...result.content);
    totalPages = Math.max(result.page.totalPages, 1);
    page += 1;
  } while (page <= totalPages);

  return assets;
}

export function IncidentFormDialog({
  trigger,
  rooms,
  users,
  incident,
  onSaved,
}: IncidentFormDialogProps) {
  const incidentNumberId = useId();
  const descriptionId = useId();
  const affectedAreaId = useId();
  const photoId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(
    incident?.room?.id ?? incident?.roomId ?? null
  );
  const [assetId, setAssetId] = useState<number | null>(
    incident?.asset?.id ?? incident?.assetId ?? null
  );
  const [roomAssets, setRoomAssets] = useState<AssetResponseDto[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [reportedById, setReportedById] = useState<number | null>(
    incident?.reportedBy?.id ?? incident?.reportedById ?? null
  );
  const [category, setCategory] = useState<IncidentCategory | null>(
    incident?.category ?? null
  );
  const [status, setStatus] = useState<IncidentStatus | null>(
    incident?.status ?? null
  );
  const [incidentNumber, setIncidentNumber] = useState(
    incident?.incidentNumber ?? ""
  );
  const [description, setDescription] = useState(
    incident?.description ?? ""
  );
  const [safetyHazard, setSafetyHazard] = useState<boolean | null>(
    incident?.safetyHazard ?? null
  );
  const [operationalImpact, setOperationalImpact] = useState<boolean | null>(
    incident?.operationalImpact ?? null
  );
  const [affectedArea, setAffectedArea] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = incident !== undefined;
  const submitLabel = isSubmitting
    ? "Saving..."
    : isEditing
      ? "Save changes"
      : "Create incident";

  function handleOpenChange(open: boolean): void {
    setIsOpen(open);
    stopCamera();

    if (open) {
      setRoomId(incident?.room?.id ?? incident?.roomId ?? null);
      setAssetId(incident?.asset?.id ?? incident?.assetId ?? null);
      setReportedById(
        incident?.reportedBy?.id ?? incident?.reportedById ?? null
      );
      setCategory(incident?.category ?? null);
      setStatus(incident?.status ?? null);
      setIncidentNumber(incident?.incidentNumber ?? "");
      setDescription(incident?.description ?? "");
      setSafetyHazard(incident?.safetyHazard ?? null);
      setOperationalImpact(incident?.operationalImpact ?? null);
      setAffectedArea("");
      setPhoto(null);
      setError(null);
    }
  }

  function handleRoomChange(newRoomId: number | null): void {
    setRoomId(newRoomId);
    setAssetId(null);
  }

  useEffect(() => {
    let isMounted = false;

    function main() {
      if (!isOpen || roomId === null) {
        setRoomAssets([]);
        setIsLoadingAssets(false);
        return;
      }

      isMounted = true;
      setIsLoadingAssets(true);

      loadAllAssetsForRoom(roomId)
        .then((loaded) => {
          if (isMounted) {
            setRoomAssets(loaded);
          }
        })
        .catch((cause: unknown) => {
          if (isMounted) {
            console.error("Failed to load assets for room:", cause);
            setRoomAssets([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingAssets(false);
          }
        });
    }

    main();

    return () => {
      isMounted = false;
    };
  }, [isOpen, roomId]);

  useEffect(() => {
    const video = videoRef.current;

    if (!isCameraOpen || video === null) {
      return;
    }

    video.srcObject = streamRef.current;

    return () => {
      video.srcObject = null;
    };
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not supported on this device.");
      return;
    }

    setIsCameraStarting(true);
    setCameraError(null);

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setIsCameraOpen(true);
    } catch (cause: unknown) {
      if (cause instanceof DOMException && cause.name === "NotAllowedError") {
        setCameraError(
          "Camera permission denied. Allow camera access and try again."
        );
      } else if (cause instanceof DOMException && cause.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Unable to start the camera.");
      }
    } finally {
      setIsCameraStarting(false);
    }
  }

  function stopCamera(): void {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
    setCameraError(null);
  }

  function handleToggleCamera(): void {
    if (isCameraOpen) {
      stopCamera();
      return;
    }

    void startCamera();
  }

  function capturePhoto(): void {
    const video = videoRef.current;

    if (video === null) {
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is still starting. Try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (context === null) {
      setCameraError("Unable to capture the photo.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          setCameraError("Unable to capture the photo.");
          return;
        }

        setPhoto(
          new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
        );
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (roomId === null) {
      setError("Room is required.");
      return;
    }

    if (assetId === null) {
      setError("Asset is required.");
      return;
    }

    if (reportedById === null) {
      setError("Reporter is required.");
      return;
    }

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!status) {
      setError("Status is required.");
      return;
    }

    const trimmedIncidentNumber = incidentNumber.trim();
    if (!trimmedIncidentNumber) {
      setError("Incident number is required.");
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("Description is required.");
      return;
    }

    if (safetyHazard === null) {
      setError("Safety hazard is required.");
      return;
    }

    if (operationalImpact === null) {
      setError("Operational impact is required.");
      return;
    }

    const trimmedAffectedArea = affectedArea.trim();
    const parsedAffectedArea = Number(trimmedAffectedArea);
    if (
      trimmedAffectedArea !== "" &&
      (!Number.isInteger(parsedAffectedArea) || parsedAffectedArea <= 0)
    ) {
      setError("Affected area must be a positive number.");
      return;
    }

    if (!isEditing && trimmedAffectedArea === "") {
      setError("Affected area is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (incident) {
        const payload: UpdateIncidentRequestDto = {
          roomId,
          assetId,
          reportedById,
          category,
          status,
          description: trimmedDescription,
          safetyHazard,
          operationalImpact,
        };
        if (trimmedAffectedArea !== "") {
          payload.affectedArea = parsedAffectedArea;
        }
        if (trimmedIncidentNumber !== incident.incidentNumber) {
          payload.incidentNumber = trimmedIncidentNumber;
        }

        await updateIncident(incident.id, payload);
        toast.success("Incident updated.");
      } else {
        if (photo === null) {
          setError("Photo is required.");
          return;
        }

        await createIncident(
          {
            roomId,
            assetId,
            reportedById,
            category,
            status,
            incidentNumber: trimmedIncidentNumber,
            description: trimmedDescription,
            safetyHazard,
            operationalImpact,
            affectedArea: parsedAffectedArea,
          },
          photo
        );
        toast.success("Incident created.");
      }

      stopCamera();
      setIsOpen(false);
      onSaved();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to save incident."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <Dialog
        isDismissable={!isSubmitting}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit incident" : "New incident"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this incident's details."
              : "Report a new incident on campus."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel>Room</FieldLabel>
              <RoomSelect
                rooms={rooms}
                selectedRoomId={roomId}
                onChange={handleRoomChange}
                placeholder="Select a room"
                ariaLabel="Room"
              />
            </Field>
            <Field>
              <FieldLabel>Asset</FieldLabel>
              <AssetSelect
                assets={roomAssets}
                selectedAssetId={assetId}
                onChange={setAssetId}
                placeholder={
                  roomId === null
                    ? "Select a room first"
                    : "Select an asset"
                }
                ariaLabel="Asset"
                isDisabled={roomId === null}
                isLoading={isLoadingAssets}
              />
            </Field>
            <Field>
              <FieldLabel>Reported by</FieldLabel>
              <UserSelect
                users={users}
                selectedUserId={reportedById}
                onChange={setReportedById}
                placeholder="Select a reporter"
                ariaLabel="Reporter"
              />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a category"
                selectedKey={category}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isIncidentOptionValue(INCIDENT_CATEGORY_OPTIONS, key)
                  ) {
                    setCategory(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select a status"
                selectedKey={status}
                onSelectionChange={(key) => {
                  if (
                    typeof key === "string" &&
                    isIncidentOptionValue(INCIDENT_STATUS_OPTIONS, key)
                  ) {
                    setStatus(key);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={incidentNumberId}>Incident number</FieldLabel>
              <Input
                id={incidentNumberId}
                name="incidentNumber"
                value={incidentNumber}
                maxLength={50}
                onChange={(event) => setIncidentNumber(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
              <Textarea
                id={descriptionId}
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel>Safety hazard</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select an option"
                selectedKey={
                  safetyHazard === null ? null : safetyHazard ? "yes" : "no"
                }
                onSelectionChange={(key) => {
                  if (key === "yes") {
                    setSafetyHazard(true);
                  } else if (key === "no") {
                    setSafetyHazard(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Operational impact</FieldLabel>
              <Select
                className="w-full"
                placeholder="Select an option"
                selectedKey={
                  operationalImpact === null
                    ? null
                    : operationalImpact
                      ? "yes"
                      : "no"
                }
                onSelectionChange={(key) => {
                  if (key === "yes") {
                    setOperationalImpact(true);
                  } else if (key === "no") {
                    setOperationalImpact(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YES_NO_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={affectedAreaId}>Affected area</FieldLabel>
              <Input
                id={affectedAreaId}
                name="affectedArea"
                type="number"
                min={1}
                step={1}
                value={affectedArea}
                onChange={(event) => setAffectedArea(event.target.value)}
                required={!isEditing}
              />
            </Field>
            {!isEditing && (
              <Field>
                <FieldLabel htmlFor={photoId}>Photo</FieldLabel>
                <Input
                  id={photoId}
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setPhoto(event.target.files?.[0] ?? null)
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onPress={handleToggleCamera}
                  isDisabled={isSubmitting || isCameraStarting}
                >
                  {isCameraStarting
                    ? "Starting camera..."
                    : isCameraOpen
                      ? "Close camera"
                      : "Take photo"}
                </Button>
                {isCameraOpen && (
                  <div className="flex flex-col gap-2">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-3xl bg-black"
                    />
                    <Button
                      type="button"
                      onPress={capturePhoto}
                      isDisabled={isSubmitting}
                    >
                      Capture photo
                    </Button>
                  </div>
                )}
                {cameraError && <FieldError>{cameraError}</FieldError>}
                {photo && <FieldDescription>{photo.name}</FieldDescription>}
              </Field>
            )}
            {error && <FieldError>{error}</FieldError>}
            <DialogFooter>
              <DialogClose variant="outline" isDisabled={isSubmitting}>
                Cancel
              </DialogClose>
              <Button type="submit" isDisabled={isSubmitting}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </Dialog>
    </DialogTrigger>
  );
}
