import { Suspense } from "react";
import { WorkerIncidentsPageClient } from "@/components/worker/worker-incidents-page-client";

export const instant = false;

export default function WorkerIncidentsPage() {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-center text-muted-foreground">
          Loading incidents...
        </p>
      }
    >
      <WorkerIncidentsPageClient />
    </Suspense>
  );
}
