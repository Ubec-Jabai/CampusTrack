"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WorkerIncidentDetailsDialog } from "@/components/worker/worker-incident-details-dialog";
import { WorkerIncidentsTable } from "@/components/worker/worker-incidents-table";
import { useAuth } from "@/components/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getIncident, searchIncidents } from "@/lib/api/api-incidents";
import type { IncidentResponseDto } from "@/types/incident";
import type { PageMeta } from "@/types/page";

function parseIncidentId(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
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
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workerId = user?.id;

  const loadIncidents = useCallback(
    async (targetPage: number) => {
      if (workerId === undefined) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await searchIncidents({
          assignedToId: workerId,
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

    void loadIncidents(1);
  }, [workerId, loadIncidents]);

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
                <Button variant="outline" onPress={() => loadIncidents(page)}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <WorkerIncidentsTable
              incidents={incidents}
              onUpdated={() => loadIncidents(page)}
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
                onPress={() => loadIncidents(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page >= totalPages}
                onPress={() => loadIncidents(page + 1)}
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
