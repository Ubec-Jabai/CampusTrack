"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkerNotificationsTable } from "@/components/worker/worker-notifications-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  getNotifications,
  updateNotification,
} from "@/lib/api/api-notification";
import type { NotificationResponseDto } from "@/types/notification";
import type { PageMeta } from "@/types/page";

export function WorkerNotificationsPageClient() {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    []
  );
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [markReadError, setMarkReadError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (targetPage: number) => {
    try {
      const result = await getNotifications({ page: targetPage });

      setNotifications(result.content);
      setPageMeta(result.page);
      setPage(targetPage);
      setError(null);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : "Failed to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    getNotifications({ page: 1 })
      .then((result) => {
        if (ignore) {
          return;
        }

        setNotifications(result.content);
        setPageMeta(result.page);
        setPage(1);
        setIsLoading(false);
      })
      .catch((cause: unknown) => {
        if (ignore) {
          return;
        }

        setError(
          cause instanceof Error ? cause.message : "Failed to load notifications."
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function refresh(targetPage: number) {
    setIsLoading(true);
    setError(null);
    setMarkReadError(null);
    void loadNotifications(targetPage);
  }

  async function handleMarkRead(id: number) {
    setUpdatingId(id);
    setMarkReadError(null);

    try {
      const updated = await updateNotification(id, { read: true });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === updated.id ? updated : notification
        )
      );
      toast.success("Notification marked as read.");
    } catch (cause: unknown) {
      setMarkReadError(
        cause instanceof Error
          ? cause.message
          : "Failed to mark notification as read."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = pageMeta ? Math.max(pageMeta.totalPages, 1) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground">
          Review updates about incidents assigned to you.
        </p>
      </div>

      <Card>
        <CardContent>
          {isLoading && (
            <p className="py-10 text-center text-muted-foreground">
              Loading notifications...
            </p>
          )}

          {!isLoading && error && (
            <div className="flex flex-col gap-3 py-6">
              <Alert variant="destructive">
                <AlertTitle>Unable to load notifications</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div>
                <Button
                  variant="outline"
                  onPress={() => refresh(page)}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex flex-col gap-3">
              {markReadError && (
                <p className="text-destructive">{markReadError}</p>
              )}
              <WorkerNotificationsTable
                notifications={notifications}
                updatingId={updatingId}
                onMarkRead={handleMarkRead}
              />
            </div>
          )}
        </CardContent>

        {!isLoading && !error && (
          <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:justify-between">
            <p className="text-muted-foreground">
              {pageMeta ? `${pageMeta.totalElements} notifications` : ""}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page <= 1}
                onPress={() => refresh(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                isDisabled={page >= totalPages}
                onPress={() => refresh(page + 1)}
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
