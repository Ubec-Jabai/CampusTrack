import { Suspense } from "react";
import { IncidentsPageClient } from "@/components/admin/admin-incidents-page-client";

export const instant = false;

export default function AdminIncidentsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-muted-foreground">
          Loading incidents...
        </p>
      }
    >
      <IncidentsPageClient />
    </Suspense>
  );
}
