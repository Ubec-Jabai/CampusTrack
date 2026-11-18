"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RoomsTable } from "@/components/admin/admin-rooms-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getRooms, searchRooms } from "@/lib/api/api-rooms";
import type { RoomResponseDto } from "@/types/room";
import type { PageMeta } from "@/types/page";

interface RoomFilters {
  roomNumber: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: RoomFilters = {
  roomNumber: "",
  from: "",
  to: "",
};

export function RoomsPageClient() {
  const [rooms, setRooms] = useState<RoomResponseDto[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RoomFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<RoomFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(
    async (targetPage: number, activeFilters: RoomFilters) => {
      try {
        const hasFilters =
          activeFilters.roomNumber !== "" ||
          activeFilters.from !== "" ||
          activeFilters.to !== "";

        const result = hasFilters
          ? await searchRooms({
              roomNumber: activeFilters.roomNumber || undefined,
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

    getRooms({ page: 1 })
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

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Rooms</h1>
        <p className="text-muted-foreground">
          Browse and search rooms across campus buildings.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        noValidate
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <Field className="sm:w-56">
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
        <Field className="sm:w-44">
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
        <Field className="sm:w-44">
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

      <Card>
        <CardContent>
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

          {!isLoading && !error && <RoomsTable rooms={rooms} />}
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
