"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkerStatistics } from "@/lib/api/api-statistics";
import type { ProfileDto } from "@/types/profile";
import type { WorkerStatisticsResponseDto } from "@/types/statistics";

function formatName(profile: ProfileDto | null): string {
  if (!profile) {
    return "—";
  }

  const name = [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.suffix,
  ]
    .filter((part) => part !== null && part !== "")
    .join(" ");

  return name || "—";
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string | null): string {
  if (value === null) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatAvailability(value: boolean | null): string {
  if (value === null) {
    return "—";
  }

  return value ? "Available" : "Unavailable";
}

export function WorkerDashboardPageClient() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const profile = user?.profile ?? null;
  const workerId = user?.id;
  const [statistics, setStatistics] =
    useState<WorkerStatisticsResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workerId === undefined) {
      return;
    }

    let ignore = false;

    getWorkerStatistics()
      .then((result) => {
        if (ignore) {
          return;
        }

        setStatistics(result);
        setError(null);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(
          cause instanceof Error ? cause.message : "Failed to load statistics."
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [workerId]);

  function handleRetry() {
    if (workerId === undefined) {
      return;
    }

    setIsLoading(true);
    setError(null);

    getWorkerStatistics()
      .then((result) => {
        setStatistics(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error ? cause.message : "Failed to load statistics."
        );
      })
      .finally(() => setIsLoading(false));
  }

  const statCards = statistics
    ? [
        { label: "Assigned", value: statistics.assigned },
        { label: "For inspection", value: statistics.forInspection },
        { label: "Pending review", value: statistics.pendingReview },
        { label: "Approved", value: statistics.approved },
        { label: "Resolved", value: statistics.resolved },
        { label: "Rejected", value: statistics.rejected },
      ]
    : [];

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
          Sign in again to view your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Worker account details and incident totals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Worker profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Name</dt>
              <dd>{formatName(profile)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user?.email ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Role</dt>
              <dd>{user ? formatEnum(user.userRole) : "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{profile?.phone || "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Department</dt>
              <dd>{profile?.department || "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Availability</dt>
              <dd>{formatAvailability(profile?.available ?? null)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Last assigned</dt>
              <dd>
                {formatDate(profile?.lastAssignedAt ?? null)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{user ? formatDate(user.createdAt) : "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Statistics</h2>
          <p className="text-muted-foreground">
            Incidents assigned to you.
          </p>
        </div>

        {isLoading && (
          <p className="text-muted-foreground">Loading statistics...</p>
        )}

        {!isLoading && error && (
          <div className="flex flex-col gap-3">
            <Alert variant="destructive">
              <AlertTitle>Unable to load statistics</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div>
              <Button variant="outline" onPress={handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardHeader>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle>{stat.value.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
