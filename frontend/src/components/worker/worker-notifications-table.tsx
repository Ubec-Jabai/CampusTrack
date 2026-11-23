"use client";

import { Link } from "react-aria-components";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NotificationResponseDto } from "@/types/notification";

interface WorkerNotificationsTableProps {
  notifications: NotificationResponseDto[];
  updatingId: number | null;
  onMarkRead: (id: number) => void;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function WorkerNotificationsTable({
  notifications,
  updatingId,
  onMarkRead,
}: WorkerNotificationsTableProps) {
  return (
    <Table aria-label="My notifications">
      <TableHeader>
        <TableHead id="message" isRowHeader>
          Notification
        </TableHead>
        <TableHead id="status">Status</TableHead>
        <TableHead id="createdAt">Received</TableHead>
        <TableHead id="actions" className="text-right">
          Actions
        </TableHead>
      </TableHeader>
      <TableBody
        items={notifications}
        renderEmptyState={() => (
          <div className="py-10 text-center text-muted-foreground">
            You have no notifications.
          </div>
        )}
      >
        {(notification) => (
          <TableRow id={notification.id}>
            <TableCell className="max-w-96 whitespace-normal">
              {notification.incidentId === null ? (
                <span
                  className={
                    notification.readAt === null
                      ? "font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {notification.message}
                </span>
              ) : (
                <Link
                  href={`/worker/incidents?incidentId=${notification.incidentId}`}
                  className={
                    notification.readAt === null
                      ? "font-medium underline-offset-4 hover:underline"
                      : "text-muted-foreground underline-offset-4 hover:underline"
                  }
                >
                  {notification.message}
                </Link>
              )}
            </TableCell>
            <TableCell>
              {notification.readAt === null ? "Unread" : "Read"}
            </TableCell>
            <TableCell>{formatCreatedAt(notification.createdAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end">
                {notification.readAt === null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    isDisabled={updatingId === notification.id}
                    onPress={() => onMarkRead(notification.id)}
                  >
                    {updatingId === notification.id
                      ? "Saving..."
                      : "Mark as read"}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
