"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AssetFormDialog } from "@/components/admin/admin-asset-form-dialog";
import { AssetsTable } from "@/components/admin/admin-assets-table";
import { RoomSelect } from "@/components/admin/admin-room-select";
import {
  ASSET_CATEGORY_OPTIONS,
  ASSET_CONDITION_OPTIONS,
  ASSET_CRITICALITY_OPTIONS,
  isOptionValue,
} from "@/components/admin/admin-asset-options";
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
import { getAssets, searchAssets } from "@/lib/api/api-assets";
import { getRooms } from "@/lib/api/api-rooms";
import {
  AssetCategory,
  AssetCondition,
  AssetCriticality,
  type AssetResponseDto,
} from "@/types/asset";
import type { RoomResponseDto } from "@/types/room";
import type { PageMeta } from "@/types/page";

interface AssetFilters {
  roomId: number | null;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  category: AssetCategory | null;
  condition: AssetCondition | null;
  criticality: AssetCriticality | null;
  from: string;
  to: string;
}

const EMPTY_FILTERS: AssetFilters = {
  roomId: null,
  name: "",
  brand: "",
  model: "",
  serialNumber: "",
  category: null,
  condition: null,
  criticality: null,
  from: "",
  to: "",
};

function hasActiveFilters(filters: AssetFilters): boolean {
  return (
    filters.roomId !== null ||
    filters.name !== "" ||
    filters.brand !== "" ||
    filters.model !== "" ||
    filters.serialNumber !== "" ||
    filters.category !== null ||
    filters.condition !== null ||
    filters.criticality !== null ||
    filters.from !== "" ||
    filters.to !== ""
  );
}

async function loadAllRooms(): Promise<RoomResponseDto[]> {
  const rooms: RoomResponseDto[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await getRooms({ page, size: 100 });
    rooms.push(...result.content);
    totalPages = Math.max(result.page.totalPages, 1);
    page += 1;
  } while (page <= totalPages);

  return rooms;
}

export function AssetsPageClient() {
  const [assets, setAssets] = useState<AssetResponseDto[]>([]);
  const [rooms, setRooms] = useState<RoomResponseDto[]>([]);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AssetFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<AssetFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(
    async (targetPage: number, activeFilters: AssetFilters) => {
      try {
        const result = hasActiveFilters(activeFilters)
          ? await searchAssets({
              roomId: activeFilters.roomId ?? undefined,
              name: activeFilters.name || undefined,
              brand: activeFilters.brand || undefined,
              model: activeFilters.model || undefined,
              serialNumber: activeFilters.serialNumber || undefined,
              category: activeFilters.category ?? undefined,
              condition: activeFilters.condition ?? undefined,
              criticality: activeFilters.criticality ?? undefined,
              from: activeFilters.from || undefined,
              to: activeFilters.to || undefined,
              page: targetPage,
            })
          : await getAssets({ page: targetPage });

        setAssets(result.content);
        setPageMeta(result.page);
        setPage(targetPage);
        setError(null);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load assets."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    getAssets({ page: 1 })
      .then((result) => {
        if (ignore) {
          return;
        }

        setAssets(result.content);
        setPageMeta(result.page);
        setPage(1);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(
          cause instanceof Error ? cause.message : "Failed to load assets."
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    loadAllRooms()
      .then((result) => {
        if (ignore) {
          return;
        }

        setRooms(result);
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

  function refresh(targetPage: number, activeFilters: AssetFilters) {
    setIsLoading(true);
    setError(null);
    void loadAssets(targetPage, activeFilters);
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
    const targetPage = assets.length === 1 && page > 1 ? page - 1 : page;
    refresh(targetPage, appliedFilters);
  }

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Assets</h1>
        <p className="text-muted-foreground">
          Create, update, and remove campus assets.
        </p>
      </div>

      {roomsError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load rooms</AlertTitle>
          <AlertDescription>{roomsError}</AlertDescription>
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
              <FieldLabel htmlFor="asset-filter-name">Name</FieldLabel>
              <Input
                id="asset-filter-name"
                name="name"
                value={filters.name}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, name: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-filter-brand">Brand</FieldLabel>
              <Input
                id="asset-filter-brand"
                name="brand"
                value={filters.brand}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, brand: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-filter-model">Model</FieldLabel>
              <Input
                id="asset-filter-model"
                name="model"
                value={filters.model}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, model: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-filter-serial">
                Serial number
              </FieldLabel>
              <Input
                id="asset-filter-serial"
                name="serialNumber"
                value={filters.serialNumber}
                maxLength={100}
                onChange={(event) =>
                  setFilters({ ...filters, serialNumber: event.target.value })
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
                    isOptionValue(ASSET_CATEGORY_OPTIONS, key)
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
                  {ASSET_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Condition</FieldLabel>
              <Select
                className="w-full"
                selectedKey={filters.condition ?? 0}
                onSelectionChange={(key) => {
                  if (key === 0) {
                    setFilters({ ...filters, condition: null });
                  } else if (
                    typeof key === "string" &&
                    isOptionValue(ASSET_CONDITION_OPTIONS, key)
                  ) {
                    setFilters({ ...filters, condition: key });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id={0}>Any condition</SelectItem>
                  {ASSET_CONDITION_OPTIONS.map((option) => (
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
                    isOptionValue(ASSET_CRITICALITY_OPTIONS, key)
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
                  {ASSET_CRITICALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} id={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-filter-from">Created from</FieldLabel>
              <Input
                id="asset-filter-from"
                name="from"
                type="date"
                value={filters.from}
                onChange={(event) =>
                  setFilters({ ...filters, from: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-filter-to">Created to</FieldLabel>
              <Input
                id="asset-filter-to"
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
        <AssetFormDialog
          rooms={rooms}
          onSaved={handleReload}
          trigger={<Button isDisabled={rooms.length === 0}>New asset</Button>}
        />
      </div>

      <Card>
        <CardContent>
          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Loading assets...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 py-6">
              <Alert variant="destructive">
                <AlertTitle>Unable to load assets</AlertTitle>
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
            <AssetsTable
              assets={assets}
              rooms={rooms}
              onReload={handleReload}
              onDeleted={handleDeleted}
            />
          )}
        </CardContent>

        {!isLoading && !error && (
          <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground">
              {pageMeta ? `${pageMeta.totalElements} assets` : ""}
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
