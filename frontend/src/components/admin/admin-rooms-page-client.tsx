"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { RoomFormDialog } from "@/components/admin/admin-room-form-dialog";
import {
  RoomsTable,
  criticalityRowClassName,
} from "@/components/admin/admin-rooms-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBuildings } from "@/lib/api/api-buildings";
import { getRooms, searchRooms } from "@/lib/api/api-rooms";
import type { BuildingResponseDto } from "@/types/building";
import {
  RoomCriticality,
  RoomType,
  type RoomResponseDto,
} from "@/types/room";
import type { PageMeta } from "@/types/page";

interface RoomFilters {
  roomNumber: string;
  capacity: string;
  roomType: RoomType | null;
  criticality: RoomCriticality | null;
  from: string;
  to: string;
}

const EMPTY_FILTERS: RoomFilters = {
  roomNumber: "",
  capacity: "",
  roomType: null,
  criticality: null,
  from: "",
  to: "",
};

const ROOM_TYPE_OPTIONS: { id: RoomType; label: string }[] = [
  { id: RoomType.CLASSROOM, label: "Classroom" },
  { id: RoomType.LABORATORY, label: "Laboratory" },
  { id: RoomType.LECTURE_HALL, label: "Lecture hall" },
  { id: RoomType.OFFICE, label: "Office" },
  { id: RoomType.SERVER_ROOM, label: "Server room" },
  { id: RoomType.STORAGE, label: "Storage" },
  { id: RoomType.WORKSHOP, label: "Workshop" },
  { id: RoomType.CONFERENCE_ROOM, label: "Conference room" },
  { id: RoomType.RESTROOM, label: "Restroom" },
  { id: RoomType.OTHER, label: "Other" },
];

const CRITICALITY_OPTIONS: { id: RoomCriticality; label: string }[] = [
  { id: RoomCriticality.LOW, label: "Low" },
  { id: RoomCriticality.NORMAL, label: "Normal" },
  { id: RoomCriticality.HIGH, label: "High" },
  { id: RoomCriticality.CRITICAL, label: "Critical" },
];

function isOptionValue<T extends string>(
  options: { id: T; label: string }[],
  value: string
): value is T {
  return options.some((option) => option.id === value);
}

export function RoomsPageClient() {
  const initialRoomNumber = useSearchParams().get("roomNumber") ?? "";
  const [rooms, setRooms] = useState<RoomResponseDto[]>([]);
  const [buildings, setBuildings] = useState<BuildingResponseDto[]>([]);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RoomFilters>({
    ...EMPTY_FILTERS,
    roomNumber: initialRoomNumber,
  });
  const [appliedFilters, setAppliedFilters] = useState<RoomFilters>({
    ...EMPTY_FILTERS,
    roomNumber: initialRoomNumber,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(
    async (targetPage: number, activeFilters: RoomFilters) => {
      try {
        const hasFilters =
          activeFilters.roomNumber !== "" ||
          activeFilters.capacity !== "" ||
          activeFilters.roomType !== null ||
          activeFilters.criticality !== null ||
          activeFilters.from !== "" ||
          activeFilters.to !== "";

        const result = hasFilters
          ? await searchRooms({
              roomNumber: activeFilters.roomNumber || undefined,
              capacity:
                activeFilters.capacity === ""
                  ? undefined
                  : Number(activeFilters.capacity),
              roomType: activeFilters.roomType ?? undefined,
              criticality: activeFilters.criticality ?? undefined,
              from: activeFilters.from || undefined,
              to: activeFilters.to || undefined,
              page: targetPage,
            })
          : await getRooms({ page: targetPage });

        setRooms(result.content);
        setPageMeta(result.page);
        setPage(targetPage);
        setError(null);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load rooms."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    const initialRequest = initialRoomNumber
      ? searchRooms({ roomNumber: initialRoomNumber, page: 1 })
      : getRooms({ page: 1 });

    initialRequest
      .then((result) => {
        if (ignore) {
          return;
        }

        setRooms(result.content);
        setPageMeta(result.page);
        setPage(1);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(cause instanceof Error ? cause.message : "Failed to load rooms.");
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [initialRoomNumber]);

  useEffect(() => {
    let ignore = false;

    getBuildings({ page: 1, size: 100 })
      .then((result) => {
        if (ignore) {
          return;
        }

        setBuildings(result.content);
        setBuildingsError(null);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setBuildingsError(
          cause instanceof Error ? cause.message : "Failed to load buildings."
        );
      });

    return () => {
      ignore = true;
    };
  }, []);

  function refresh(targetPage: number, activeFilters: RoomFilters) {
    setIsLoading(true);
    setError(null);
    void loadRooms(targetPage, activeFilters);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(filters);
    refresh(1, filters);
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    refresh(1, EMPTY_FILTERS);
  }

  function handlePrevious() {
    refresh(page - 1, appliedFilters);
  }

  function handleNext() {
    refresh(page + 1, appliedFilters);
  }

  function handleReload() {
    refresh(page, appliedFilters);
  }

  function handleDeleted() {
    const targetPage = rooms.length === 1 && page > 1 ? page - 1 : page;
    refresh(targetPage, appliedFilters);
  }

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Rooms</h1>
        <p className="text-muted-foreground">
          Create, update, and remove rooms across campus buildings.
        </p>
      </div>

      {buildingsError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load buildings</AlertTitle>
          <AlertDescription>{buildingsError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <form
          onSubmit={handleSearch}
          noValidate
          className="flex flex-1 flex-col gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="room-filter-number">Room number</FieldLabel>
              <Input
                id="room-filter-number"
                name="roomNumber"
                value={filters.roomNumber}
                maxLength={50}
                onChange={(event) =>
                  setFilters({ ...filters, roomNumber: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="room-filter-capacity">Capacity</FieldLabel>
              <Input
                id="room-filter-capacity"
                name="capacity"
                type="number"
                min={1}
                value={filters.capacity}
                onChange={(event) =>
                  setFilters({ ...filters, capacity: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Room type</FieldLabel>
              <Select
                className="w-full"
                selectedKey={filters.roomType ?? 0}
                onSelectionChange={(key) => {
                  if (key === 0) {
                    setFilters({ ...filters, roomType: null });
                  } else if (
                    typeof key === "string" &&
                    isOptionValue(ROOM_TYPE_OPTIONS, key)
                  ) {
                    setFilters({ ...filters, roomType: key });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id={0}>Any type</SelectItem>
                  {ROOM_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Criticality</FieldLabel>
              <Select
                className="w-full"
                selectedKey={filters.criticality ?? 0}
                onSelectionChange={(key) => {
                  if (key === 0) {
                    setFilters({ ...filters, criticality: null });
                  } else if (
                    typeof key === "string" &&
                    isOptionValue(CRITICALITY_OPTIONS, key)
                  ) {
                    setFilters({ ...filters, criticality: key });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id={0}>Any criticality</SelectItem>
                  {CRITICALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="room-filter-from">Created from</FieldLabel>
              <Input
                id="room-filter-from"
                name="from"
                type="date"
                value={filters.from}
                onChange={(event) =>
                  setFilters({ ...filters, from: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="room-filter-to">Created to</FieldLabel>
              <Input
                id="room-filter-to"
                name="to"
                type="date"
                value={filters.to}
                onChange={(event) =>
                  setFilters({ ...filters, to: event.target.value })
                }
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="submit" isDisabled={isLoading}>
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onPress={handleClear}
              isDisabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>
        <RoomFormDialog
          buildings={buildings}
          onSaved={handleReload}
          trigger={
            <Button isDisabled={buildings.length === 0}>New room</Button>
          }
        />
      </div>

      <Card>
        <CardContent>
          {!isLoading && !error && (
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-muted-foreground">Criticality colors</span>
              {CRITICALITY_OPTIONS.map((option) => (
                <span key={option.id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`size-4 rounded-sm border ${criticalityRowClassName[option.id]}`}
                  />
                  <span>{option.label}</span>
                </span>
              ))}
            </div>
          )}

          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Loading rooms...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 py-6">
              <Alert variant="destructive">
                <AlertTitle>Unable to load rooms</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div>
                <Button
                  variant="outline"
                  onPress={() => refresh(page, appliedFilters)}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <RoomsTable
              rooms={rooms}
              buildings={buildings}
              onReload={handleReload}
              onDeleted={handleDeleted}
            />
          )}
        </CardContent>

        {!isLoading && !error && (
          <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground">
              {pageMeta ? `${pageMeta.totalElements} rooms` : ""}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page <= 1}
                onPress={handlePrevious}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page >= totalPages}
                onPress={handleNext}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
