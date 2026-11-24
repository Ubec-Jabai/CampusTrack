"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { WorkerIncidentDetailsDialog } from "@/components/worker/worker-incident-details-dialog";
import { WorkerIncidentsTable } from "@/components/worker/worker-incidents-table";
import { RoomSelect } from "@/components/admin/admin-room-select";
import {
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_PRIORITY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  isIncidentOptionValue,
} from "@/components/admin/admin-incident-options";
import { useAuth } from "@/components/hooks";
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
import { getIncident, searchIncidents } from "@/lib/api/api-incidents";
import { getRooms } from "@/lib/api/api-rooms";
import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  type IncidentResponseDto,
} from "@/types/incident";
import type { PageMeta } from "@/types/page";
import type { RoomResponseDto } from "@/types/room";

function parseIncidentId(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

interface WorkerIncidentFilters {
  incidentNumber: string;
  description: string;
  roomId: number | null;
  category: IncidentCategory | null;
  priority: IncidentPriority | null;
  status: IncidentStatus | null;
  from: string;
  to: string;
}

const EMPTY_FILTERS: WorkerIncidentFilters = {
  incidentNumber: "",
  description: "",
  roomId: null,
  category: null,
  priority: null,
  status: null,
  from: "",
  to: "",
};

async function loadAllRooms(): Promise<RoomResponseDto[]> {
  const rooms: RoomResponseDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getRooms({ page, size: 50 });
    rooms.push(...result.content);
    totalPages = Math.max(result.page.totalPages, 1);
    page += 1;
  } while (page <= totalPages);

  return rooms;
}

export function WorkerIncidentsPageClient() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const initialIncidentId = parseIncidentId(
    useSearchParams().get("incidentId")
  );
  const [incidents, setIncidents] = useState<IncidentResponseDto[]>([]);
  const [detailIncident, setDetailIncident] =
    useState<IncidentResponseDto | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomResponseDto[]>([]);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<WorkerIncidentFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<WorkerIncidentFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workerId = user?.id;

  const loadIncidents = useCallback(
    async (targetPage: number, activeFilters: WorkerIncidentFilters) => {
      if (workerId === undefined) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await searchIncidents({
          assignedToId: workerId,
          incidentNumber: activeFilters.incidentNumber || undefined,
          description: activeFilters.description || undefined,
          roomId: activeFilters.roomId ?? undefined,
          category: activeFilters.category ?? undefined,
          priority: activeFilters.priority ?? undefined,
          status: activeFilters.status ?? undefined,
          from: activeFilters.from || undefined,
          to: activeFilters.to || undefined,
          page: targetPage,
        });

        setIncidents(result.content);
        setPageMeta(result.page);
        setPage(targetPage);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load incidents."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [workerId]
  );

  useEffect(() => {
    if (workerId === undefined) {
      return;
    }

    void loadIncidents(1, EMPTY_FILTERS);
  }, [workerId, loadIncidents]);

  useEffect(() => {
    let ignore = false;

    loadAllRooms()
      .then((roomList) => {
        if (ignore) {
          return;
        }

        setRooms(roomList);
        setRoomsError(null);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setRoomsError(
          cause instanceof Error ? cause.message : "Failed to load rooms."
        );
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (initialIncidentId === null) {
      return;
    }

    let ignore = false;

    getIncident(initialIncidentId)
      .then((incident) => {
        if (!ignore) {
          setDetailIncident(incident);
        }
      })
      .catch((cause: unknown) => {
        if (!ignore) {
          setDetailError(
            cause instanceof Error ? cause.message : "Failed to load incident."
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [initialIncidentId]);

  function refresh(targetPage: number, activeFilters: WorkerIncidentFilters) {
    setIsLoading(true);
    setError(null);
    void loadIncidents(targetPage, activeFilters);
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

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  if (isAuthLoading) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Loading your account...
      </p>
    );
  }

  if (workerId === undefined) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load your account</AlertTitle>
        <AlertDescription>
          Sign in again to manage your assigned incidents.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">My incidents</h1>
        <p className="text-muted-foreground">
          Inspect, approve, or reject incidents assigned to you.
        </p>
      </div>

      {roomsError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load rooms</AlertTitle>
          <AlertDescription>{roomsError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSearch} noValidate className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="incident-filter-number">
              Incident number
            </FieldLabel>
            <Input
              id="incident-filter-number"
              name="incidentNumber"
              value={filters.incidentNumber}
              maxLength={50}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  incidentNumber: event.target.value,
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="incident-filter-description">
              Description
            </FieldLabel>
            <Input
              id="incident-filter-description"
              name="description"
              value={filters.description}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  description: event.target.value,
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Room</FieldLabel>
            <RoomSelect
              rooms={rooms}
              selectedRoomId={filters.roomId}
              onChange={(roomId) => setFilters({ ...filters, roomId })}
              placeholder="Any room"
              ariaLabel="Room"
              allowClear
            />
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              className="w-full"
              selectedKey={filters.category ?? 0}
              onSelectionChange={(key) => {
                if (key === 0) {
                  setFilters({ ...filters, category: null });
                } else if (
                  typeof key === "string" &&
                  isIncidentOptionValue(INCIDENT_CATEGORY_OPTIONS, key)
                ) {
                  setFilters({ ...filters, category: key });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id={0}>Any category</SelectItem>
                {INCIDENT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.id} id={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Select
              className="w-full"
              selectedKey={filters.priority ?? 0}
              onSelectionChange={(key) => {
                if (key === 0) {
                  setFilters({ ...filters, priority: null });
                } else if (
                  typeof key === "string" &&
                  isIncidentOptionValue(INCIDENT_PRIORITY_OPTIONS, key)
                ) {
                  setFilters({ ...filters, priority: key });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id={0}>Any priority</SelectItem>
                {INCIDENT_PRIORITY_OPTIONS.map((option) => (
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
              selectedKey={filters.status ?? 0}
              onSelectionChange={(key) => {
                if (key === 0) {
                  setFilters({ ...filters, status: null });
                } else if (
                  typeof key === "string" &&
                  isIncidentOptionValue(INCIDENT_STATUS_OPTIONS, key)
                ) {
                  setFilters({ ...filters, status: key });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id={0}>Any status</SelectItem>
                {INCIDENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.id} id={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="incident-filter-from">Created from</FieldLabel>
            <Input
              id="incident-filter-from"
              name="from"
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters({ ...filters, from: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="incident-filter-to">Created to</FieldLabel>
            <Input
              id="incident-filter-to"
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

      {detailError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to open incident</AlertTitle>
          <AlertDescription>{detailError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Loading incidents...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 py-6">
              <Alert variant="destructive">
                <AlertTitle>Unable to load incidents</AlertTitle>
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
            <WorkerIncidentsTable incidents={incidents} onUpdated={handleReload} />
          )}
        </CardContent>

        {!isLoading && !error && (
          <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground">
              {pageMeta ? `${pageMeta.totalElements} incidents` : ""}
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

      {detailIncident && (
        <WorkerIncidentDetailsDialog incident={detailIncident} defaultOpen />
      )}
    </div>
  );
}
