"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BuildingFormDialog } from "./building-form-dialog";
import { BuildingsTable } from "./buildings-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getBuildings, searchBuildings } from "@/lib/api/api-buildings";
import type { BuildingResponseDto } from "@/types/building";
import type { PageMeta } from "@/types/page";

interface BuildingFilters {
  name: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: BuildingFilters = {
  name: "",
  from: "",
  to: "",
};

export function BuildingsPageClient() {
  const [buildings, setBuildings] = useState<BuildingResponseDto[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BuildingFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<BuildingFilters>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBuildings = useCallback(
    async (targetPage: number, activeFilters: BuildingFilters) => {
      try {
        const hasFilters =
          activeFilters.name !== "" ||
          activeFilters.from !== "" ||
          activeFilters.to !== "";

        const result = hasFilters
          ? await searchBuildings({
              name: activeFilters.name || undefined,
              from: activeFilters.from || undefined,
              to: activeFilters.to || undefined,
              page: targetPage,
            })
          : await getBuildings({ page: targetPage });

        setBuildings(result.content);
        setPageMeta(result.page);
        setPage(targetPage);
        setError(null);
      } catch (cause: unknown) {
        setError(
          cause instanceof Error ? cause.message : "Failed to load buildings."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;

    getBuildings({ page: 1 })
      .then((result) => {
        if (ignore) {
          return;
        }

        setBuildings(result.content);
        setPageMeta(result.page);
        setPage(1);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(
          cause instanceof Error ? cause.message : "Failed to load buildings."
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function refresh(targetPage: number, activeFilters: BuildingFilters) {
    setIsLoading(true);
    setError(null);
    void loadBuildings(targetPage, activeFilters);
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
    const targetPage = buildings.length === 1 && page > 1 ? page - 1 : page;
    refresh(targetPage, appliedFilters);
  }

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Buildings</h1>
        <p className="text-muted-foreground">
          Create, update, and remove campus buildings.
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <form
          onSubmit={handleSearch}
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <Field className="sm:w-56">
            <FieldLabel htmlFor="building-filter-name">Name</FieldLabel>
            <Input
              id="building-filter-name"
              name="name"
              value={filters.name}
              maxLength={100}
              onChange={(event) =>
                setFilters({ ...filters, name: event.target.value })
              }
            />
          </Field>
          <Field className="sm:w-44">
            <FieldLabel htmlFor="building-filter-from">Created from</FieldLabel>
            <Input
              id="building-filter-from"
              name="from"
              type="date"
              value={filters.from}
              onChange={(event) =>
                setFilters({ ...filters, from: event.target.value })
              }
            />
          </Field>
          <Field className="sm:w-44">
            <FieldLabel htmlFor="building-filter-to">Created to</FieldLabel>
            <Input
              id="building-filter-to"
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
        <BuildingFormDialog
          trigger={<Button>New building</Button>}
          onSaved={handleReload}
        />
      </div>

      <Card>
        <CardContent>
          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Loading buildings...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 py-6">
              <Alert variant="destructive">
                <AlertTitle>Unable to load buildings</AlertTitle>
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
            <BuildingsTable
              buildings={buildings}
              onReload={handleReload}
              onDeleted={handleDeleted}
            />
          )}
        </CardContent>

        {!isLoading && !error && (
          <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground">
              {pageMeta ? `${pageMeta.totalElements} buildings` : ""}
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
