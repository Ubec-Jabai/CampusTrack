"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { IncidentFormDialog } from "@/components/admin/admin-incident-form-dialog";
import {
  IncidentsTable,
  statusRowClassName,
} from "@/components/admin/admin-incidents-table";
import { RoomSelect } from "@/components/admin/admin-room-select";
import { UserSelect } from "@/components/admin/admin-user-select";
import {
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_PRIORITY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  isIncidentOptionValue,
} from "@/components/admin/admin-incident-options";
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
import { getUsers, searchUsers } from "@/lib/api/api-admin-users";
import { getIncidents, searchIncidents } from "@/lib/api/api-incidents";
import { getRooms } from "@/lib/api/api-rooms";
import { UserRole } from "@/types/auth";
import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  type IncidentResponseDto,
} from "@/types/incident";
import type { PageMeta } from "@/types/page";
import type { UserProfileResponseDto } from "@/types/profile";
import type { RoomResponseDto } from "@/types/room";

interface IncidentFilters {
  incidentNumber: string;
  roomId: number | null;
  assignedToId: number | null;
  category: IncidentCategory | null;
  priority: IncidentPriority | null;
  status: IncidentStatus | null;
  from: string;
  to: string;
}

const EMPTY_FILTERS: IncidentFilters = {
  incidentNumber: "",
  roomId: null,
  assignedToId: null,
  category: null,
  priority: null,
  status: null,
  from: "",
  to: "",
};

function hasActiveFilters(filters: IncidentFilters): boolean {
  return (
    filters.incidentNumber !== "" ||
    filters.roomId !== null ||
    filters.assignedToId !== null ||
    filters.category !== null ||
    filters.priority !== null ||
    filters.status !== null ||
    filters.from !== "" ||
    filters.to !== ""
  );
}

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

async function loadAllUsers(): Promise<UserProfileResponseDto[]> {
  const users: UserProfileResponseDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getUsers({ page, size: 50 });
    users.push(...result.content);
    totalPages = Math.max(result.page.totalPages, 1);
    page += 1;
  } while (page <= totalPages);

  return users;
}

async function loadAllWorkers(): Promise<UserProfileResponseDto[]> {
  const workers: UserProfileResponseDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await searchUsers({
      userRole: UserRole.WORKER,
      page,
      size: 50,
    });
    workers.push(...result.content);
    totalPages = Math.max(result.page.totalPages, 1);
    page += 1;
  } while (page <= totalPages);

  return workers;
}

export function IncidentsPageClient() {
  const initialIncidentNumber =
    useSearchParams().get("incidentNumber") ?? "";
  const [incidents, setIncidents] = useState<IncidentResponseDto[]>([]);
  const [rooms, setRooms] = useState<RoomResponseDto[]>([]);
  const [users, setUsers] = useState<UserProfileResponseDto[]>([]);
  const [workers, setWorkers] = useState<UserProfileResponseDto[]>([]);
  const [formDataError, setFormDataError] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<IncidentFilters>({
    ...EMPTY_FILTERS,
    incidentNumber: initialIncidentNumber,
  });
  const [appliedFilters, setAppliedFilters] = useState<IncidentFilters>({
    ...EMPTY_FILTERS,
    incidentNumber: initialIncidentNumber,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(
    async (targetPage: number, activeFilters: IncidentFilters) => {
      try {
        const result = hasActiveFilters(activeFilters)
          ? await searchIncidents({
              incidentNumber: activeFilters.incidentNumber || undefined,
              roomId: activeFilters.roomId ?? undefined,
              assignedToId: activeFilters.assignedToId ?? undefined,
              category: activeFilters.category ?? undefined,
              priority: activeFilters.priority ?? undefined,
              status: activeFilters.status ?? undefined,
              from: activeFilters.from || undefined,
              to: activeFilters.to || undefined,
              page: targetPage,
            })
          : await getIncidents({ page: targetPage });

        setIncidents(result.content);
        setPageMeta(result.page);
        setPage(targetPage);
        setError(null);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load incidents."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    const initialRequest = initialIncidentNumber
      ? searchIncidents({ incidentNumber: initialIncidentNumber, page: 1 })
      : getIncidents({ page: 1 });

    initialRequest
      .then((result) => {
        if (ignore) {
          return;
        }

        setIncidents(result.content);
        setPageMeta(result.page);
        setPage(1);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(
          cause instanceof Error ? cause.message : "Failed to load incidents."
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [initialIncidentNumber]);

  useEffect(() => {
    let ignore = false;

    Promise.all([loadAllRooms(), loadAllUsers(), loadAllWorkers()])
      .then(([roomList, userList, workerList]) => {
        if (ignore) {
          return;
        }

        setRooms(roomList);
        setUsers(userList);
        setWorkers(workerList);
        setFormDataError(null);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setFormDataError(
          cause instanceof Error
            ? cause.message
            : "Failed to load rooms and users."
        );
      });

    return () => {
      ignore = true;
    };
  }, []);

  function refresh(targetPage: number, activeFilters: IncidentFilters) {
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

  function handleDeleted() {
    const targetPage = incidents.length === 1 && page > 1 ? page - 1 : page;
    refresh(targetPage, appliedFilters);
  }

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Incidents</h1>
        <p className="text-muted-foreground">
          Create, update, and remove incidents, and assign them to workers.
        </p>
      </div>

      {formDataError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load form data</AlertTitle>
          <AlertDescription>{formDataError}</AlertDescription>
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
              <FieldLabel>Assigned worker</FieldLabel>
              <UserSelect
                users={workers}
                selectedUserId={filters.assignedToId}
                onChange={(assignedToId) =>
                  setFilters({ ...filters, assignedToId })
                }
                placeholder="Any worker"
                ariaLabel="Assigned worker"
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
        <IncidentFormDialog
          rooms={rooms}
          users={users}
          onSaved={handleReload}
          trigger={
            <Button isDisabled={rooms.length === 0 || users.length === 0}>
              New incident
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent>
          {!isLoading && !error && (
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-muted-foreground">Status colors</span>
              {INCIDENT_STATUS_OPTIONS.map((option) => (
                <span key={option.id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`size-4 rounded-sm border ${statusRowClassName[option.id]}`}
                  />
                  <span>{option.label}</span>
                </span>
              ))}
            </div>
          )}

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
            <IncidentsTable
              incidents={incidents}
              rooms={rooms}
              users={users}
              workers={workers}
              onReload={handleReload}
              onDeleted={handleDeleted}
            />
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
    </div>
  );
}
