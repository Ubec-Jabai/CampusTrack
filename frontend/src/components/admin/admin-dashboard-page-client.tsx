"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminProfile } from "@/components/admin/admin-profile-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminStatistics } from "@/lib/api/api-statistics";
import type { ProfileDto } from "@/types/profile";
import type { StatisticsResponseDto } from "@/types/statistics";

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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function AdminDashboardPageClient() {
  const user = useAdminProfile();
  const profile = user?.profile ?? null;
  const [statistics, setStatistics] = useState<StatisticsResponseDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    try {
      setStatistics(await getAdminStatistics());
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to load statistics."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    void loadStatistics();
  }

  useEffect(() => {
    let ignore = false;

    getAdminStatistics()
      .then((result) => {
        if (ignore) {
          return;
        }

        setStatistics(result);
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
  }, []);

  const statCards = statistics
    ? [
        { label: "Buildings", value: statistics.buildings },
        { label: "Rooms", value: statistics.rooms },
        { label: "Assets", value: statistics.assets },
        { label: "Incidents", value: statistics.incidents },
        { label: "Users", value: statistics.users },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Admin account details and campus record totals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin profile</CardTitle>
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
            Totals across all campus records.
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
